# Breaking News Tool Sunset Plan

## Summary

The legacy Breaking News Tool is part of `guardian/facia-tool`. It uses the old Knockout/JSPM frontend and sends app push notifications through mobile-n10n.

Dispatch in `guardian/notifications-tooling` now implements the main replacement flow, including app-push composition, production and test sends, authentication and permissions, notification history, delivery outcomes, and duplicate-send protection.

Removing the legacy tool consists of:

- Facia code changes
- Cross-team and operational work
- Main prerequisite: Dispatch must be live in PROD, verified, and available to all current users

Estimated Facia repository work: **6–8 engineering days**. Allow an additional **1–2 elapsed weeks** for the observation period, plus time for approvals and operational changes. These estimates exclude any new Dispatch feature work required to close the differences identified in Phase 1.

Dispatch does not appear to depend on Facia's `breaking-news` front, collections, configuration, permissions, or APIs. Confirm this operationally before removing them.

The `isBreaking` card metadata used by Fronts, Dotcom, and the mobile apps is separate from the notification tool. It should **not** be removed as part of this work.

---

## Phase 1: Confirm Dispatch

**Estimate:** 0.5–1 engineering day for verification, excluding approval lead time and any Dispatch feature work.

Before changing Facia:

- Confirm Dispatch's PROD mobile-n10n endpoint and API key are configured.
- Complete a controlled PROD push.
- Confirm Central Production has approved the workflow.
- Ensure existing users have `DispatchAccess` and `SendNotification`.
- Confirm Dispatch history records the authenticated editor and per-target outcomes.
- Check for dashboards, alarms, and log searches using:
  - `HandlingBreakingNewsUpdate`
  - `HandlingBreakingNewsCollection`
  - `HandlingBreakingNewsTrail`
- Identify users who currently have the `breaking_news_alert` permission.

### Important behaviour to preserve

The replacement must support the topic mappings currently defined in:

- `app/updates/BreakingNewsUpdate.scala`

Dispatch already supports breaking news, sport, Editors' Picks, and One Not To Miss across the UK, US, AU, Europe, and International editions. Before cutover, resolve these remaining differences:

- **UK general election alerts:** add the `uk-general-election` audience to Dispatch, or confirm that it is obsolete and will not be migrated.
- **Notification importance:** Facia derives major or minor importance from the collection group. Dispatch currently fixes breaking news as major and all other alert types as minor. Confirm this editorial policy or add a choice to Dispatch.
- **Global audiences:** Dispatch replaces Facia's global collections by selecting all editions. Confirm that this is acceptable to Central Production.

Run representative CODE sends from both tools and compare notification title, message, mobile topic list, importance, content link, media, sender identity, and mobile-n10n response. Cover regional and global breaking news and sport, Editors' Picks, One Not To Miss, and UK general election alerts if retained.

Do not proceed until Dispatch is approved as the production replacement.

---

## Phase 2: Freeze the Old Tool

**Estimate:** 0.5 engineering day for the change, followed by a 1–2 week observation period.

Stop new alerts from being sent through Facia before deleting any code.

Actions:

1. Revoke the `breaking_news_alert` permission from current users.
2. Ensure `facia-tool-allow-breaking-news-for-all` is disabled.
3. Change `/breaking-news` to show a decommissioned message or redirect users to Dispatch.
4. Monitor for an observation period agreed with Central Production. One or two weeks provides a conservative rollback window.
5. Confirm:

- Facia makes no new calls to mobile-n10n.
- No breaking-news collections are published.
- Dispatch handles all required alert types.
- No duplicate notifications are sent.

### Rollback

- Restore the `breaking_news_alert` permission.
- Restore the original `/breaking-news` redirect.
- Keep the Facia implementation intact until the observation period finishes.

---

## Phase 3: Remove the Backend

**Estimate:** 1.5–2 engineering days, including tests and Fronts publishing checks.

### Delete

- `app/updates/BreakingNewsUpdate.scala`
- `app/updates/ClientHydratedCollection.scala`
- `test/updates/BreakingNewsUpdateTest.scala`

### Edit

#### `app/updates/UpdateMessage.scala`

Remove:

- `HandlingBreakingNewsUpdate`
- `HandlingBreakingNewsCollection`
- `HandlingBreakingNewsTrail`

Before removal, confirm that no dashboards, alarms, saved searches, or Kinesis consumers still depend on these events. Dispatch already stores notification and delivery outcomes, so no replacement is needed unless an operational consumer relies on them.

#### `app/permissions/Permissions.scala`

Remove:

- `BreakingNewsAlert`

#### `app/permissions/PermissionsActionCheck.scala`

Remove:

- `BreakingNewsPermissionCheck`
- `BreakingNewsEditCollectionsCheck`

Keep the rest of the shared permission infrastructure.

#### `app/services/ConfigAgent.scala`

Remove:

- `getBreakingNewsCollectionIds`
- `isCollectionInBreakingNewsFront`

#### `app/controllers/FaciaToolController.scala`

Remove:

- The `BreakingNewsUpdate` constructor parameter
- The `BreakingNewsEditCollectionsCheck` mixin
- `maybeSendBreakingAlert`
- The call to `maybeSendBreakingAlert` from collection publishing

Do not change normal collection publishing.

#### `app/controllers/VanityRedirects.scala`

Remove the `breakingnews` action once the temporary decommissioned page or redirect is no longer needed.

#### `app/controllers/ViewsController.scala`

Remove:

- `checkIfBreakingNews`
- Breaking-news exceptions in `collectionEditor`
- Breaking-news exceptions in `shouldRedirectToV2`

#### `app/controllers/V2App.scala`

Remove the breaking-news permission lookup and the `breaking-news` ACL entry.

Do not remove card-level `isBreaking` support.

#### `app/controllers/DefaultsController.scala`

Remove the breaking-news permission lookup and the `breaking-news` ACL entry.

#### `app/Components.scala`

Remove:

- Construction of `BreakingNewsUpdate`
- Injection of it into `FaciaToolController`

#### `app/conf/Configuration.scala`

Remove the Facia configuration for:

- `breakingNewsFront`
- `notification.host`
- `notification.key`

#### `conf/routes`

Remove:

```text
GET /breaking-news controllers.VanityRedirects.breakingnews
```

#### `build.sbt`

Remove:

```scala
"com.gu" %% "mobile-notifications-api-models" % "4.0.0"
```

This dependency is only required by `BreakingNewsUpdate.scala`.

### Verification

Run:

```bash
sbt compile
sbt test
```

Confirm normal Fronts publishing still works.

---

## Phase 4: Remove the Legacy Frontend

**Estimate:** 1.5–2 engineering days, including legacy tests and Config Tool smoke testing.

### Delete

- `public/src/js/utils/modify-fields-for-breaking-news.js`
- `public/src/js/widgets/modals/confirm-breaking-changes.html`
- `public/src/js/widgets/modals/success-alert.html`
- `public/test/spec/breaking-news.spec.js`
- `public/test/fixtures/breaking-news-test-config.js`
- `public/test/utils/regions/breaking-news-modal.js`

### Edit

#### `public/src/js/constants/defaults.js`

Remove breaking-news-specific values, including:

- `restrictedHeadlineLength`
- Breaking-news entries in `restrictedLiveMode`
- Breaking-news entries in `askForConfirmation`
- Breaking-news entries in `disableSnapLinks`
- Breaking-news entries in `restrictedEditor`
- The `breaking-news/not-for-other-fronts` collection type

#### `public/src/js/widgets/columns/fronts.js`

Remove:

- `confirmSendingAlert`
- Alert-specific history limits
- Alert-specific drag-and-drop restrictions
- Alert-specific mode and confirmation branches

#### `public/src/js/models/collections/collection.js`

Remove:

- The `Send alert` publish label
- Alert confirmation handling
- `containsEmptyAlerts`
- Alert-specific error handling
- Breaking-news payload serialization

Keep normal draft and collection publishing behaviour.

#### `public/src/js/models/collections/article.js`

Remove the import from:

```text
utils/modify-fields-for-breaking-news.js
```

Return to the normal article metadata fields.

#### `public/src/js/constants/article-meta-fields.js`

Remove the V1-only breaking-news field.

Do not remove `isBreaking` from `fronts-client/src`.

#### `public/src/js/widgets/columns/fronts.html`

Remove the Breaking News mode tab.

#### `public/test/utils/regions.js`

Remove the `breakingNewsModal` import and export.

### Verification

Run the legacy frontend test and build commands used by the repository, including:

```bash
npm test
```

Also confirm the V1 Config Tool still works. JSPM and Grunt cannot be removed because they are still used by the Config Tool.

---

## Phase 5: Remove the Front and External Configuration

**Estimate:** 0.5–1 engineering day, plus operational lead time for approvals and credential or monitoring changes.

Only start this phase after confirming Dispatch does not use Facia's configuration.

### Facia data

- Back up the current `breaking-news` front and collection data.
- Remove the `breaking-news` front from the Facia config.
- Remove or archive its associated collections.
- Apply the change in CODE first, then PROD.
- Confirm `facia-press` does not report errors for the removed front.

### External cleanup

- Retire the `breaking_news_alert` permission.
- Remove the `facia-tool-allow-breaking-news-for-all` switch.
- Remove Facia’s `notification.host` and `notification.key` parameters.
- Revoke Facia’s mobile notifications API credential, if client-specific.
- Preserve Dispatch's separate mobile-n10n credentials.
- Update or remove related CloudWatch alarms and dashboards.
- Update or remove related Kibana searches and alerts.
- Check Kinesis consumers before deleting the `HandlingBreakingNews*` message types.
- Verify CDK and CloudFormation contain no breaking-news-specific access rules.
- Inform the mobile-n10n owners that Facia no longer calls `/push/topic`.

---

## Phase 6: Update Documentation

**Estimate:** 0.5 engineering day.

### Edit

- `README.md`
- `GUIDE_TO_FRONTS.md`
- `docs/Glossary.md`
- `scripts/setup.sh`

Remove references to the old tool, its URL, its workflow, and the “Breaking News tool (Fronts Tool V1)” setup wording.

Add a short note pointing editors to the replacement tool where useful.

Also update the Dispatch `README.md` to reflect the implemented app-push integration and document the agreed decisions for UK general election alerts, notification importance, global audience selection, and production verification.

---

## Phase 7: Deploy and Monitor

**Estimate:** 0.5 engineering day for deployment and checks, followed by at least 48 hours of monitoring.

1. Deploy to CODE.
2. Test normal Fronts and Config Tool workflows.
3. Deploy to PROD.
4. Monitor for at least 48 hours.

Check:

- No requests from Facia to `/push/topic`
- No `HandlingBreakingNews*` messages
- No errors from `facia-press`
- No increase in failures for normal collection publishing
- No unexpected traffic to the removed `/breaking-news` route
- Dispatch records delivery outcomes and notification history
- Central Production can send all required alerts through Dispatch

### Rollback

- Revert the backend and frontend removal PRs.
- Restore the archived Facia front configuration.
- Restore parameters and permissions if necessary.

For easier rollback, keep code removal and data/infrastructure cleanup in separate changes.

---

## Out of Scope

Do not remove `isBreaking` from `fronts-client/src`.

It is card display metadata rather than part of notification sending. It may still be consumed by:

- Dotcom
- Guardian mobile apps
- `guardian/facia-scala-client`

Removing it requires a separate cross-project investigation.

---

## Recommended PR Breakdown

1. **PR 1:** Temporary decommissioned page or redirect
2. **PR 2:** Backend sending and permission removal
3. **PR 3:** Legacy frontend and test removal
4. **PR 4:** Documentation cleanup
5. **Dispatch change, if required:** Election audience or importance behaviour
6. **Operational change:** Remove Facia front data
7. **Infrastructure change:** Retire Facia permissions, switches, credentials, and monitoring

This keeps each change reviewable and makes rollback safer.
