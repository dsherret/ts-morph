import { assertEquals } from "jsr:@std/assert@0.225.3";
import { Project } from "./mod.ts";

// todo: Eventually all tests run for the node package should also be run for Deno
Deno.test("ts-morph basic tests", () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("test.ts", "class T {\n}");
  sourceFile.addClass({
    name: "Other",
  });
  assertEquals(sourceFile.getText(), `class T {\n}\n\nclass Other {\n}\n`);
});
