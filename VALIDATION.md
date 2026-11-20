# Validation and build status

Version 1.4.0 validated on macOS Apple Silicon (arm64), 2026-11-15.

## Passed

- `npm test`: ten core tests, including every bundled verse compared with all 66 source files, default-library upgrade with backup, persisted history, Armenian-layout hotkeys, plus the actual sample (Հռութ, four chapters, 84 verses), Unicode/punctuation, inert HTML parsing, duplicate rejection, missing-number diagnostics, verse-range selection, and storage round-trip.
- `npm run build`: TypeScript check, production React bundle, main-process and sandboxed preload bundles.
- `npm run test:desktop`: real Electron 45.3.2 windows, using isolated temporary application data. Exercises the ready-to-use 66-book Bible, absence of import controls/API, abbreviated book buttons, vertical chapters beside the books (including Psalm 150), normal click replacing selection, Ctrl and Command click toggling verses, settings dialog opening/closing, settings persistence and prepared/live isolation, modal shortcut guards, dividers after every ten verses, timestamped history, safe history recall, history after reload, chapter/verse hotkeys, shortcut help, renderer startup, context isolation/sandbox/disabled Node integration, separate output without controls, prepared/live separation, blackout/background/restore, multi-slide navigation, keyboard input guard, image and queue persistence, fullscreen entry, Escape keeping the photo fullscreen, Enter in the output presenting the prepared verses, and explicit fullscreen exit.
- Pagination preserved the complete text across 994 generated slides using Armenian sans/serif fonts and 16:9, 4:3, portrait and ultrawide canvases, with no photo, a 2304×1024 photo, and a portrait photo. The final desktop test also walked every slide of sample chapter 1 and checked the rendered text stayed inside the safe margins.
- Verified distinct persisted photos: Escape displays the 640×480 default image without text, and Enter switches to the 2304×1024 verse background with the prepared passage.
- Asserted the actual output title and verse area is contained inside the visible photo rectangle. Pagination and rendering share the same photo-relative margins.
- Verified a 2304×1024 photo retains its natural dimensions and uses contain fitting, without crop. Photo-only mode removes text and the dark overlay.
- Inspected captured control/settings/output screenshots for Armenian rendering and layout. Screenshots are in `artifacts/`.
- `npm run package:mac -- --arm64`: created the `.app`, DMG and ZIP in `release/`. Packaging completed successfully. These builds are unsigned and not notarized.
- UI screenshots were captured and inspected through the automated Electron test harness. Separate packaged-app UI automation has not been performed.

## Build matrix

| Target | Built here | Runtime tested here |
| --- | --- | --- |
| macOS arm64 production code | Yes | Yes, Electron integration suite |
| macOS arm64 DMG / ZIP | Yes | Not separately UI-tested; production runtime tested above |
| macOS Intel / universal | No | No |
| Windows NSIS / portable | Configuration supplied; not built here | No |

The GitHub Actions workflow can build native macOS and Windows artifacts when manually dispatched or when a version tag is pushed. It has not been run in this session.

## Still requires hardware/platform verification

- Moving fullscreen output between physical external displays with different resolutions/scaling.
- Actual cable disconnection/reconnection and operating-system-specific fullscreen Spaces behavior.
- Windows runtime and installer behavior.
- All 66 supplied files were parsed and checked. Nine verse-number gaps and the duplicated Jeremiah heading are documented in `resources/bibles/validation.json`; no missing text was substituted.
- Long service/rehearsal testing and legibility on the actual projector.

The dependency audit after updating Electron and Zod reported no high/critical advisories and six moderate advisories in electron-builder's minimatch packaging dependency chain. Those are build-tool dependencies, not imported Bible code. No forced major-version overrides were applied to the packaging toolchain.

## Reproduce

Use Node.js 22.12+:

```sh
npm ci
npm test
npm run test:desktop
npm run package:mac -- --arm64
```

`test:desktop` briefly opens windows and tests fullscreen. It writes screenshots to `artifacts/`, uses a temporary library, and exits automatically. Source HTML/test fixtures are excluded from the packaged application; the generated 66-book Bible JSON is included.
