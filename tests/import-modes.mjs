// FR-2.9 til FR-2.12: slå sammen, erstatt eller avbryt når tavla allerede har data.
import { importAndChooseGroups, importFixture, groupShortcut, readStore, dialogText } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  const issueCount = async () => Object.keys((await readStore(page)).issuesByKey).length;
  const importUpdate = async () => {
    await importFixture(page, 'import-update.csv');
    await page.waitForSelector('#dialog[open]');
  };

  // FR-2.9: på tom tavle spørres det ikke. FR-2.12: innstillingene åpnes etter «erstatt».
  await importAndChooseGroups(page, 'import-base.csv', ['GrpA', 'GrpB']);
  eq('first import needs no merge/replace question', await page.locator('#dialog[open]').count(), 0);
  let { placementByIssueKey: placed } = await readStore(page);
  eq('E-1 placed by its label', placed['E-1'], 'GrpA');
  eq('S-1 placed by its label', placed['S-1'], 'GrpA');
  eq('S-2 placed by its label', placed['S-2'], 'GrpB');
  eq('issue without group label is unsorted', placed['S-3'], undefined);

  // Brukeren flytter S-2 selv, bretter ut en epic, skrur på kompakte kort og skriver i søkefeltet.
  await page.click('.card[data-issue-key="S-2"]');
  await page.keyboard.press(await groupShortcut(page, 'GrpA'));
  await page.waitForTimeout(200);
  await page.click('[data-toggle-epic="E-1"]');
  await page.check('#compact-toggle');
  await page.fill('#unsorted-search', 'noe');
  await page.waitForTimeout(200);
  let store = await readStore(page);
  eq('S-2 was moved by the user', store.placementByIssueKey['S-2'], 'GrpA');
  eq('epic is folded out', store.settings.expandedEpicKeys, ['E-1']);
  eq('undo is available', await page.locator('#undo-button').isDisabled(), false);

  // FR-2.9: tre valg
  await importUpdate();
  const buttons = await page.locator('#dialog button').allInnerTexts();
  eq('dialog offers cancel, replace and merge', buttons.map(text => text.trim()), ['Avbryt', 'Erstatt alt', 'Slå sammen']);
  check('dialog explains the choices', (await dialogText(page)).includes('Slå sammen'));

  // Avbryt: ingenting endres
  await page.click('#dialog button:has-text("Avbryt")');
  await page.waitForTimeout(200);
  store = await readStore(page);
  eq('cancel keeps old summary', store.issuesByKey['S-1'].summary, 'Story one');
  eq('cancel adds no new issue', store.issuesByKey['N-1'], undefined);
  eq('cancel keeps placements', store.placementByIssueKey['S-2'], 'GrpA');
  eq('cancel keeps the undo history', await page.locator('#undo-button').isDisabled(), false);

  // FR-2.10: slå sammen
  await importUpdate();
  await page.click('#dialog button:has-text("Slå sammen")');
  await page.waitForTimeout(300);
  store = await readStore(page);
  eq('merge updates issue data', store.issuesByKey['S-1'].summary, 'Story one UPDATED');
  eq('merge updates labels', store.issuesByKey['S-1'].labels, ['GrpB']);
  eq('merge adds new issue', store.issuesByKey['N-1']?.summary, 'New in the second file');
  eq('manually placed issue keeps its placement', store.placementByIssueKey['S-2'], 'GrpA');
  eq('automatically placed issue follows its new label', store.placementByIssueKey['S-1'], 'GrpB');
  eq('new issue is placed by label', store.placementByIssueKey['N-1'], 'GrpB');
  eq('issues missing from the new file are kept', store.issuesByKey['S-3']?.summary, 'Only in the first file');
  eq('groups are kept', store.groups, ['GrpA', 'GrpB']);
  eq('merge does not open the settings panel', await page.locator('#settings-panel:not([hidden])').count(), 0);
  eq('merge clears the undo history', await page.locator('#undo-button').isDisabled(), true);

  // FR-2.11: erstatt alt
  await page.fill('#unsorted-search', 'noe');
  await page.waitForTimeout(200);
  await importUpdate();
  await page.click('#dialog button:has-text("Erstatt alt")');
  await page.waitForSelector('#settings-panel:not([hidden])');
  store = await readStore(page);
  eq('replace rebuilds issues from the file only', Object.keys(store.issuesByKey).sort(), ['E-1', 'N-1', 'S-1', 'S-2']);
  eq('replace clears groups', store.groups, []);
  eq('replace clears placements', store.placementByIssueKey, {});
  eq('replace clears manual placements', store.manuallyPlacedIssueKeys, []);
  eq('replace resets folded-out epics', store.settings.expandedEpicKeys, []);
  eq('replace resets the Usortert filter', store.settings.unsortedFilter.searchText, '');
  eq('replace keeps other display settings', store.settings.compactCards, true);
  eq('replace clears the undo history', await page.locator('#undo-button').isDisabled(), true);
  // FR-2.12
  eq('replace opens the settings panel', await page.locator('#settings-panel:not([hidden])').count(), 1);
}
