// @ts-expect-error The application tsconfig intentionally omits Node builtin declarations.
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the 2026-09-29 ledger loss.
 *
 * `main()` binds `state` to the producer's state DIRECTORY. The mid-item deck-throttle
 * re-probe then rebound that same name to the deck gate's JSON payload, so the failure
 * handler passed a dict's repr as `--state-dir`. The producer `fail` therefore wrote
 * somewhere else, and because that call uses `check=False` the error was swallowed.
 *
 * Observed cost: two already-claimed candidates (a deck throttle hit inside the item,
 * after the pre-claim gate had said "available") printed `ITEM_FAIL stage=generation`
 * and then sat in the ledger as `generating` forever. The invariant the skill cares
 * about is that every claimed candidate ends as `ready` or a `failed` carrying a stage
 * and a reason, so a silently dropped `fail` is data loss, not a cosmetic bug.
 *
 * The check reads the real runner and asserts on its actual bindings, so re-introducing
 * the shadowing fails here rather than in a production batch.
 */

const RUNNER_PATH = decodeURIComponent(
  new URL('../../automation/run-notebooklm-item.py', import.meta.url).pathname,
);

interface RunnerFacts {
  state_assignment_lines: number[];
  first_binding_is_path: boolean;
  state_dir_call_lines: number[];
}

const ANALYZER = `
import ast, json, sys

tree = ast.parse(open(sys.argv[1], encoding="utf-8").read())
main = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == "main")

assigns = []
for node in ast.walk(main):
    if isinstance(node, ast.Assign):
        if any(isinstance(t, ast.Name) and t.id == "state" for t in node.targets):
            assigns.append(node)

first_is_path = bool(
    assigns
    and isinstance(assigns[0].value, ast.Call)
    and isinstance(assigns[0].value.func, ast.Name)
    and assigns[0].value.func.id == "Path"
)

# Producer calls pass ["--state-dir", str(state), ...] as a list literal, so the flag is
# not a direct Call argument. Record every --state-dir flag that is followed by str(state).
parent = {}
for node in ast.walk(main):
    for child in ast.iter_child_nodes(node):
        parent[child] = node

state_dir_calls = []
for node in ast.walk(main):
    if not (isinstance(node, ast.Constant) and node.value == "--state-dir"):
        continue
    container = parent.get(node)
    if isinstance(container, ast.List):
        elts = container.elts
        idx = next((i for i, e in enumerate(elts) if e is node), None)
        if idx is not None and idx + 1 < len(elts) and ast.unparse(elts[idx + 1]) == "str(state)":
            state_dir_calls.append(node.lineno)

print(json.dumps({
    "state_assignment_lines": sorted(n.lineno for n in assigns),
    "first_binding_is_path": first_is_path,
    "state_dir_call_lines": sorted(state_dir_calls),
}))
`;

function analyzeRunner(): RunnerFacts {
  const stdout = execFileSync('python3', ['-c', ANALYZER, RUNNER_PATH], { encoding: 'utf8' });
  return JSON.parse(stdout.trim().split('\n').slice(-1)[0]) as RunnerFacts;
}

describe('NotebookLM item runner state directory', () => {
  const facts = analyzeRunner();

  it('binds `state` to the producer state directory', () => {
    expect(facts.state_assignment_lines.length).toBeGreaterThan(0);
    expect(
      facts.first_binding_is_path,
      'the first binding of \`state\` in main() must be Path(args.state_dir)',
    ).toBe(true);
  });

  it('never rebinds `state` after the state directory (no shadowing)', () => {
    expect(
      facts.state_assignment_lines.length,
      '`state` is rebound somewhere in main(); the directory binding is shadowed, which ' +
        'silently corrupts every later --state-dir argument',
    ).toBe(1);
  });

  it('passes the state directory to both the publish and fail producer calls', () => {
    expect(facts.state_dir_call_lines.length).toBeGreaterThanOrEqual(2);
  });
});

