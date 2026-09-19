---
name: Nura mobile layout
description: Mobile family-list layout constraint discovered while building the native Nura artifact.
---

Use full-width touch cards for Nura’s family member lists instead of percentage-based two-column pressables.

**Why:** Expo’s web preview can size percentage-width pressable wrappers from their intrinsic content, causing names to wrap vertically and cards to render much narrower than intended. Full-width rows are also more natural for a family list on a phone.

**How to apply:** Keep family member cards as vertically stacked, full-width native touch targets unless a future implementation uses a tested horizontal carousel or a different list primitive.