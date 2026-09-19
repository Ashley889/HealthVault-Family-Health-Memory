---
name: Expo artifact dependencies
description: Dependency installation behavior for the mobile artifact in the pnpm workspace.
---

Expo packages must be added to the mobile artifact's package manifest, not the monorepo root. The generic package installer may invoke pnpm from the workspace root and refuse the add because of pnpm's root-package guard.

**Why:** The application imports dependencies from `artifacts/nura-mobile`; putting them at the root would leave the artifact manifest and deployment dependency graph incomplete.

**How to apply:** Use a workspace-targeted package add for dependencies required only by Nura Mobile, then run the mobile typecheck and restart its workflow when the dependency changes.