# Functional requirements: Jira-sorterer

**Status:** Implemented in `index.html` (version 1).
**Purpose:** Let a user group about 400 Jira issues (stories, tasks, bugs) and 30–80 epics under shared labels by sorting cards on a board, and export the result for a bulk label update in Jira.

Requirements are numbered by area. Each requirement states what the system shall do; *Rule* lines give the exact behaviour where it matters.

---

## 1. Platform and storage

| ID | Requirement |
|---|---|
| FR-1.1 | The solution shall be a single HTML file with HTML, CSS and JavaScript, no external libraries and no server. |
| FR-1.2 | The board (issues, groups, placements and settings) shall be saved in the browser's localStorage after every change and restored when the page is opened. |
| FR-1.3 | Storage shall be encapsulated behind one module (`BoardRepository` with `load`/`save`) so it can later be replaced by a Jira integration or a database. |
| FR-1.4 | The user interface language shall be Norwegian. |

## 2. Import

| ID | Requirement |
|---|---|
| FR-2.1 | The user shall be able to upload one CSV file exported from Jira, containing both epics and stories/tasks/bugs. |
| FR-2.2 | The separator (semicolon, comma or tab) shall be detected automatically. Quoted fields and a UTF-8 byte order mark shall be handled. |
| FR-2.3 | Columns shall be found by name. Required: `Issue Type`, `Issue key`, `Summary`. Optional: `Issue id`, `Parent id`, `Created`, `Custom field (Epic Link)`, `Labels`, `Status`, `Custom field (Story Points …)`. |
| FR-2.4 | Repeated `Labels` columns shall be merged into one list of labels per issue, without duplicates. |
| FR-2.5 | Only the issue types Epic, Story, Task and Bug shall be imported. All other types (e.g. Sub-task, Xray Test, Test Execution) shall be ignored. |
| FR-2.6 | An issue's epic shall be taken from `Epic Link`. If empty, it shall be taken from `Parent id` when that id belongs to an epic in the file. |
| FR-2.7 | The import shall fail, and leave the board unchanged, if: required columns are missing; no issues of the imported types are found; an issue key occurs more than once; or an issue refers to an epic that is not in the file. |
| FR-2.8 | When the import fails because of missing epics, the error message shall list every missing epic key and the issue keys that refer to it. |
| FR-2.9 | When the board already contains data, the user shall choose between **merge**, **replace** and **cancel** for each import. |
| FR-2.10 | *Merge:* issue data shall be updated; issues the user has placed manually shall keep their placement; all other issues (including new ones) shall be placed by their labels (FR-4). |
| FR-2.11 | *Replace:* all issues, groups, placements and undo history shall be cleared and rebuilt from the file. Usortert filters and folded-out epics shall be reset; other display settings shall be kept. |
| FR-2.12 | After a replace import, the settings panel shall open so the user can choose groups. |

## 3. Groups

| ID | Requirement |
|---|---|
| FR-3.1 | A group shall be identified by a label. |
| FR-3.2 | The user shall be able to choose which existing labels are groups, from a list showing every label in the data and the number of issues that have it. |
| FR-3.3 | The user shall be able to create a group with a new label. Whitespace shall be replaced by `_`. Creating a group that already exists shall be refused with a message. |
| FR-3.4 | The user shall be able to remove a group. Its issues shall go back to Usortert. If the group contains issues, the user shall confirm first. |
| FR-3.5 | Groups shall keep the order in which they were added. The first nine shall show their keyboard shortcut number (1–9) in the header. |
| FR-3.6 | Each group shall show its name and the number of issues in it. |

## 4. Automatic placement

| ID | Requirement |
|---|---|
| FR-4.1 | An issue with exactly one group label shall be placed in that group. |
| FR-4.2 | An issue with more than one group label shall be placed in Usortert and marked with a warning (⚠). Hovering over the warning shall show the conflicting groups. |
| FR-4.3 | An issue with no group label shall be placed in the same group its epic is placed in by labels, or in Usortert if it has no epic. |
| FR-4.4 | Placement shall be recalculated for all automatically placed issues when a group is added or removed, so that the result does not depend on the order groups were chosen in. |
| FR-4.5 | An issue the user has moved shall never be moved automatically. *Exception:* when its group is removed, it goes to Usortert and becomes automatically placed again. |

## 5. Board layout

| ID | Requirement |
|---|---|
| FR-5.1 | Usortert shall be a panel on the left with its own scrollbar. Groups shall fill the rest of the screen, each with its own scrollbar. |
| FR-5.2 | Groups shall share the available area: one group fills it, three groups share it. When groups would become smaller than about 260 × 300 px, they shall wrap onto more rows and the group area shall scroll. |
| FR-5.3 | An empty group shall take half the width of a non-empty group in the same row. Widths shall only change when a group becomes empty or non-empty. |
| FR-5.4 | When the groups do not fit on screen, a strip at the top of the group area shall show every group (shortcut number, name, count) as a drop target. Clicking a group in the strip shall scroll to that group without hiding its header. |
| FR-5.5 | The width of Usortert shall default to about a third of the screen (320–640 px) and shall be adjustable by dragging the divider, or with ← → when the divider has focus. The width shall be saved. Double-click shall restore the default. |
| FR-5.6 | Selecting cards shall not change the height of the toolbar or move the board. |
| FR-5.7 | The toolbar shall show the number of unsorted issues out of the total. |
| FR-5.8 | When there is no data, or no groups, the board shall show a message telling the user what to do next. |
| FR-5.9 | An open dropdown list (label or status filter) or the settings panel shall close when the user clicks outside it or presses Esc. Opening one dropdown shall close the other. Clicks inside a dialog opened from the settings panel shall not close the panel. |

## 6. Cards

| ID | Requirement |
|---|---|
| FR-6.1 | Every card shall show the issue key and title, and a coloured stripe for the type (Epic purple, Story green, Bug red, Task blue). |
| FR-6.2 | The user shall be able to choose which additional fields are shown: Type, Status, Epic, Story points, Created. |
| FR-6.3 | A card in a group shall not show that group's label. The issue's other labels shall be shown, unless the user turns labels off. |
| FR-6.4 | A card in a group shall show the labels the issue will have after export (FR-10.4). A card in Usortert shall show its original labels. |
| FR-6.5 | A compact mode shall show one card per row with key and at most two lines of title, without the type text. |
| FR-6.6 | The user shall be able to choose a light or dark colour theme, or follow the operating system's setting (default). The choice shall be saved. When following the system, the board shall switch theme when the system does, without reloading. |
| FR-6.7 | In both themes, text on cards, buttons and label chips shall have a contrast ratio of at least 4.5:1 against its background (WCAG AA). Cards dimmed on purpose while an epic is selected (FR-7.6) are exempt. |

## 7. Epics and children

| ID | Requirement |
|---|---|
| FR-7.1 | Children placed in the same group as their epic shall be shown nested inside the epic card, which can be folded in and out. Fold state shall be saved. |
| FR-7.2 | The epic card shall show the number of nested children and the number of children in other groups. |
| FR-7.3 | Moving an epic shall move its children that are in the same group as the epic. |
| FR-7.4 | If the epic has children in other groups or in Usortert, the user shall be asked to gather them all, leave them, or cancel the move. |
| FR-7.5 | A child shall be movable out of a folded-out epic to another group, where it is shown as its own card. |
| FR-7.6 | Selecting an epic shall highlight all its children wherever they are, and dim all other cards. |

## 8. Selection and moving

| ID | Requirement |
|---|---|
| FR-8.1 | Clicking a card shall select it. Clicking the only selected card again, clicking an empty area, or pressing Esc shall clear the selection. |
| FR-8.2 | Ctrl/⌘+click shall add or remove a card from the selection. Shift+click shall select all visible cards between the last selected card and the clicked card, within the same group or Usortert. |
| FR-8.3 | Dragging a card onto a group, a target strip entry or Usortert shall move it. Dragging a selected card shall move the whole selection. |
| FR-8.4 | Keys 1–9 shall move the selected cards to group 1–9, and 0 to Usortert. |
| FR-8.5 | After a keyboard move, the next remaining card in the same list shall be selected automatically (or the previous one if there is none after). |
| FR-8.6 | ↑/↓ shall select the previous/next visible card in the same list. The selected card shall be scrolled into view inside its list without moving the rest of the board. |
| FR-8.7 | While cards are selected, a bar at the bottom of the screen shall show the selection and the available keys. |
| FR-8.8 | Keyboard shortcuts shall not act while the user is typing in a text field or a dialog is open. |

## 9. Feedback and undo

| ID | Requirement |
|---|---|
| FR-9.1 | After every move, the moved cards shall be briefly highlighted and the first one scrolled into view inside its group. With reduced motion turned on in the operating system, the highlight shall not be animated. |
| FR-9.2 | After every move, a message shall state what was moved and where (e.g. "Flyttet PROJ-1 til «MVP»"), with an **Angre** button. It shall disappear after about 6 seconds. |
| FR-9.3 | The user shall be able to undo moves and the adding or removing of groups with Ctrl/⌘+Z, the **Angre** toolbar button, or the button in the move message. A multi-card move shall be undone in one step. |
| FR-9.4 | At least the last 50 changes shall be undoable. The undo history shall be cleared on import and page reload. The **Angre** button shall be disabled when there is nothing to undo. |

## 10. Export

| ID | Requirement |
|---|---|
| FR-10.1 | The user shall be able to export the result as a CSV file named `jira-gruppering-YYYY-MM-DD.csv`. |
| FR-10.2 | Only issues that are placed in a group **and whose labels change** (FR-10.4 gives a different set than the original labels) shall be exported, ordered by group order and then by key. |
| FR-10.3 | The file shall use semicolon as separator, UTF-8 with byte order mark, and the columns `Issue key`, `Gruppe` and as many `Labels` columns as the issue with most labels needs. |
| FR-10.4 | *Rule:* exported labels = the issue's original labels, minus every label that is currently a group, plus the label of the group the issue is in. |
| FR-10.5 | If no issues have changed labels, export shall show a message instead of downloading an empty file. |
| FR-10.6 | Before downloading, a modal preview shall show every change that will be exported, as a table with the columns Epic (key and summary), Ticket (key and summary) and change in labels (removed and added labels, visually distinct). |
| FR-10.7 | In the preview, changes shall be grouped by epic, with the epic shown once for all its rows and kept visible while scrolling through them. A changed epic shall be listed first in its own group. Issues without an epic shall be listed last. |
| FR-10.8 | The preview shall state the number of changed issues and epics, and offer **download** (showing the number of issues) and **cancel**. Cancel shall not download anything. |

## 11. Filtering Usortert

| ID | Requirement |
|---|---|
| FR-11.1 | The user shall be able to search Usortert by issue key or title. `/` shall move focus to the search field. |
| FR-11.2 | The user shall be able to filter by one or more issue types. Each type button shall show the number of unsorted issues of that type. |
| FR-11.3 | The user shall be able to filter by one or more labels. |
| FR-11.7 | The user shall be able to filter by one or more statuses. |
| FR-11.8 | The label and status lists shall show the values that occur among unsorted issues, with the number of unsorted issues for each. Values that are selected shall stay in the list even if no unsorted issue has them any more. |
| FR-11.9 | Several values in the same filter shall match any of them (or). Different filters (search, type, label, status) shall all have to match (and). |
| FR-11.4 | The user shall be able to sort by key, newest first, type, status or title. |
| FR-11.5 | An epic shall be shown if it or one of its nested children matches the filter. If only children match, only those children shall be shown inside it. |
| FR-11.6 | A button shall clear all filters. It shall only be visible when a filter is active. Filter and sort settings shall be saved. |

---

## Out of scope (version 1)

- Direct integration with Jira (reading or writing issues through the API).
- Sharing a board between users or computers.
- Reordering groups, renaming groups.
- An issue in more than one group at the same time.
- Sub-tasks and test issue types.
- Layout for phones and tablets.
