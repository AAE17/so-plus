# SO+ landing page

Public landing page for **SO+** (Works & Estimates), an estimate tool for Gujarat Taluka Panchayat AAEs.
The app itself is at https://app.soplus.in.

Live page: https://aae17.github.io/so-plus/

## Editing the text

All visible text lives in `landing-text.txt` (one `key: text` per line, UTF-8).
Change only the text after the colon, then rebuild:

```
node apply-text.js
```

This fills `index.template.html` and writes `index.html`. Commit and push `index.html` (and `landing-text.txt`) to update the live page.
