---
description: Preserve Website kit's project-specific repository rules and verification workflow.
---

# Website kit agent guide

- Keep this repository project-neutral. Consumer names, URLs, navigation, and
  prose belong in consumer configuration or test fixtures.
- Preserve ordinary static-site behavior: assets must work from relative URLs
  and without a server-side runtime.
- Treat `gnatdoc/html/template` as source templates. Add required metadata
  through `render-gnatdoc-theme.mjs` rather than creating consumer copies.
- Run `npm test` and `git diff --check` after changes. Consumer-visible changes
  also require each affected repository's site build and link check.
- Code and original assets are dual MIT/Apache-2.0. The Geologica files under
  `assets/fonts` retain the bundled SIL Open Font License.
- Use focused Problem/Solution commit messages.
