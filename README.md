# Flyology website kit

This repository contains the static-site assets and GNATdoc presentation
shared by Flyology projects. Consumers pin it as a Git submodule and keep
their authored pages, project-specific styling, CNAME, and build policy in
their own repositories.

## Consumer integration

Add the repository outside the published `website/` tree:

```sh
git submodule add https://github.com/flyology-ada/website-kit.git vendor/website-kit
```

Install the shared browser assets into a site artifact:

```sh
node vendor/website-kit/scripts/install-assets.mjs build/site
```

Render the GNATdoc theme from project metadata before invoking GNATdoc:

```sh
node vendor/website-kit/scripts/render-gnatdoc-theme.mjs \
  website/gnatdoc-theme.json docs/gnatdoc/html
```

Generate and validate the finished documentation:

```sh
node vendor/website-kit/scripts/build-api-search-index.mjs docs/api
node vendor/website-kit/scripts/check-site.mjs build/site
```

`render-gnatdoc-theme.mjs` accepts these JSON fields:

- `pageTitle`
- `indexDescription`
- `indexTitle`
- `canonicalUrl`
- `brandLabel`
- `navigationHtml`
- `indexIntroduction`
- `footerNote`

All fields are required. `navigationHtml` is trusted repository-owned markup,
not user input.

## Verification

```sh
node --test test/*.test.mjs
```

Original code and artwork are available under either the MIT license or the
Apache License 2.0. The Geologica font remains covered by its bundled SIL Open
Font License.

## Agent setup

This repository uses APM 0.28.0 to provision pinned shared instructions and
skills for Codex and Claude. Before starting either client in a new clone or
worktree, run:

```sh
curl -sSL https://aka.ms/apm-unix | sh -s -- @v0.28.0
apm --version

apm install --frozen
apm compile --target codex
```

Start a fresh client session afterward so it discovers the generated skills.
Repository-specific instructions are packaged under `agent-packages/`; shared
instructions and skills come from `flyology-ada/agents`. Updating
`apm.lock.yaml` is a reviewed dependency change.
