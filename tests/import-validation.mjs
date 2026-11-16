// FR-2.3, FR-2.7, FR-2.8: manglende kolonner stopper importen, manglende epics gir en advarsel.
import { fixturePath, importFixture, readStore, dialogText } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  const issueCount = async () => Object.keys((await readStore(page)).issuesByKey).length;
  const closeDialog = () => page.locator('#dialog button').first().click();

  // Header kalt «Epic Link» i stedet for «Custom field (Epic Link)»
  await importFixture(page, 'missing-epic-link-column.csv');
  await page.waitForSelector('#dialog[open]');
  let text = await dialogText(page);
  check('missing column is named in the error', text.includes('påkrevde kolonner') && text.includes('Custom field (Epic Link)'), text);
  eq('board is unchanged after failed import', await issueCount(), 0);
  await closeDialog();

  // Uten Labels-kolonne
  await page.setInputFiles('#csv-file-input', {
    name: 'no-labels.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Issue Type;Issue key;Issue id;Summary;Custom field (Epic Link);Status\nEpic;T-1;1;Epic;;Ny\n'),
  });
  await page.waitForSelector('#dialog[open]');
  text = await dialogText(page);
  check('missing Labels column is named in the error', text.includes('påkrevde kolonner') && text.includes('Labels'), text);
  eq('board is still unchanged', await issueCount(), 0);
  await closeDialog();

  // Epics som ikke finnes i filen: advarsel. Avbryt lar tavla være.
  await importFixture(page, 'missing-epics.csv');
  await page.waitForSelector('#dialog[open]');
  text = await dialogText(page);
  check('warning lists the missing epics and who uses them',
    text.includes('Importere likevel') && text.includes('X-99') && text.includes('T-3') && text.includes('T-4') && text.includes('Y-7') && text.includes('T-5'), text);
  eq('no links in the warning when no Jira address is set', await page.locator('#dialog .dialog__details a').count(), 0);
  await page.click('#dialog button:has-text("Avbryt")');
  eq('cancel leaves the board empty', await issueCount(), 0);

  // Importer likevel: ticketsene importeres uten epic, gyldige epic-koblinger beholdes.
  await importFixture(page, 'missing-epics.csv');
  await page.waitForSelector('#dialog[open]');
  await page.click('#dialog button:has-text("Importer likevel")');
  await page.waitForSelector('#settings-panel:not([hidden])');
  const { issuesByKey } = await readStore(page);
  eq('all five issues are imported', Object.keys(issuesByKey).length, 5);
  eq('link to missing epic is dropped', issuesByKey['T-3'].epicKey, null);
  eq('link to other missing epic is dropped', issuesByKey['T-5'].epicKey, null);
  eq('valid epic link is kept', issuesByKey['T-2'].epicKey, 'T-1');

  // Lenker i advarselen: bare når Jira-adressen er satt i innstillingene.
  const linksInDialog = () => page.locator('#dialog .dialog__details a').evaluateAll(links =>
    links.map(link => ({ text: link.textContent, href: link.href, target: link.target })));
  // Innstillingene står åpne etter importen ovenfor.
  await page.waitForSelector('#settings-panel:not([hidden])');
  await page.fill('#settings-panel input[type="url"]', 'https://jira.example.test');
  await page.locator('#settings-panel input[type="url"]').dispatchEvent('change');
  await page.keyboard.press('Escape');
  await importFixture(page, 'missing-epics.csv');
  await page.waitForSelector('#dialog[open]');
  const links = await linksInDialog();
  eq('every issue key in the warning is a link', links.map(link => link.text).sort(), ['T-3', 'T-4', 'T-5', 'X-99', 'Y-7']);
  eq('links point to the issues in Jira', links.find(link => link.text === 'X-99')?.href, 'https://jira.example.test/browse/X-99');
  eq('links open in a new tab', [...new Set(links.map(link => link.target))], ['_blank']);
  check('the warning text is unchanged apart from the links', (await dialogText(page)).replace(/\s+/g, ' ').includes('X-99 (brukt av T-3, T-4)'), await dialogText(page));
  await page.click('#dialog button:has-text("Avbryt")');
}

