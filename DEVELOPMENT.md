# Prerequisites

This project requires [Deno](https://docs.deno.com/runtime/manual/getting_started/installation)

# Getting Started

Install [deno](https://deno.com).

Run in root of repo:

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
deno task test
# format
deno task format
```
