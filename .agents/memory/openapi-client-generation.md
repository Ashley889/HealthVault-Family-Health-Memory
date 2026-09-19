---
name: OpenAPI client generation
description: A codegen constraint encountered when defining HealthVault list endpoints.
---

When an Orval operation combines a path parameter with a query parameter, the generated Zod barrel can emit a parameter type that collides with the operation parameter schema. Prefer a separate operation or a different contract shape when a filter is not essential.

**Why:** The workspace codegen failed during the library typecheck even though Orval itself completed successfully.

**How to apply:** After every OpenAPI change, run codegen and the library typecheck before wiring routes or UI hooks.