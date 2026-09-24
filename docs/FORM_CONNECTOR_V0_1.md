# ANWE Form Connector v0.1

This is an operator-only production integration. It does not alter `SITE_CONTEXT.json`, `SITE_MODEL.json`, or the Review Build pipeline.

1. Create a Google Sheet and add row-one headers. Use `timestamp` for the server timestamp; any other header maps to the same named form field.
2. Open **Extensions → Apps Script**, paste [`form-connectors/google-apps-script/Code.gs`](../form-connectors/google-apps-script/Code.gs), and set `CONFIG`: sheets only (`true/false`), email only (`false/true`), or both (`true/true`). Set `emailTo` for email modes.
3. Deploy **Web app** with access appropriate for public form submission (normally “Anyone”), then copy its `/exec` URL.
4. Create `sites/<site-id>/FORM_CONNECTOR.json` from the example below, replacing the endpoint and form id. The form id is `content.form.id` in the existing SiteModel; it is not a block id. The build rejects a connector that names no existing form.
5. Run `npm run check` and submit a real test lead. The hidden `_honeypot` field is included automatically; do not fill it.

```json
{
  "version": "0.1",
  "forms": {
    "landing-audit-request": {
      "endpoint": "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
    }
  }
}
```

The browser submits all successful named fields plus optional `pageUrl`, `source`, `userAgent`, and present UTM query values. A `no-cors` request is necessary for the standard GAS Web App endpoint, so a completed browser request is shown as success but its JSON response is not readable in the browser. Check the Sheet or inbox for end-to-end confirmation.

The script serializes Sheet appends with `LockService`, maps arbitrary fields from headers, and prefixes formula-like user values before writing them. Email includes every received field except `_honeypot`.
