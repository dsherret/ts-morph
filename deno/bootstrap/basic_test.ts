import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { createProjectSync } from "./mod.ts";

// todo: Eventually all tests run for the node package should also be run for Deno
Deno.test("bootstrap general tests", () => {
  const project = createProjectSync({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("test.ts", "class T {\n}\n");
  assertEquals(sourceFile.statements[0].getText(), `class T {\n}`);
});
