// FR-7.3 og FR-11.5: filteret i Usortert påvirker bare visningen. En epic tar med alle barna sine, også de som er filtrert bort.
import { importAndChooseGroups, readStore } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'move-epic.csv', []);
  page.once('dialog', dialog => dialog.accept('Target'));
  await page.click('#new-group-button');
  await page.waitForTimeout(300);

  await page.click('#unsorted-type-filter .chip:has-text("Task")');
  await page.waitForTimeout(200);
  await page.click('#unsorted-list [data-toggle-epic="E-1"]');
  const toggleText = await page.locator('#unsorted-list [data-toggle-epic="E-1"]').innerText();
  // Epicen vises bare fordi C-2 (Task) treffer. De to andre barna er filtrert bort.
  check('two children are hidden by the filter', toggleText.includes('(1 vises)'), toggleText);
  eq('only the matching child is visible',
    await page.locator('#unsorted-list .card[data-issue-key^="C-"]').evaluateAll(cards => cards.map(card => card.dataset.issueKey)), ['C-2']);

  await page.click('#unsorted-list .card[data-issue-key="E-1"]', { position: { x: 20, y: 6 } });
  await page.keyboard.press('1');
  await page.waitForTimeout(300);
  eq('no question is asked when no child is elsewhere', await page.locator('#dialog[open]').count(), 0);

  const placed = (await readStore(page)).placementByIssueKey;
  for (const key of ['E-1', 'C-1', 'C-2', 'C-3']) eq(`${key} moved to Target`, placed[key], 'Target');
  eq('unrelated issue stays', placed['U-1'], undefined);
}
