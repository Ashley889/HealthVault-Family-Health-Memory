---
name: Account profile storage
description: Boundary between the organizer account screen and family health profiles.
---

The organizer’s basic account fields are stored as local preferences in the mobile preview and must remain separate from family member health profiles.

**Why:** The API currently models family health profiles, not an authenticated organizer account. Editing the account screen must not accidentally change a family member or expose medical fields as editable account data.

**How to apply:** Keep account edits limited to name, phone number, email address, and optional profile-photo support. Use the account preference layer until a dedicated authenticated account API exists.