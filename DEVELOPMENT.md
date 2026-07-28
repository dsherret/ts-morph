# Prerequisites

- [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)
- [Go](https://go.dev/dl/) and [Node](https://nodejs.org) — the TypeScript compiler this
  project uses is [tsgo](submodules/typescript-go), which is built from the submodule
  rather than installed from npm. The build compiles the tsgo CLI with `go build`, and
  the Wasm reactor it ships is produced by the submodule's own Node scripts.

# Getting Started

Clone with submodules (`git clone --recursive`, or `git submodule update --init --recursive`
in an existing clone), then build the tsgo compiler once:

```bash
cd submodules/typescript-go
npm ci
node _scripts/build-wasm.mjs
cd _packages/native-preview
npx tsc -b
```

Then run in the root of the repo:

```bash
# installs, sets up, and builds all the packages for development
deno task setup
```

# Packages

- [packages/ts-morph](packages/ts-morph)
- [packages/bootstrap](packages/bootstrap)
- [packages/common](packages/common) - Common code used by both of the packages above.
- [packages/scripts](packages/scripts) - Common scripts used at development time by both packages.

# Commands

```bash
# build (run in root dir or per package)
deno task build
# run tests (run in root dir or per package)
deno task --recursive test
# format
deno task format
```
