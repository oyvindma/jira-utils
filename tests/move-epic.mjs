// FR-7.3, FR-7.4, FR-10.4: en epic tar med barna sine, og alle får gruppens label i eksporten.
import fs from 'node:fs';
import path from 'node:path';
import { importAndChooseGroups, groupShortcut, readStore } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'move-epic.csv', ['Other']);
  page.once('dialog', dialog => dialog.accept('Target'));
  await page.click('#new-group-button');
  await page.waitForTimeout(300);
  const targetNumber = await groupShortcut(page, 'Target');
  const placements = async () => (await readStore(page)).placementByIssueKey;
  const selectEpic = () => page.click('#unsorted-list .card[data-issue-key="E-1"]', { position: { x: 20, y: 6 } });

  // Et barn ligger i en annen gruppe, så brukeren blir spurt. «La dem ligge» flytter bare de som var sammen med epicen.
  await selectEpic();
  await page.keyboard.press(targetNumber);
  await page.waitForSelector('#dialog[open]');
  await page.click('#dialog button:has-text("La dem ligge")');
  await page.waitForTimeout(300);
  let placed = await placements();
  eq('epic moved', placed['E-1'], 'Target');
  eq('child 1 in Usortert followed', placed['C-1'], 'Target');
  eq('child 2 in Usortert followed', placed['C-2'], 'Target');
  eq('child in other group left alone', placed['C-3'], 'Other');
  eq('unrelated issue untouched', placed['U-1'], undefined);

  await page.keyboard.press('Control+z');
  await page.waitForTimeout(300);
  eq('undo moves the epic back', (await placements())['E-1'], undefined);

  // «Samle alle» tar med barnet fra den andre gruppen også.
  await selectEpic();
  await page.keyboard.press(targetNumber);
  await page.waitForSelector('#dialog[open]');
  await page.click('#dialog button:has-text("Samle alle")');
  await page.waitForTimeout(300);
  placed = await placements();
  for (const key of ['E-1', 'C-1', 'C-2', 'C-3']) eq(`${key} gathered in Target`, placed[key], 'Target');
  eq('Usortert only holds the unrelated issue',
    await page.locator('#unsorted-list .card').evaluateAll(cards => cards.map(card => card.dataset.issueKey)), ['U-1']);

  // Eksporten gir alle fire gruppens label og fjerner den gamle gruppelabelen, men beholder andre labels.
  await page.click('#export-button');
  await page.waitForSelector('#dialog[open]');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('#dialog button:has-text("Last ned CSV")'),
  ]);
  const exportedFile = path.resolve('.tmp/exported-move-epic.csv');
  check('filename has date and time', /^jira-gruppering-\d{4}-\d{2}-\d{2}-\d{4}\.csv$/.test(download.suggestedFilename()), download.suggestedFilename());
  await download.saveAs(exportedFile);
  const lines = fs.readFileSync(exportedFile, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1);
  const labelsByKey = Object.fromEntries(lines.map(line => { const cells = line.split(';'); return [cells[0], cells.slice(4).filter(Boolean)]; }));
  for (const key of ['E-1', 'C-1', 'C-2', 'C-3']) check(`${key} exported with label Target`, labelsByKey[key]?.includes('Target'), JSON.stringify(labelsByKey[key]));
  check('non-group label is kept', labelsByKey['C-2']?.includes('Old'), JSON.stringify(labelsByKey['C-2']));
  check('old group label is removed', !labelsByKey['C-3']?.includes('Other'), JSON.stringify(labelsByKey['C-3']));
  check('unmoved issue is not exported', labelsByKey['U-1'] === undefined);
}
