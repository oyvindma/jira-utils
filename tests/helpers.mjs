import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));

export const fixturePath = name => path.join(testsDirectory, 'fixtures', name);

export const importFixture = (page, name) => page.setInputFiles('#csv-file-input', fixturePath(name));

/** Innholdet i localStorage, slik appen har lagret det. */
export const readStore = page =>
  page.evaluate(() => JSON.parse(localStorage.getItem('jiraSorter.v1') ?? '{"issuesByKey":{},"groups":[],"placementByIssueKey":{},"settings":{}}'));

/** Importer en fil på et tomt brett og velg grupper i innstillingene som åpnes av seg selv. */
export async function importAndChooseGroups(page, fixtureName, labels) {
  await importFixture(page, fixtureName);
  await page.waitForSelector('#settings-panel:not([hidden])');
  for (const label of labels) {
    await page.locator('#settings-panel .checkbox-row', { hasText: label }).locator('input').first().check();
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
}

export const groupShortcut = async (page, label) => String((await readStore(page)).groups.indexOf(label) + 1);

export const dialogText = page => page.locator('#dialog').innerText();
