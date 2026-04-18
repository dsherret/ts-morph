# Logging Bugs

1. Start logging an issue in the [issue tracker](https://github.com/dsherret/ts-morph/issues).
2. Clearly identify the problem and submit some reproduction code.
   - Prune the reproduction to remove needless details.
3. State the current and expected behaviour.
4. State the version of ts-morph (always show a reproduction of the bug on the latest version).

# Contributing Bug Fixes

1. Follow the instructions above about logging a bug. In addition:
   1. State that you are going to work on the bug.
   2. Discuss major structural changes in the issue before doing the work to ensure it makes sense and work isn't wasted.
2. Start working on the fix in a branch of `latest` and submit a PR when done.

# Contributing Features

- Only minor features will be accepted.
- Breaking changes that aren't bug or design fixes will not be merged.

# Getting Started

See [DEVELOPMENT.md](DEVELOPMENT.md)

# Go Wasm Compiler Bridge

If you are contributing to the Go Wasm compiler bridge, please read the [Architecture Decision Record](rfcs/RFC-0002-Go-Wasm-Compiler-Migration.md).

### Testing Go Changes
Before submitting a PR, verify your Go changes against the TS-Morph test suite by compiling the new Wasm binary:
```bash
deno run -A scripts/build-wasm.ts
deno task test:wasm
```

### Submitting PRs for the Compiler
Because the Go compiler is tracked as a submodule (`packages/compiler-go-source`), please read the [PR Strategy Documentation](docs/PR_STRATEGY.md). Do **not** commit changes inside the submodule directly to the `ts-morph` repository without an upstream PR.
