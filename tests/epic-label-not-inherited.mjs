// FR-4.3: et barn uten grupperingslabel arver ikke epicens gruppe. Det blir i Usortert og får ikke ny label i eksporten.
import { importAndChooseGroups, readStore, dialogText } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'epic-label-not-inherited.csv', ['Leveranse1', 'Leveranse2']);

  const placed = (await readStore(page)).placementByIssueKey;
  eq('epic is in its own group', placed['E-1'], 'Leveranse1');
  eq('child without group label stays in Usortert', placed['C-1'] ?? null, null);
  eq('child with other group label is in that group', placed['C-2'], 'Leveranse2');
  eq('child with same group label is in the epic group', placed['C-3'], 'Leveranse1');
  eq('child with only a non-group label stays in Usortert', placed['C-4'] ?? null, null);
  eq('Usortert holds the children without group label',
    await page.locator('#unsorted-list .card').evaluateAll(cards => cards.map(card => card.dataset.issueKey).sort()), ['C-1', 'C-4']);

  // Ingen label er endret, så eksporten skal ikke ta med noen ticket.
  await page.click('#export-button');
  await page.waitForSelector('#dialog[open]');
  const text = await dialogText(page);
  check('no ticket is listed for export', !/C-\d|E-1/.test(text), text);
}
