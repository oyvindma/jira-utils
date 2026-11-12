# Jira-sorterer

A board for grouping Jira issues by label. You load a CSV export from Jira, drag issues (or use the keyboard) into groups, and export a CSV with each issue's new labels, ready for a bulk update in Jira.

Everything runs in the browser from a single file, `index.html`. There is no server and no installation. Your work is saved automatically in the browser (localStorage).

> The user interface is in Norwegian. Button and field names below are quoted exactly as they appear on screen.

---

## Contents

1. [Getting started](#getting-started)
2. [Exporting from Jira](#exporting-from-jira)
3. [The screen](#the-screen)
4. [Choosing and creating groups](#choosing-and-creating-groups)
5. [How issues are placed automatically](#how-issues-are-placed-automatically)
6. [Sorting issues](#sorting-issues)
7. [Epics and their children](#epics-and-their-children)
8. [Finding issues in Usortert](#finding-issues-in-usortert)
9. [Card display](#card-display)
10. [Undo](#undo)
11. [Exporting the result](#exporting-the-result)
12. [Importing again](#importing-again)
13. [Keyboard shortcuts](#keyboard-shortcuts)
14. [Troubleshooting](#troubleshooting)

---

## Getting started

1. Open `index.html` in a modern browser (Chrome, Edge or Firefox).
2. Click **📂 Last opp CSV** and choose your Jira export.
3. **⚙ Innstillinger** opens. Tick the labels that should be groups, or create new ones.
4. Sort the issues that remain in **Usortert** into groups.
5. Click **⬇ Eksporter CSV**.

Your work is saved after every change. You can close the browser and continue later on the same computer, in the same browser.

## Exporting from Jira

Export the issues from Jira as CSV (all fields or your current fields). Epics and stories/tasks/bugs must be in **the same file**.

The board reads these columns. Only the first three are required:

| Column | Used for |
|---|---|
| `Issue Type` | Type of issue. Only **Epic, Story, Task and Bug** are imported. Other types (Sub-task, Xray Test, Test Execution, …) are ignored. |
| `Issue key` | The issue's key, for example `PROJ-123`. |
| `Summary` | Title shown on the card. |
| `Custom field (Epic Link)` | Which epic the issue belongs to. |
| `Issue id` / `Parent id` | Used to find the epic when `Epic Link` is empty. |
| `Labels` (may repeat) | All labels on the issue. |
| `Status`, `Created`, `Custom field (Story Points …)` | Optional information on the cards. |

The file may use semicolon, comma or tab as separator. This is detected automatically.

**The import stops** if the file refers to an epic that is not in the file itself. The message lists the missing epic keys and which issues refer to them. Add the epics to the export, or remove the epic link from those issues, and import again. The board is not changed by a failed import.

## The screen

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Toolbar: Last opp CSV · Ny gruppe · Angre · Innstillinger · Kompakte kort │
│                                       "X usortert av Y" · Eksporter CSV   │
├─────────────────┬─┬───────────────────────────────────────────────────────┤
│ 0 Usortert      │ │ (Target strip – only when groups don't fit)           │
│ search, filters │↔│ ┌ 1 Group ┐ ┌ 2 Group ┐ ┌ 3 Group ┐                   │
│ unsorted cards  │ │ │ cards   │ │ cards   │ │ cards   │                   │
│                 │ │ └─────────┘ └─────────┘ └─────────┘                   │
└─────────────────┴─┴───────────────────────────────────────────────────────┘
                   [ selection bar – shown when cards are selected ]
```

- **Usortert** (left) holds every issue that is not in a group. This is where you work.
- **The divider** (↔) between Usortert and the groups can be dragged to make the panel wider or narrower. Double-click it to go back to the default width. When the divider has keyboard focus, the arrow keys ← → also adjust it.
- **The groups** share the rest of the screen. Each group scrolls on its own. A number in the header (1–9) is the keyboard shortcut for that group. Empty groups are half as wide as groups with cards.
- **The target strip** appears at the top when there are more groups than fit on screen. It shows every group as a small button that you can drop cards on. Click a button to scroll to that group.
- **The counter** in the toolbar shows how many issues are still unsorted.

## Choosing and creating groups

A group is a **label**. Open **⚙ Innstillinger**:

- **Grupper (labels)** lists every label found in the file, with the number of issues that have it. Tick a label to make it a group; untick it to remove the group.
- **Ny gruppe** creates a group with a new label. Spaces are replaced by `_`, because Jira labels cannot contain spaces. You can also use **+ Ny gruppe** in the toolbar.

To remove a group, click **×** in its header. Issues in the group are moved back to Usortert; you are asked to confirm first if the group is not empty.

Groups are numbered in the order they were added. The first nine can be reached with keys 1–9.

## How issues are placed automatically

When a label becomes a group, issues are placed by their labels:

| The issue has… | It is placed… |
|---|---|
| exactly one label that is a group | in that group |
| several labels that are groups | in **Usortert**, marked with **⚠**. Hover over ⚠ to see which groups. You decide where it goes. |
| no label that is a group | in the same group as its epic, if it has one; otherwise in Usortert |

Placements follow the labels until you move an issue yourself. **An issue you have moved is never moved automatically again**, even if you add or remove other groups.

> Tip: choose groups from one "family" of labels at a time (for example only `Milepæl*`). If you choose labels from two families at once (for example `Milepæl*` and `effekt-team-*`), many issues will have two group labels and end up in Usortert with ⚠.

## Sorting issues

### With the mouse

- **Drag** a card onto a group (anywhere in the group, including the header) or back onto Usortert.
- **Select several:** **Ctrl+click** (⌘+click on Mac) adds or removes a card from the selection. **Shift+click** selects every card between the last selected card and the one you click. Drag any of the selected cards to move them all.
- A plain **click** selects one card. Clicking it again, or clicking an empty area, clears the selection.

### With the keyboard (fastest)

1. Click the first card in Usortert.
2. Press the **group's number (1–9)**. The card moves, and the **next card is selected automatically**.
3. Keep pressing numbers. Use **↑/↓** to skip a card, **0** to send a card back to Usortert.

While cards are selected, a bar at the bottom of the screen shows what is selected and which keys you can use.

### Confirmation

After each move, the moved card flashes and is scrolled into view in its group, and a message such as *"Flyttet PROJ-123 til «MVP»"* appears for a few seconds with an **Angre** button.

## Epics and their children

- Stories, tasks and bugs that belong to an epic are shown **inside the epic card** when they are in the same group as the epic. Click **▸ N barn** to fold them out, **▾** to fold them in.
- **Moving an epic moves its children** that are in the same group.
- If some of the epic's children are in other groups (or in Usortert), you are asked:
  - **Samle alle i «…»**: move all children with the epic.
  - **La dem ligge**: move only the epic and the children that were with it.
  - **Avbryt**: move nothing.
- A child can be dragged **out of** a folded-out epic into another group. There it is shown as its own card, and the epic shows *"N i andre grupper"*.
- **Click an epic** to highlight all its children wherever they are, including in other groups and in Usortert. Everything else is dimmed. Press **Esc** or click an empty area to clear.

## Finding issues in Usortert

- **Search** (or press **/**) matches issue key and title.
- **Type buttons** (Epic, Story, Task, Bug) filter by type. The number on each button is how many unsorted issues of that type there are. Several types can be active at once.
- **Labels** filters by one or more labels.
- **Status** filters by one or more Jira statuses (for example *Ny*, *Klar for utvikling*, *I test*).
- In the **Labels** and **Status** lists, the number after each value is how many unsorted issues have it. Only values that occur in Usortert are listed.
- Choosing several values in the same list shows issues that match **any** of them. Filters of different kinds are combined: *Bug* + status *I test* shows only bugs with status *I test*.
- **Sorter** orders by key, newest first, type, status or title.
- **Nullstill filter** appears when a filter is active and clears all filters.

An epic is shown if the epic itself, or one of its children, matches the filter.

## Card display

- **Kompakte kort** (toolbar) shows one card per line with the key and up to two lines of title. The colour stripe on the left shows the type: purple Epic, green Story, red Bug, blue Task.
- In **⚙ Innstillinger → Kortvisning** you choose:
  - **Vis øvrige labels på kortene**: show or hide labels on the cards.
  - Which fields are shown: Type, Status, Epic, Story points, Opprettet (created). Key and title are always shown.
- A card never shows the label of the group it is in. Its other labels are shown (unless turned off).

## Undo

**↶ Angre** in the toolbar, **Ctrl+Z** (⌘+Z), or **Angre** in the move message undoes the last change. It covers moving cards and adding or removing groups; a move of several cards is undone in one step. Up to 50 steps can be undone.

Not undoable: imports and display settings. The undo history is cleared when you reload the page or import a file.

## Exporting the result

Click **⬇ Eksporter CSV**. A preview of the changes opens first:

| Epic | Ticket | Endring i labels |
|---|---|---|
| Epic key and summary, shown once for all its issues | Issue key and summary | Labels removed (red, `− Milepæl3`) and added (green, `+ Milepæl4`) |

- Issues are grouped under their epic. An epic that is changed itself is listed first in its group. Issues without an epic are listed last under *Uten epic*.
- The line above the table shows how many issues change and how many epics they belong to.
- Click **Last ned CSV (N)** to download the file `jira-gruppering-YYYY-MM-DD.csv`, or **Avbryt** to go back.

What is exported:

- Only issues that are **in a group** and whose **labels change**. An issue that already had exactly the right labels in Jira (for example, it had the label `Milepæl3` and is in the group `Milepæl3`) is left out.
- If nothing changes, you get a message instead of a file.
- Separator is semicolon; encoding is UTF-8 (opens correctly in Excel).
- Columns: `Issue key`, `Gruppe`, and one or more `Labels` columns.
- **Labels** are the labels the issue should have in Jira: its original labels, **minus every label that is a group**, **plus the group it is in now**. An issue moved from `Milepæl3` to `Milepæl4` therefore loses `Milepæl3` and gets `Milepæl4`. Labels that are not groups are kept.

Use the file for a bulk update of labels in Jira (for example with Jira's CSV import, matching on `Issue key`). Check the file and test on a few issues before updating many.

## Importing again

When you upload a new file and the board already has data, you choose:

- **Slå sammen** (merge): issue data is updated, issues you have moved stay where you put them, and other issues (including new ones) are placed by their labels.
- **Erstatt alt** (replace): the board and all groups are cleared and built again from the file.
- **Avbryt**: nothing changes.

## Keyboard shortcuts

Shortcuts work when the cursor is not in a text field.

| Key | Action |
|---|---|
| **1–9** | Move selected cards to group 1–9 |
| **0** | Move selected cards to Usortert |
| **↑ / ↓** | Select previous / next card |
| **Ctrl+click** (⌘+click) | Add or remove card from selection |
| **Shift+click** | Select a range of cards |
| **Esc** | Clear selection |
| **Ctrl+Z** (⌘+Z) | Undo |
| **/** | Go to search |
| **← / →** on the divider | Make Usortert narrower / wider |

## Troubleshooting

| Problem | Solution |
|---|---|
| "Importen feilet" with a list of epics | The file refers to epics that are not in it. Include the epics in the export, or remove the epic links. |
| "Filen mangler påkrevde kolonner" | The export must include `Issue Type`, `Issue key` and `Summary`. |
| Many issues in Usortert with ⚠ | They have labels for more than one group. Choose groups from one label family at a time, or sort them manually. |
| A number key does nothing | No card is selected, the cursor is in a text field, or there is no group with that number. |
| My work is gone | Data is stored in this browser on this computer only. A different browser, a private window or clearing browser data gives an empty board. Export regularly if you need a backup. |
| A dropdown or the settings panel stays open | Click anywhere outside it, or press Esc. |
| Characters look wrong in Excel | Open the file via Excel's import with UTF-8 and semicolon as separator. |

The board stores data under the key `jiraSorter.v1` in the browser's localStorage.
