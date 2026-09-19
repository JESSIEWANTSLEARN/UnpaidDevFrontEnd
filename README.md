# WalangBrownout Frontend

React and Vite frontend for the WalangBrownout inventory, purchasing, warehouse, sales, user-administration, and customer-commerce system.

## Technology

- React 19
- React Router
- Vite 6
- Tailwind CSS tooling
- Laravel API backend with cookie-based authentication

## Prerequisites

- Node.js and npm
- The Laravel backend running locally
- XAMPP MySQL when using the local backend database

## Local setup

From the frontend repository:

```powershell
cd C:\xampp\htdocs\dashboard\UnpaidDevFrontEnd
npm.cmd ci
```

Create `.env` from `.env.example` if it does not exist:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the Laravel backend from its `framework` directory:

```powershell
cd C:\xampp\htdocs\dashboard\UnpaidDevBackEnd\framework
php artisan serve --host=127.0.0.1 --port=8000
```

Start the frontend in a separate terminal:

```powershell
cd C:\xampp\htdocs\dashboard\UnpaidDevFrontEnd
npm.cmd run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

## Commands

```powershell
# Development server
npm.cmd run dev -- --host 127.0.0.1

# Production build
npm.cmd run build

# Preview the production output locally
npm.cmd run preview
```

## Source organization

```text
resources/js/
  pages/        Route-level page components
  components/   Reusable and feature-specific UI
  hooks/        State, effects, and controller logic
  services/     Backend API requests
  config/       API and role configuration
  utils/        Pure formatting and transformation helpers

resources/css/
  auth/         Authentication screens
  customer/     Customer storefront
  sales/        Sales dashboards
  shared/       Shared role dashboard and session styles
  super-admin/  Super Admin workspace
  user-admin/   User Admin workspace
```

See [Frontend architecture](docs/frontend-architecture.md) for ownership rules and data flow. See [Development checklist](docs/development-checklist.md) before committing UI work.

## Environment variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Frontend `.env` or Render frontend environment | Laravel API base URL |

Never commit real passwords, database credentials, SMTP credentials, tokens, or production `.env` files.

## Branch workflow

UI improvements are developed on `feature/ui-improvements` and merged through a pull request into the team integration branch.

Before committing:

```powershell
npm.cmd run build
git diff --check
git status -sb
git diff --stat
```
