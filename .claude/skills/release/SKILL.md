---
name: release
description: Ship a new version of Text Diff end to end. Checks the change, commits with Conventional Commits, pushes to main, watches the Release and Desktop workflows, verifies the GitHub release, installers and updater manifest, and tests the in-app update like a user. Use when asked to release, ship, publish, push a change for users, or cut a version.
---

# Release Text Diff

Every push to `main` runs `.github/workflows/release.yml`. semantic-release reads the commit messages and, when they call for a new version, it:
- bumps `package.json`
- writes `CHANGELOG.md`
- tags `vX.Y.Z`
- publishes the GitHub release

Each new tag then runs `.github/workflows/desktop.yml`. It builds the macOS (universal) installer, then the Windows installer, signs the update files with the updater key, and uploads them to that release with `latest.json`. Installed desktop apps read `latest.json` to offer the update.

## 1. Check the change

```bash
bun run lint
bunx tsc --noEmit && rm -f tsconfig.tsbuildinfo
bun run build
```

Project rules:
- No code comments.
- Nothing hardcoded: copy and config go in `src/config`, colors come from theme tokens.
- Use shadcn components.
- Use bun only.

## 2. Commit with Conventional Commits

| Commit prefix | Version change |
| --- | --- |
| `fix:` | patch, 0.3.0 → 0.3.1 |
| `feat:` | minor, 0.3.0 → 0.4.0 |
| `feat!:` or a `BREAKING CHANGE:` footer | major |
| `docs:` `chore:` `ci:` `refactor:` `test:` | no release |

Make one commit per user-facing change. Each subject becomes a bullet in the release notes and in the app's "What's new" dialog, so write subjects for users.

## 3. Push

Never push while a run is active. semantic-release skips publishing if `main` moves during its run.

```bash
gh run list --json status --jq '[.[] | select(.status != "completed")] | length'
git pull --rebase origin main && git push origin main
```

The first command must print `0`.

## 4. Watch

```bash
gh run list --limit 1
gh run watch <run-id> --exit-status
```

Jobs run in this order: release (lint, build, semantic-release), then desktop macOS, then desktop Windows. The builds take about 15 to 25 minutes. They run one at a time so that both platforms end up in `latest.json`.

## 5. Verify the release

```bash
gh release view vX.Y.Z --json body,assets --jq '{notes: (.body | length), assets: [.assets[].name]}'
curl -sL https://github.com/faysal-alfaleh/text-difference-opensource/releases/latest/download/latest.json
curl -sIL -o /dev/null -w "%{http_code}\n" https://github.com/faysal-alfaleh/text-difference-opensource/releases/latest/download/Text-Diff-macOS.dmg
curl -sIL -o /dev/null -w "%{http_code}\n" https://github.com/faysal-alfaleh/text-difference-opensource/releases/latest/download/Text-Diff-Windows-setup.exe
```

What to expect:
- The release notes are not empty.
- The assets include:
  - `Text-Diff-macOS.dmg`
  - `Text-Diff-macOS.app.tar.gz` and its `.sig`
  - `Text-Diff-Windows-setup.exe` and its `.sig`
  - `latest.json`
- `latest.json` has the new version, the release notes, and the platforms `darwin-aarch64`, `darwin-x86_64` and `windows-x86_64`. Its URLs point at `api.github.com` asset endpoints. That is expected, because the updater sends `Accept: application/octet-stream`.
- Both README download links return `200`.

## 6. Test the update like a user

1. Download the previous release's `.dmg` and copy `Text Diff.app` into `/Applications`.
2. Open it. The sidebar footer shows the old version.
3. After the new release is live, quit and reopen the app.
   - The app checks at launch and on focus, at most every 15 minutes (`releaseConfig.updateCheckMinimumIntervalMs`).
   - Reopening forces a check.
4. The "A new version is ready" dialog should list the new commits, include the GitHub card, and have **Update and restart**.
5. After updating, the footer shows the new version and commit.

## Fixing problems

- **Rebuild the installers for an existing tag.** This replaces that tag's assets:
  ```bash
  gh workflow run desktop.yml -f tag=vX.Y.Z
  ```
- **Release notes wiped.** Restore them from the matching `CHANGELOG.md` section:
  ```bash
  gh release edit vX.Y.Z --notes-file <file>
  ```
- **macOS missing from `latest.json`.** `bundle.targets` in `src-tauri/tauri.conf.json` must include `app`.
- **Updater key.** It lives in `~/.tauri/text-diff.key` and `~/.tauri/text-diff.key.password`, and in the repo secrets `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Never regenerate it: installed apps would reject every later update.
- **Code signing.** The installers are unsigned on purpose; the project uses no paid signing. The README tells users how to open them the first time.
