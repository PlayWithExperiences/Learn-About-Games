import { expect, test } from '@playwright/test';
import { fixture } from '../lib/ecosystem-fixture';
import { ecosystemUrl } from '../../src/lib/ecosystem/contract';

test('native centres filter and connect to the same public institutions and programmes',async({page})=>{
  const requested: string[]=[];
  await page.route(ecosystemUrl,route=>{requested.push(route.request().url());return route.fulfill({json:fixture});});
  await page.goto('./ecosystem/?fit=PRIVATE_SENTINEL');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('[data-centre-id]')).toHaveCount(3);
  await expect(page.getByText('拟建',{exact:false}).first()).toBeVisible();
  await page.getByLabel('国家／地区',{exact:true}).selectOption('Canada');
  await expect(page.locator('[data-centre-id]')).toHaveCount(2);
  await page.getByRole('button',{name:'清除筛选'}).click();
  await page.getByRole('button',{name:'查看关联机构与学位项目'}).click();
  await expect(page.getByRole('heading',{name:'Example University',exact:true})).toBeVisible();
  await page.getByText('1 个已收录学位项目',{exact:true}).click();
  await expect(page.getByRole('link',{name:'博士 · Game Research PhD'})).toHaveAttribute('href','https://example.edu/phd');
  await page.getByRole('button',{name:'查看 1 个关联中心'}).click();
  await expect(page.locator('[data-centre-id]')).toHaveCount(1);
  expect(requested).toEqual([ecosystemUrl]);
});

test('source failure stays visibly unavailable rather than an empty directory',async({page})=>{
  await page.route(ecosystemUrl,route=>route.fulfill({status:503,body:'unavailable'}));
  await page.goto('./ecosystem/');
  await expect(page.getByRole('alert')).toContainText('读取失败');
  await expect(page.locator('[data-result-count]')).toContainText('数量未知');
  await expect(page.getByRole('button',{name:'重新读取目录'})).toBeVisible();
});

test('the native filter area leaves room for multiple records on a short screen',async({page})=>{
  await page.setViewportSize({width:1280,height:720});
  await page.route(ecosystemUrl,route=>route.fulfill({json:fixture}));
  await page.goto('./ecosystem/');
  await expect(page.locator('[data-centre-id]')).toHaveCount(3);
  const height=await page.locator('[data-filters]').evaluate(e=>e.getBoundingClientRect().height);
  expect(height).toBeLessThan(180);
  await expect(page.locator('[data-centre-id]').nth(1)).toBeInViewport();
});
