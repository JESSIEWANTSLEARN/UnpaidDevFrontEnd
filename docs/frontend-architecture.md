# Frontend architecture

## Goal

Keep route components small, keep API access centralized, and separate stateful behavior from reusable presentation components.

## Dependency direction

```text
pages
  -> feature components
     -> hooks
        -> services
           -> config/api.js

components
  -> common components
  -> formatters and utilities
```

Lower layers must not import route pages. Presentation components should not call backend endpoints directly when a service or controller hook owns that request.

## Folder responsibilities

### `pages/`

Route entry points. A page normally chooses a feature shell or role dashboard and passes route-level options. Pages should not contain large tables, forms, or request logic.

### `components/`

UI grouped by feature. A component used only by one feature belongs inside that feature folder. Truly shared UI belongs in `components/shared`.

Recommended feature subfolders:

- `common/` for small presentation primitives
- `feedback/` for metrics, notices, alerts, and empty states
- `filters/` for search and filtering controls
- `forms/` for create and edit forms
- `layout/` for shells, headers, sidebars, and banners
- `sessions/` for session-specific panels
- `tables/` for data tables
- `utils/` for feature-local pure helpers

### `hooks/`

Controller logic using React hooks. Hooks own related state, loading, effects, filtering, action handlers, and coordination between components and services.

### `services/`

Backend request functions. Mutating requests should use `csrfFetch()` from `config/api.js` so cookies, CSRF refresh, and one retry after HTTP 419 remain consistent.

### `config/`

Environment-aware API configuration and static role/dashboard definitions.

### `utils/`

Pure functions that do not render UI, use React state, or call the backend.

## Role dashboard flow

1. A role page selects a role key.
2. `RoleDashboardShell` renders the common layout.
3. `useRoleDashboard` loads session and role data and exposes actions.
4. `RoleDashboardContent` selects the role-specific content component.
5. Tables and forms render data and call handlers supplied by the hook.
6. Services send the request to Laravel.

## User Admin flow

`UserAdminDashboardContent` now composes focused components:

- `useUserAdminDashboard` owns state, filters, loading, sessions, and mutations.
- `UserAdminFilters` owns search and filter controls.
- `CreateUserForm` and `EditUserPanel` own form state.
- `UserAdminUserTable` and `UserAdminAccessTable` render tabular data.
- `UserSessionsPanel` renders and controls session inspection.
- `UserAdminPrimitives` contains shared presentation building blocks.

## Sales and Purchasing flow

- `SalesDashboardContent` selects modules and composes sales primitives and tables.
- Sales formatting helpers live in `sales/utils`.
- Supplier and purchase-order forms live separately in `purchasing/forms`.
- `PurchasingActions.jsx` remains a small compatibility export so existing imports continue working.

## Change rules

When adding a feature:

1. Put the API request in `services/`.
2. Put stateful coordination in a hook when it grows beyond a small local interaction.
3. Put reusable display elements in `components/`.
4. Keep route pages focused on routing and composition.
5. Reuse existing CSS conventions before creating another global style system.
6. Preserve role permissions and preview-mode restrictions.
7. Test both normal and preview behavior before committing.
