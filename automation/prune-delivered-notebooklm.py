#!/usr/bin/env python3
"""Release local NotebookLM duplicates after verifying the remote delivery."""

import argparse
from collections import Counter
from datetime import datetime
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import tarfile
from urllib.parse import unquote, urlsplit
from zoneinfo import ZoneInfo


STATE = Path.home() / ".local/state/learn-about-games/notebooklm-daily"
MENTOR = Path(__file__).resolve().parents[2] / "AI-Life-Mentor"
MENTOR_ORIGINS = {
    "https://github.com/medill-east/ai-life-mentor",
    "git@github.com:medill-east/ai-life-mentor",
}
ARTIFACTS = ("infographic", "mind_map", "slide_deck")
MEDIA_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".pptx", ".pdf"}
OID = re.compile(r"[0-9a-f]{40}")


def command(*args, timeout=30):
    return subprocess.run(args, capture_output=True, check=True, timeout=timeout).stdout


def git(repo, *args):
    return command("git", "--no-optional-locks", "-C", str(repo), *args)


def has_mentor_origin(repo):
    origin = git(repo, "remote", "get-url", "origin").decode().strip().lower().removesuffix(".git")
    return origin in MENTOR_ORIGINS


def mentor_snapshot(repo):
    if not has_mentor_origin(repo):
        raise ValueError("AI-Life-Mentor origin 不匹配")
    ref = git(repo, "ls-remote", "--exit-code", "origin", "refs/heads/main").decode().split()
    if len(ref) != 2 or ref[1] != "refs/heads/main" or not OID.fullmatch(ref[0]):
        raise ValueError("AI-Life-Mentor 远端 main 未核对")
    try:
        git(repo, "cat-file", "-e", ref[0] + "^{commit}")
    except subprocess.CalledProcessError:
        git(repo, "fetch", "--no-tags", "--no-recurse-submodules", "origin", "main")
    git(repo, "cat-file", "-e", ref[0] + "^{commit}")
    return ref[0]


def delivery_key(record):
    source = record["source"]["url"]
    urls = tuple(record["artifacts"][name]["url"] for name in ARTIFACTS)
    if not isinstance(source, str) or not source or any(not isinstance(url, str) or not url for url in urls):
        raise ValueError("来源或附件地址缺失")
    return source, urls


def delivered_records(repo, revision):
    archived = git(repo, "archive", "--format=tar", revision, "notebooklm-resources")
    records = set()
    with tarfile.open(fileobj=io.BytesIO(archived)) as archive:
        for member in archive:
            if not member.isfile() or not member.name.endswith(".json"):
                continue
            try:
                record = json.load(archive.extractfile(member))
                if record.get("producer_status") == "ready":
                    records.add(delivery_key(record))
            except (KeyError, AttributeError, TypeError, ValueError):
                continue
    if not records:
        raise ValueError("远端没有可用于核对的交付记录")
    return records


def artifact_snapshot():
    repo = "repos/Medill-East/IMGStorage"
    remote = "https://github.com/Medill-East/IMGStorage.git"
    ref = command("git", "ls-remote", "--exit-code", remote, "refs/heads/master").decode().split()
    if len(ref) != 2 or ref[1] != "refs/heads/master" or not OID.fullmatch(ref[0]):
        raise ValueError("图床远端 master 未核对")
    tree = json.loads(command("gh", "api", repo + "/git/trees/" + ref[0]))
    if tree.get("truncated") is not False or not tree.get("tree"):
        raise ValueError("图床文件列表不完整")
    blobs = {entry["path"]: (entry["size"], entry["sha"]) for entry in tree["tree"] if entry.get("type") == "blob"}
    return ref[0], blobs


def artifact_blob(url, revision, blobs):
    parsed = urlsplit(url)
    parts = unquote(parsed.path).split("/")
    if parsed.scheme != "https" or parsed.netloc != "raw.githubusercontent.com" or parsed.query or parsed.fragment:
        return None
    if len(parts) < 5 or parts[1:3] != ["Medill-East", "IMGStorage"] or parts[3] not in {"master", revision}:
        return None
    if any(part in {"", ".", ".."} for part in parts[4:]):
        return None
    return blobs.get("/".join(parts[4:]))


def walk_files(directory):
    for root, dirs, files in os.walk(directory, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in {".git", "publisher-clone"} and not (Path(root) / d).is_symlink())
        for name in sorted(files):
            file = Path(root) / name
            if not file.is_symlink():
                yield file


def same_file(info, checked):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns) == (
        checked.st_dev, checked.st_ino, checked.st_size, checked.st_mtime_ns, checked.st_ctime_ns
    )


def git_blob(file, size):
    digest = hashlib.sha1(f"blob {size}\0".encode())
    with file.open("rb") as data:
        for block in iter(lambda: data.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def delivered_blobs(urls, revision, blobs):
    copies = {artifact_blob(url, revision, blobs): url for url in urls}
    return {} if None in copies else copies


def duplicate_media(batch, records, revision, blobs, historical=False):
    files = list(walk_files(batch))
    verified_items = {}
    if historical:
        # Old runs may not have per-item result.json. Their finished, identical
        # bytes can still be recovered through the current published references.
        verified_items[batch] = {}
        for _, urls in sorted(records):
            verified_items[batch].update(delivered_blobs(urls, revision, blobs))
    for result in (file for file in files if file.name == "result.json"):
        try:
            key = delivery_key(json.loads(result.read_text(encoding="utf-8")))
            if key in records:
                verified_items.setdefault(result.parent, {}).update(delivered_blobs(key[1], revision, blobs))
        except (OSError, KeyError, TypeError, ValueError):
            continue
    for file in files:
        if file.suffix.lower() not in MEDIA_SUFFIXES:
            continue
        expected = next((verified_items[parent] for parent in file.parents if verified_items.get(parent)), None)
        if not expected:
            continue
        info = file.lstat()
        if not stat.S_ISREG(info.st_mode) or not any(size == info.st_size for size, _ in expected):
            continue
        blob = git_blob(file, info.st_size)
        if (info.st_size, blob) in expected and same_file(file.lstat(), info):
            yield file, info, blob, expected[info.st_size, blob]


def closed_batch(batch):
    report = batch / "batch-report.json"
    if report.is_symlink():
        return False
    try:
        data = json.loads(report.read_text(encoding="utf-8"))
        return bool(data.get("stop_reason"))
    except (OSError, ValueError, AttributeError):
        return False


def safe_clone(clone, mentor, remote):
    git_dir = clone / ".git"
    if clone.is_symlink() or git_dir.is_symlink() or not git_dir.is_dir():
        return False
    if not has_mentor_origin(clone):
        return False
    if any((git_dir / name).exists() for name in ("MERGE_HEAD", "CHERRY_PICK_HEAD", "rebase-merge", "rebase-apply", "worktrees", "index.lock")):
        return False
    if git(clone, "status", "--porcelain=v1", "--untracked-files=all", "--ignored=matching").strip():
        return False
    refs = git(clone, "for-each-ref", "--format=%(refname) %(objectname)").decode().splitlines()
    commits = {git(clone, "rev-parse", "HEAD").decode().strip()}
    for ref in refs:
        name, oid = ref.split()
        if name not in {"refs/heads/main", "refs/remotes/origin/main", "refs/remotes/origin/HEAD"}:
            return False
        commits.add(oid)
    for oid in commits:
        try:
            git(mentor, "merge-base", "--is-ancestor", oid, remote)
        except subprocess.CalledProcessError:
            return False
    return True


def allocated(directory):
    return sum((Path(root) / name).lstat().st_blocks * 512
               for root, _, files in os.walk(directory, followlinks=False) for name in files)


def receipt(path, value):
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.chmod(0o600)
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-dir", type=Path, default=Path(os.environ.get("LAG_NOTEBOOKLM_STATE_DIR", STATE)))
    parser.add_argument("--mentor-root", type=Path, default=Path(os.environ.get("LAG_AI_MENTOR_ROOT", MENTOR)))
    parser.add_argument("--batch-dir", type=Path, help="当前已结束并写完 batch-report.json 的批次")
    parser.add_argument("--apply", action="store_true", help="实际删除已证明为远端副本的本地文件")
    args = parser.parse_args()
    runs_path = args.state_dir / "runs"
    if runs_path.is_symlink():
        parser.error("runs 不能是符号链接")
    runs = runs_path.resolve(strict=True)
    mentor = args.mentor_root.resolve(strict=True)
    now = datetime.now(ZoneInfo("Asia/Shanghai"))
    if args.batch_dir:
        batch = args.batch_dir.absolute()
        if batch.parent != runs or batch.is_symlink() or not closed_batch(batch):
            parser.error("批次必须是 runs 的直接子目录，且已写完批次报告")
        batches = [batch]
    else:
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
        batches = [batch for batch in sorted(runs.iterdir()) if batch.is_dir() and not batch.is_symlink()
                   and batch.stat().st_mtime < midnight]
    remote = mentor_snapshot(mentor)
    issues = []
    try:
        records = delivered_records(mentor, remote)
        revision, blobs = artifact_snapshot()
    except (OSError, ValueError, subprocess.SubprocessError) as exc:
        stderr = getattr(exc, "stderr", b"")
        detail = stderr.decode(errors="replace").strip().splitlines()[-1] if stderr and stderr.strip() else str(exc)
        issues.append("远端附件核对失败，保留全部媒体文件。 " + detail[:300])
        records, revision, blobs = set(), None, {}
    plan = []
    for batch in batches:
        if records:
            for file, info, blob, url in duplicate_media(batch, records, revision, blobs, historical=not args.batch_dir):
                plan.append((file, info, {"kind": "artifact", "path": str(file.relative_to(runs)),
                                          "blob": blob, "url": url, "allocated_bytes": info.st_blocks * 512,
                                          "status": "verified"}))
        clone = batch / "publisher-clone"
        if clone.is_dir() and closed_batch(batch) and safe_clone(clone, mentor, remote):
            plan.append((clone, clone.lstat(), {"kind": "publisher-clone", "path": str(clone.relative_to(runs)),
                                                "allocated_bytes": allocated(clone), "status": "verified"}))
    outcome = {"at": now.isoformat(), "mentor_commit": remote, "artifact_commit": revision, "issues": issues,
               "mode": "apply" if args.apply else "preview", "entries": [entry for _, _, entry in plan]}
    if args.apply:
        output = runs.parent / ("retention-" + now.strftime("%Y%m%dT%H%M%S%f") + ".json")
        receipt(output, outcome)
        for file, info, entry in plan:
            try:
                if file.is_symlink() or not file.resolve().is_relative_to(runs) or not same_file(file.lstat(), info):
                    entry["status"] = "changed"
                elif entry["kind"] == "publisher-clone":
                    if safe_clone(file, mentor, remote):
                        shutil.rmtree(file)
                        entry["status"] = "removed"
                    else:
                        entry["status"] = "changed"
                else:
                    file.unlink()
                    entry["status"] = "removed"
            except (OSError, subprocess.SubprocessError) as exc:
                entry["status"] = "failed"
                entry["error"] = str(exc)
        receipt(output, outcome)
    counted = "removed" if args.apply else "verified"
    acted = [entry for entry in outcome["entries"] if entry["status"] == counted]
    print(json.dumps({"mode": outcome["mode"], "counts": dict(Counter(entry["kind"] for entry in acted)),
                      "allocated_bytes": sum(entry["allocated_bytes"] for entry in acted),
                      "statuses": dict(Counter(entry["status"] for entry in outcome["entries"])),
                      "issues": issues,
                      **({"receipt": str(output)} if args.apply else {})}, ensure_ascii=False))
    return int(bool(issues) or (args.apply and len(acted) != len(plan)))


if __name__ == "__main__":
    raise SystemExit(main())
