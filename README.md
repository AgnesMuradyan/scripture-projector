# Scripture Projector

Offline Electron + React + TypeScript desktop application for macOS and Windows. Version 1.4 includes the user-supplied **Միաբանություն** Bible: 66 books, 1,189 chapters and 31,090 verse entries. It is available immediately on first launch, with no Bible import or download step. No other translation is substituted.

## Run and develop

Use Node.js 22.12+ and npm:

```sh
npm ci
npm run dev
```

Production-mode run:

```sh
npm run build
npm start
```

Dependency installation requires internet. The installed application, Bible data, fonts and saved backgrounds work offline. Noto Sans Armenian, Noto Serif Armenian, and SHK Aida (regular and semibold) are bundled.

## Operate

1. Choose a book from the compact grid. Buttons use abbreviations such as **Ծննդ**; hover for the full name. Old and New Testament books are grouped in archive order. All 66 buttons remain in the library while searching; smaller windows allow scrolling.
2. Select a chapter from the vertical chapter column to the right of the books. The chapter grid follows the selected book, including all 150 Psalms. Each verse has its own readable text row; a labeled horizontal divider separates every ten entries. A normal verse click replaces the previous selection. Hold **Ctrl** (Windows) or **Command** (macOS) while clicking to add or remove individual verses. Clicking an already-selected verse without a modifier keeps just that verse. Search full text, full references or abbreviated references; clicking a result prepares that verse.
3. Click **Settings** in the header to open the prepared preview, slide-preview navigation, presentation screen, background image and appearance controls. The permanent right sidebar is removed, leaving more room for verses. Done or Escape closes Settings. Appearance edits save locally and apply to output when you press Present; separator choices also update the current live output immediately; changing the output screen moves an already-open live window. Presentation hotkeys pause while the Settings dialog is open. The prepared preview matches the target display's aspect ratio.
4. Press **Present / Go Live**. This copies the prepared passage and appearance into a separate live snapshot. Editing the prepared passage does not change live output.
5. The footer opens on **History**. Each successful presentation is recorded with its reference and local timestamp and saved across restarts. Click an entry to prepare it again; this never automatically goes live. The **Queue** tab retains the ability to assemble, reorder and remove upcoming passages.
6. Previous / Next navigate the current live passage's slides. Blackout, Default photo and Restore retain the live slide position.

Title and verse layout uses the visible photo area, keeping text out of the surrounding black borders. Longer passages split into additional slides as needed.

Photos of any aspect ratio are fitted completely inside the output without cropping or stretching; unused space remains black. Choose two separate images in Settings: **Default photo · Escape** and **Verse background · Enter**. Each has its own thumbnail gallery and image-import button. **Show default photo** or **Escape** shows the default image without text; **Enter** presents the prepared verses over the verse background. Both choices persist across restarts. Existing users initially keep their previous photo for both roles until they choose different images. The dark overlay applies only while verses are visible. The control interface uses a warm beige theme.

## Keyboard shortcuts

Open the in-app shortcut guide with **?** or the header button. Letter shortcuts use physical key positions, so they work when an Armenian keyboard layout is active.

| Key | Action |
| --- | --- |
| Enter | Present prepared passage |
| ← / → | Previous / next live slide |
| ↑ / ↓ | Prepare previous / next verse |
| [ / ] | Previous / next chapter in the current book |
| F or / | Focus search |
| Q | Add prepared passage to queue |
| H | Show history |
| T | Show queue |
| B | Blackout |
| G | Show default photo |
| R | Restore live passage |
| Escape | Show default photo; close Settings or shortcut guide when open |
| ? | Show shortcut guide |

Shortcuts pause in inputs, selects, textareas and editable content, except Escape. OS modifier shortcuts and key repeats are ignored. The output window also accepts Enter to present the prepared selection.

## Bundled Bible and source notes

The exact supplied files are retained in `resources/source/miabanutyun/`. `npm run build:bible` parses them as inert data into `resources/bibles/miabanutyun.json`. Builds run this step automatically. The parser reads `<h1>` book headings, `<strong>` chapter numbers and `<sup>` verse numbers. Source formatting whitespace becomes readable spaces; wording, punctuation and Unicode remain intact. No scripts execute and no HTML resources are fetched. The application only reads the generated JSON.

The archive contains nine internal verse-number gaps. These remain unchanged and are listed in the app's **Source notes** and `resources/bibles/validation.json`. No absent verse is fabricated. Trailing omissions cannot be inferred from the supplied numbering alone.

`Book24.html` and `Book25.html` both have the heading **Երեմիա**. They receive distinct stable IDs based on source file order. The five-chapter Book25 is labeled **Ողբ Երեմիայի** (short button **Ողբ**) to distinguish it; its original heading is retained in `sourceName`, and all verse text is unchanged. Full passage titles use full catalog names, not abbreviations.

Only Միաբանություն is currently bundled. Additional versions would need their own supplied text and catalog, rather than downloading or silently substituting another translation. Source HTML and test fixtures are excluded from packaged builds; generated Bible JSON is included.

## Windows, layout and security

The laptop control and presentation output are separate windows. The presentation contains no editing controls. Choose an external screen for fullscreen output or use a 16:9 windowed preview. Different resolution/scaling factors are supported by a uniformly scaled logical canvas.

Changing screens moves the output without changing the live text. Existing live slides retain their original aspect ratio and letterbox on differently shaped screens. Present again to adopt the prepared layout for the new display. Disconnection recovers the output to a window on the primary screen. Escape hides verses and keeps the photo fullscreen. Use Settings → Exit fullscreen to return to a window.

Pagination measures the same fonts, wrapping, margins and line spacing used by the presentation. It prefers verse boundaries, splits oversized verses at natural boundaries, and falls back to Unicode graphemes. Every character is retained; font sizes are not silently shrunk. Invalid layouts block Present with an error.

Both windows use context isolation, sandboxing and disabled Node integration. The preload exposes only specific operations; the main process validates IPC senders and mutations. Navigation, popups, permission requests and remote network access are denied in production. Rendered Bible text is never interpreted as HTML. No telemetry or remote fonts are used.

## Persistence and upgrade

Data is saved atomically to `library.json` in Electron's `app.getPath('userData')`: typically `~/Library/Application Support/Scripture Projector/` on macOS or `%APPDATA%/Scripture Projector/` on Windows (development may use `scripture-projector`). This includes the Bible, appearance, background images, queue and presentation history. History is not automatically pruned. Live output starts off-air after restart.

When upgrading the former import-based library, its original file is preserved as `library-before-bundled.json`. Appearance and backgrounds are preserved; queue/history references from matching source books migrate to stable bundled IDs. An unmatched old passage remains saved but cannot be prepared in the new catalog; the app reports this rather than selecting another book. Corrupt local data is preserved and reported at startup.

## Package and verify

```sh
npm test
npm run test:desktop
npm run package:mac -- --arm64
npm run package:win
```

The desktop test opens actual Electron windows, uses temporary app data, briefly tests fullscreen, and writes screenshots to `artifacts/`.

Packaging outputs go to `release/`. macOS targets DMG/ZIP; Windows targets NSIS/portable executable. Build each platform on its native OS. Intel/universal macOS builds can use `--x64` / `--universal`. Distribution signing/notarization requires your own credentials. Current local macOS builds are unsigned. `.github/workflows/build.yml` supplies native macOS/Windows build jobs but has not been run here. See `VALIDATION.md` for completed checks and platform limitations.

## Code map

- `scripts/build-bible.ts`, `src/bible-catalog.ts`: bundled version, stable IDs and abbreviations.
- `electron/parser.ts`: inert HTML extraction and diagnostics at build time.
- `electron/storage.ts`: persistence, history and upgrade migration.
- `electron/displays.ts`: display/window lifecycle.
- `electron/main.ts`, `electron/preload.ts`: secure desktop boundary and presentation history recording.
- `src/model.ts`, `src/hotkeys.ts`: passage selection, titles and shortcut mapping.
- `src/layout.ts`, `src/Stage.tsx`: shared measured preview/output layout.
- `src/App.tsx`: operator interface.

## Presentation options

- Search Scripture supports Whole Bible (default) or one selected book.
- Settings includes independent top, bottom, left and right margins, title/verse fonts,
  colors and alignment, and six title separator choices.
- Verse numbers display as superscripts. With “Start each verse on a new line” off,
  consecutive verses flow together and gaps in verse numbers start a new line.
- Text uses a brisk word-by-word reveal. Backgrounds crossfade, and reduced-motion
  preferences are respected.
- Add JPG, JPEG, PNG or WebP files to `resources/backgrounds/` to distribute them
  with every installation. Rebuild after adding images. They appear in both thumbnail
  galleries without overriding anyone's selected background.

## Repository setup and GitHub

The repository includes source, the npm lockfile, Bible source/generated data,
fonts and bundled background images. Dependencies, build output, installers,
verification screenshots, editor settings and local secrets are ignored.

Use Node.js 22 (`nvm use` if you use nvm), then run:

```sh
npm ci
npm run build
npm test
```

After creating an empty GitHub repository, review and publish the initial commit:

```sh
git status --short
git add .
git diff --cached --stat
git commit -m "Initial Scripture Projector application"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the URL with your own repository URL. The Build and test workflow runs on
pushes and pull requests on macOS and Windows. Desktop builds run on pushes to `main` or `master`, can be dispatched
manually, or triggered with a `v*` tag; installers are uploaded as workflow artifacts,
not automatically published as a GitHub Release. Signing credentials are not included.

No open-source license has been selected for the application code. Third-party
content retains its own rights: see `public/FONT-NOTICES.txt` for SHK Aida and the
font packages for their licenses. Keep image attribution alongside the photos when
required. The supplied Bible source is retained as provided.

## Download installers from GitHub Actions

Push this project to GitHub, then open **Actions → Desktop builds**. A push to
`main` or `master` starts packaging automatically. You can also select **Run workflow**
on the default branch or push a version tag such as `v1.4.0`.

Each successful run provides three downloads in its **Artifacts** section:

| Artifact | Contents |
| --- | --- |
| Scripture-Projector-macOS-Apple-Silicon | ARM64 `.dmg` installer and `.zip` containing the Mac app |
| Scripture-Projector-macOS-Intel | x64 `.dmg` installer and `.zip` containing the Mac app |
| Scripture-Projector-Windows-x64 | NSIS setup `.exe` and portable `.exe` |

Download and extract the artifact archive to get the installers. Artifacts are
retained for 30 days. These builds are unsigned and not notarized, so macOS and
Windows may show security prompts. The workflow does not require signing secrets
and does not create a public GitHub Release.
