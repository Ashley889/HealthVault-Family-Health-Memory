---
name: Expo web confirmations
description: Cross-platform confirmation behavior for Nura actions that mutate data or control navigation.
---

Use an in-app modal dialog for confirmations whose button callback triggers deletion, navigation, form reset, or another state change. Do not depend on `Alert.alert` button callbacks for these flows.

**Why:** In the Expo web preview, native alert feedback may not be exposed and its button callback may not execute. This caused successful requests to leave forms open, allowed duplicate submissions, and prevented confirmed deletion.

**How to apply:** Native alerts remain acceptable for simple error notices with no callback. Use the shared action dialog for Save, Create, Delete, Submit, Reschedule, Complete, Mark as missed, and logout confirmations.