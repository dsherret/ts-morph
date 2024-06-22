# ts_morph

To use:

```
deno add ts-morph@jsr:@ts-morph/ts-morph
```

```ts
import { Project } from "ts-morph";
```

Or use `@ts-morph/bootstrap`:

```
deno add @ts-morph/ts-morph
```

```ts
import { createProject } from "@ts-morph/bootstrap";
```

Please note that this is currently only mostly useful for analyzing Node projects. See [#950](https://github.com/dsherret/ts-morph/issues/950) for details on making it easier to analyze Deno code.

Note: These modules are not tested that well as I have not implemented a way to test both the node and deno modules. Please let me know if you notice any behaviour differences with the node module.
