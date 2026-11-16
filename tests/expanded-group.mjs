// FR-12: utvidet gruppevisning.
import { importAndChooseGroups, readStore } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'epics-and-groups.csv', ['GrpA', 'GrpB']);
  const dropGroupOfExpanded = () => page.locator('.group--expanded').getAttribute('data-drop-group');

  eq('normal view shows both groups', await page.locator('.group').count(), 2);
  await page.click('[data-expand-group="GrpB"]');
  await page.waitForTimeout(200);
  eq('expanded view shows one group', await page.locator('.group').count(), 1);
  eq('it is the chosen group', await dropGroupOfExpanded(), 'GrpB');
  eq('issue count is unchanged by placeholders', (await page.locator('.group--expanded .group__count').textContent()).trim(), '(4)');

  eq('epic in another group is shown as placeholder', await page.locator('.epic-placeholder').getAttribute('data-placeholder-epic-key'), 'T-1');
  eq('its child in this group is shown under it',
    await page.locator('.epic-placeholder .card').evaluateAll(cards => cards.map(card => card.dataset.issueKey)), ['T-3']);
  check('placeholder says where the epic is', (await page.locator('.epic-placeholder').textContent()).includes('«GrpA»'));
  eq('placeholder is not a selectable card', await page.locator('.card[data-issue-key="T-1"]').count(), 0);
  eq('children of a real epic are folded out without toggling',
    await page.locator('.card[data-issue-key="T-6"] .card[data-issue-key="T-7"]').count(), 1);
  eq('order: epics by key, then issues without epic',
    await page.locator('.group__body > *').evaluateAll(els => els.map(el => el.dataset.placeholderEpicKey ?? el.dataset.issueKey)),
    ['T-1', 'T-6', 'T-5']);
  const bounds = await page.evaluate(() => ({
    group: document.querySelector('.group--expanded').getBoundingClientRect().bottom,
    board: document.getElementById('board').getBoundingClientRect().bottom,
  }));
  check('expanded group fits inside the board', bounds.group <= bounds.board + 1, JSON.stringify(bounds));
  eq('saved fold state is untouched', (await readStore(page)).settings.expandedEpicKeys, []);

  await page.click('.target-chip:has-text("GrpA")');
  await page.waitForTimeout(200);
  eq('clicking another group in the strip switches', await dropGroupOfExpanded(), 'GrpA');
  eq('child nested under its epic in the same group', await page.locator('.card[data-issue-key="T-1"] .card[data-issue-key="T-2"]').count(), 1);
  eq('no placeholder when the epic is in the group', await page.locator('.epic-placeholder').count(), 0);

  await page.click('.card[data-issue-key="T-2"]');
  await page.keyboard.press('2');
  await page.waitForTimeout(200);
  eq('keyboard move works from the expanded view', (await readStore(page)).placementByIssueKey['T-2'], 'GrpB');

  await page.reload();
  await page.waitForTimeout(300);
  eq('expanded group is restored after reload', await page.locator('.group--expanded').count(), 1);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  eq('Esc returns to the normal view', await page.locator('.group').count(), 2);
  eq('no expanded group left', await page.locator('.group--expanded').count(), 0);

  await page.click('[data-expand-group="GrpA"]');
  await page.click('.group--expanded [data-remove-group]');
  await page.waitForTimeout(300);
  const confirmButton = page.locator('#dialog button.is-primary');
  if (await confirmButton.count()) await confirmButton.click();
  await page.waitForTimeout(300);
  eq('removing the expanded group returns to the normal view', await page.locator('.group--expanded').count(), 0);
}
