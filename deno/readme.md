# ts_morph

To use:

```ts
import { Project } from "https://deno.land/x/ts_morph@x.x.x/mod.ts";
```

Or import `@ts-morph/bootstrap`, which uses the same versioning as ts-morph:

```ts
import { createProject } from "https://deno.land/x/ts_morph@x.x.x/bootstrap/mod.ts";
```

Please note that this is currently only mostly useful for analyzing Node projects. See [#950](https://github.com/dsherret/ts-morph/issues/950) for details on making it easier to analyze Deno code.

Note: These modules are not tested that well as I have not implemented a way to test both the node and deno modules. Please let me know if you notice any behaviour differences with the node module.
