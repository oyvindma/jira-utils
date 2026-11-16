// FR-13: notatbok-ikon på hvert kort åpner beskrivelsen i en modal som lukkes med Lukk, Esc eller klikk utenfor.
import { importAndChooseGroups } from './helpers.mjs';

export default async function ({ page, check, eq, open }) {
  await open();
  await importAndChooseGroups(page, 'descriptions.csv', ['GrpA']);
  await page.click('[data-toggle-epic="E-1"]');

  const icons = await page.locator('.card [data-show-description]').evaluateAll(buttons => buttons.map(b => b.closest('.card').dataset.issueKey).sort());
  eq('every card has the notebook icon', icons, ['E-1', 'S-1', 'T-1']);

  const openIcon = key => page.locator(`.card[data-issue-key="${key}"] [data-show-description]`).first().click();
  const modalIsOpen = () => page.locator('#dialog[open]').count();

  await openIcon('S-1');
  await page.waitForSelector('#dialog[open]');
  let text = await page.locator('#dialog').innerText();
  check('modal shows key and summary', text.includes('S-1') && text.includes('Story with multiline description'), text);
  check('modal shows the whole description as text', text.includes('First line') && text.includes('Second line with ; semicolon and <b>tags</b>'), text);
  eq('clicking the icon does not select the card', await page.locator('.card.is-selected').count(), 0);

  await page.click('#dialog button:has-text("Lukk")');
  eq('Lukk closes the modal', await modalIsOpen(), 0);

  await openIcon('S-1');
  await page.waitForSelector('#dialog[open]');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  eq('Esc closes the modal', await modalIsOpen(), 0);

  await openIcon('E-1');
  await page.waitForSelector('#dialog[open]');
  await page.mouse.click(5, 5);
  await page.waitForTimeout(100);
  eq('click outside closes the modal', await modalIsOpen(), 0);

  await openIcon('E-1');
  await page.waitForSelector('#dialog[open]');
  await page.locator('#dialog').click({ position: { x: 30, y: 30 } });
  eq('click inside keeps the modal open', await modalIsOpen(), 1);
  await page.keyboard.press('Escape');

  await openIcon('T-1');
  await page.waitForSelector('#dialog[open]');
  check('empty description gives a message', (await page.locator('#dialog').innerText()).includes('Ingen beskrivelse'));
  await page.keyboard.press('Escape');
}
