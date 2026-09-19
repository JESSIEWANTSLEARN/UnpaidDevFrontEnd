# Frontend development checklist

## Before editing

```powershell
cd C:\xampp\htdocs\dashboard\UnpaidDevFrontEnd
git status -sb
git branch --show-current
git pull --ff-only
```

Only merge the integration branch when the team has new changes to integrate:

```powershell
git fetch origin
git merge --no-edit origin/frontend-migration
```

Never discard uncommitted work to perform an update.

Confirm the backend health endpoint returns 200:

```powershell
(Invoke-WebRequest http://127.0.0.1:8000/up -UseBasicParsing).StatusCode
```

## During development

- Keep pages small and compositional.
- Keep backend requests in services.
- Use `csrfFetch()` for authenticated mutations.
- Use hooks for related state and side effects.
- Keep feature-only components inside the feature folder.
- Preserve Super Admin preview read-only behavior.
- Avoid changing real accounts, orders, inventory, or sessions merely for UI testing.

## Three-layer verification

### 1. Local behavior

- Open `http://127.0.0.1:5173`.
- Test every changed page and sidebar module.
- Test light and dark themes when applicable.
- Test preview and normal role behavior when applicable.
- Confirm navigation, cancel, close, and logout actions.

### 2. Browser developer tools

- Console: no new red application errors.
- Network: expected API requests return 200 or the documented success status.
- Confirm there is no repeating 401, 419, or 500 request loop.
- Inspect failed requests before assuming the problem is visual.
- Run Lighthouse when performance or accessibility changed materially.

### 3. Production build

```powershell
npm.cmd run build
git diff --check
git status -sb
git diff --stat
```

The production build must complete before committing.

## Commit workflow

Stage only the files belonging to one logical change:

```powershell
git add <paths>
git diff --cached --check
git diff --cached --stat
git diff --cached --summary
```

Commit with a focused message:

```powershell
git commit -m "type(scope): concise description"
git push
git status -sb
```

Common types:

- `feat` for a new capability
- `fix` for a defect correction
- `refactor` for structural changes without intended behavior changes
- `docs` for documentation only
- `test` for automated test changes
- `chore` for maintenance

## Pull request readiness

- Branch is pushed and synchronized.
- Build succeeds.
- Browser checks pass.
- No secrets or `.env` files are staged.
- No generated `dist/` or dependency folders are staged.
- Diff contains only intentional files.
- The pull request explains behavior changes, testing, and known limitations.
