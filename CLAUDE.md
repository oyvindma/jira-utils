# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Jira-sorterer: a browser board for grouping Jira issues by label. The user loads a Jira CSV export, drags issues into groups (each group = a label), and exports a CSV of changed labels for a Jira bulk update. `README.md` is the user guide; `FUNCTIONAL_REQUIREMENTS.md` has numbered requirements (FR-x.y) with exact rules — check it before changing behaviour.

## Commands

There is no build, package manager, linter or test suite. The whole app is the single file `index.html` (HTML + CSS + vanilla JS, no external libraries, no server). Open it in a browser to run it; to verify changes, load a CSV (e.g. `Jira-oppgaver.csv`) in a headless browser or by hand.

`fetch-issues.sh` (needs `jq`, a Jira PAT via prompt/`PAT` env var) downloads open issues from the Jira instance into `<timestamp>-gtsanalyseissues.csv`. `*.csv` and `.tmp/` are git-ignored.

## Conventions

- UI text and code comments are in **Norwegian**; identifiers are English. Keep new UI strings Norwegian (README/requirements are in English).
- Never use the system `/tmp` folder. Put temporary files in the project's `.tmp/` folder instead (it is git-ignored).
- Commit directly to `main` when asked to commit and push (no feature branch/PR).

## Architecture (all inside `<script>` in `index.html`)

The script is organised as banner-commented modules, roughly in data-flow order:

1. **Import pipeline:** `CsvFormat` (delimiter detection, parsing) → `JiraIssueMapper` (columns by name via `JiraColumn`; merges repeated `Labels` columns; epic from Epic Link, else Parent id) → `ImportValidator` (fails the whole import, leaving the board untouched, on missing columns/duplicate keys/missing epics).
2. **Placement rules:** `GroupLabelRules` and `InitialPlacementResolver` auto-place issues by labels (one group label → that group; several → Usortert with ⚠; none → epic's group). Issues the user moved manually are tracked and never auto-moved again.
3. **State:** `BoardState` is the single source of truth (`issuesByKey`, `groups`, `placementByIssueKey`, `settings` from `DEFAULT_SETTINGS`); `UndoHistory` holds placement snapshots; `CardSelection` is transient and not persisted.
4. **Persistence:** `BoardRepository` (`load`/`save`, localStorage key `jiraSorter.v1`) is the only storage touchpoint, deliberately isolated so it can be swapped for Jira/DB. Saved after every change. Changing the stored shape needs backward-compatible loading (or a key bump).
5. **Rendering:** `CardRenderer` / board rendering builds DOM via the `createElement` helper (not innerHTML); epics render their same-group children nested, and moving an epic moves those children (with a prompt when children sit elsewhere). Helpers: `GroupGridLayout`, `ScrollMemory`, `CardReveal`, `SelectionHighlighter`, `Dialog`, `ThemeController`.
6. **Export:** `LabelChangeCalculator` computes per-issue label diffs; `ExportPreview` shows them; `ExportService` writes the semicolon-separated CSV of changed issues only.
7. **`App`** (end of the script) wires modules, keyboard shortcuts (1–9 move to group, 0 to Usortert, `/` search), drag-and-drop and file import.

The `UNSORTED` constant (`null`) is the placement value for Usortert. Only issue types Epic/Story/Task/Bug are imported.
