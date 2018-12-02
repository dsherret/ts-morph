---
name: Bug report
about: Create a report to help us improve

---

<!-- If you are contributing this bug fix then please read the instructions in CONTRIBUTING.md -->

**Describe the bug**

Version: X.X.X

<!-- A clear and concise description of what the bug is. -->

**To Reproduce**

<!-- Clearly identify the problem and submit some reproduction code. Prune the reproduction code to remove needless details. State the actual behaviour. -->

```ts
import { Project, ts } from "ts-simple-ast";

console.log(ts.version); // x.x.x <-- provide this

const project = new Project();
const sourceFile = project.createSourceFile("test.ts", ``);

// reproduce the problem here
```

**Expected behavior**

<!-- A clear and concise description of what you expected to happen. -->
