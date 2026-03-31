---
'my-portfolio': patch
---

Fix deferred section rendering in short landscape viewports. This removes the stalled deferred-section cascade, hardens orientation-change and near-page-end handling, improves reveal timing in short viewports, and adds regression coverage for landscape scrolling and deep-link navigation.
