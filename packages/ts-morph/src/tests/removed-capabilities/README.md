# Tests for removed capabilities

These cover API that tsgo does not provide, so they import exports that no longer
exist. Left in the tree deliberately: they are the record of what the migration
dropped, and they are the starting point if a capability is restored later.

They are excluded in `.mocharc.yml` because an import of a missing export throws
at module load, which aborts the entire mocha run rather than failing one test.

See `tsgo-wasm/BREAKING-CHANGES.md` for the full inventory and the reasoning.
