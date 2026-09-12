import { expect, test } from "@playwright/test";
import nodes from "../../src/data/atlas-nodes.json" with { type: "json" };
import relations from "../../src/data/atlas-relations.json" with { type: "json" };

const inspector = "[data-history-inspector]";
test("overview preserves the complete catalog and keeps positions stable while exploring", async ({
  page,
}) => {
  await page.goto("./atlas/");
  await expect(page.locator("[data-history-node]")).toHaveCount(nodes.length);
  await expect(page.locator("[data-history-entry]")).toHaveCount(nodes.length);
  const positions = () =>
    page
      .locator("[data-history-node]")
      .evaluateAll((items) =>
        items.map((item) => ({
          id: item.getAttribute("data-history-node"),
          x: (item as HTMLElement).offsetLeft,
          y: (item as HTMLElement).offsetTop,
        })),
      );
  const before = await positions();
  await page.locator('[data-history-route="runs"]').click();
  await expect(page.locator(inspector)).toContainText("失败之后，什么留下来");
  await expect(
    page.locator('[data-history-node][data-emphasis="true"]'),
  ).toHaveCount(12);
  expect(await positions()).toEqual(before);
  await page.locator("[data-history-reset]").click();
  await expect(
    page.locator('[data-history-node][data-emphasis="true"]'),
  ).toHaveCount(nodes.length);
});

test("follows actual cross-genre edges and restores selection through browser history", async ({
  page,
}) => {
  await page.goto("./atlas/#atlas-node-detail-spelunky");
  await expect(
    page
      .locator(inspector)
      .getByRole("heading", { name: "Spelunky", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-history-edge]")).toHaveCount(
    relations.filter((r) => r.fromId === "spelunky" || r.toId === "spelunky")
      .length,
  );
  await page
    .locator(inspector)
    .getByRole("link", { name: "Hades", exact: true })
    .click();
  await expect(
    page
      .locator(inspector)
      .getByRole("heading", { name: "Hades", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveURL(/#atlas-node-detail-hades$/);
  await page.goBack();
  await expect(
    page
      .locator(inspector)
      .getByRole("heading", { name: "Spelunky", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(inspector)).toContainText("Derek Yu");
});

test("search has an honest empty state and reset recovers every object", async ({
  page,
}) => {
  await page.goto("./atlas/");
  await page.locator("[data-history-search]").fill("this-game-does-not-exist");
  await expect(page.locator("[data-history-status]")).toContainText(
    "0 个匹配对象",
  );
  await expect(page.locator("[data-history-node]")).toHaveCount(nodes.length);
  await page.locator("[data-history-reset]").click();
  await page.locator("[data-history-track]").selectOption("physical");
  await expect(
    page.locator('[data-history-node][data-emphasis="true"]'),
  ).toHaveCount(3);
  await page.locator("[data-history-reset]").click();
  await expect(
    page.locator('[data-history-node][data-emphasis="true"]'),
  ).toHaveCount(nodes.length);
});

test("new museum anchors expose their bounded source without claiming influence", async ({
  page,
}) => {
  await page.goto("./atlas/#atlas-node-detail-minecraft");
  await expect(page.locator(inspector)).toContainText("早期公开版");
  await expect(page.locator(inspector)).toContainText(
    "结构相似，影响未知",
  );
  await expect(
    page.locator(inspector).getByRole("link", { name: /Graphics & Games/ }),
  ).toHaveAttribute(
    "href",
    "https://www.computerhistory.org/timeline/graphics-games/",
  );
  await expect(page.locator("[data-history-edge]")).toHaveCount(1);
});

for (const theme of ["light", "dark"])
  test(`320px ${theme} has no page overflow and keeps details readable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.emulateMedia({ colorScheme: theme as "light" | "dark" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./atlas/#atlas-node-detail-dead-cells");
    await expect(
      page
        .locator(inspector)
        .getByRole("heading", { name: "Dead Cells", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    expect(
      await page
        .locator(inspector)
        .evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBe(true);
    const selectedBox = await page.locator('[data-history-node="dead-cells"]').boundingBox();
    const panelBox = await page.locator(inspector).boundingBox();
    expect(selectedBox!.y + selectedBox!.height).toBeLessThanOrEqual(panelBox!.y);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/history-320-${theme}.png`,
      fullPage: true,
    });
  });

test("no JavaScript retains readable eras, relationships and sources", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 760 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4321/Learn-About-Games/atlas/");
  await expect(page.locator("[data-history-search]")).toBeDisabled();
  await page
    .locator("[data-history-era]")
    .filter({ hasText: "1990s" })
    .locator(":scope > summary")
    .click();
  const entry = page.locator('[data-history-entry="diablo"]');
  await entry.locator(":scope > summary").click();
  await expect(entry).toContainText("Brevik");
  await expect(
    entry.getByRole("link", { name: /David Brevik/ }).first(),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
  await context.close();
});

test('legacy relation bookmarks reach the same evidence and return to the overview', async ({page})=>{
  await page.goto('./atlas/#atlas-relation-detail-rogue-to-hack');
  await expect(page).toHaveURL(/\/atlas\/network\/#atlas-relation-detail-rogue-to-hack$/);
  await expect(page.locator('[data-atlas-relation-detail="rogue-to-hack"]')).toHaveCount(1);
  await page.getByRole('link',{name:'← 返回历史总览'}).click();
  await expect(page.locator('[data-history]')).toBeVisible();
});

test('keyboard selection announces current object and Escape restores the map focus', async ({page})=>{
  await page.goto('./atlas/');
  const node=page.locator('[data-history-node="rogue"]');
  await node.focus(); await page.keyboard.press('Enter');
  await expect(node).toHaveAttribute('aria-current','true');
  await expect(page.locator(inspector)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator(inspector)).toBeHidden();
  await expect(node).toBeFocused();
  await expect(node).not.toHaveAttribute('aria-current','true');
});

test('new branches preserve Chinese sources and trace a recent documented influence', async({page})=>{
  await page.goto('./atlas/#atlas-node-detail-jx3-yidai-zongshi');
  await expect(page.locator(inspector)).toContainText('2011');
  await expect(page.locator(inspector)).toContainText('剑网3官方版本大事记');
  await page.locator('[data-history-close]').click();
  await page.locator('[data-history-track]').selectOption('cards');
  await expect(page.locator('[data-history-results]')).toContainText('Balatro');
  await page.locator('[data-history-results] [data-history-jump="balatro"]').click();
  await expect(page.locator(inspector)).toContainText('LocalThunk');
  await page.locator(inspector).getByRole('link',{name:'Luck be a Landlord（早期版）',exact:true}).click();
  await expect(page.locator('#history-inspector-title')).toHaveText('Luck be a Landlord（早期版）');
});

test('recent right-edge nodes stay visible beside the source inspector', async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await page.goto('./atlas/#atlas-node-detail-balatro');
  const node=await page.locator('[data-history-node="balatro"]').boundingBox();
  const panel=await page.locator(inspector).boundingBox();
  expect(node).not.toBeNull(); expect(panel).not.toBeNull();
  expect(node!.x >= panel!.x + panel!.width || node!.x + node!.width <= panel!.x || node!.y >= panel!.y + panel!.height || node!.y + node!.height <= panel!.y).toBe(true);
  await expect(page.locator('#history-inspector-title')).toHaveText('Balatro');
});
