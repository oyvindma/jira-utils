// FR-7.6: valgt epic utheves med barna, uansett hvilken gruppe de ligger i. Resten dimmes.
import { importAndChooseGroups } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'epics-and-groups.csv', ['GrpA', 'GrpB']);
  await page.click('[data-toggle-epic="T-1"]');
  await page.click('[data-toggle-epic="T-6"]');

  await page.locator('.card[data-issue-key="T-1"]').first().click({ position: { x: 20, y: 6 } });
  await page.waitForTimeout(200);
  const classes = await page.evaluate(() => Object.fromEntries(
    [...document.querySelectorAll('.card')].map(card => [card.dataset.issueKey, [...card.classList].join(' ')])));

  check('epic is selected', classes['T-1'].includes('is-selected'));
  for (const key of ['T-2', 'T-3', 'T-4']) {
    check(`${key} (child in same group / other group / Usortert) is highlighted`, classes[key]?.includes('is-highlighted-child'), classes[key]);
  }
  for (const key of ['T-5', 'T-6', 'T-7']) {
    check(`${key} (unrelated) is dimmed and not highlighted`, classes[key]?.includes('is-dimmed') && !classes[key].includes('is-highlighted-child'), classes[key]);
  }
}
