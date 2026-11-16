// FR-7.7, FR-7.8: et barn utenfor epicens gruppe har et epic-merke. Klikk på merket utheves epicen og alle barna.
import { importAndChooseGroups } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'epic-label-not-inherited.csv', ['Leveranse1', 'Leveranse2']);
  await page.click('[data-toggle-epic="E-1"]');

  const badgeKeys = await page.locator('.card:has([data-select-epic])').evaluateAll(cards => cards.map(card => card.dataset.issueKey).sort());
  eq('only children outside the epic group have a badge', badgeKeys, ['C-1', 'C-2', 'C-4']);
  eq('badge shows the epic key', (await page.locator('.card[data-issue-key="C-1"] [data-select-epic]').innerText()).includes('E-1'), true);

  await page.locator('.card[data-issue-key="C-1"] [data-select-epic]').click();
  await page.waitForTimeout(200);
  const classes = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('.card')].map(card => [card.dataset.issueKey, [...card.classList].join(' ')])));
  check('epic is selected', classes['E-1'].includes('is-selected'), classes['E-1']);
  for (const key of ['C-1', 'C-2', 'C-3', 'C-4']) {
    check(`${key} is highlighted as child`, classes[key].includes('is-highlighted-child'), classes[key]);
    check(`${key} is not dimmed`, !classes[key].includes('is-dimmed'), classes[key]);
  }
  eq('the clicked child is not selected, only the epic', await page.locator('.card.is-selected').count(), 1);
}
