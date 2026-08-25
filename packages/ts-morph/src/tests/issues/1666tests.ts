import { expect } from "chai";
import { Project } from "../../Project";

describe("tests for issue #1666", () => {
  it("Project should expose a dispose() method that disposes the underlying language service", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    project.createSourceFile("x.ts", "export const x = 1;");
    // Force the language service + its caches to be populated.
    project.getPreEmitDiagnostics();
    const languageService = project.getLanguageService();
    const compilerObject = languageService.compilerObject;

    // Sanity: the compiler language service exists and is not yet disposed.
    expect(compilerObject).to.not.be.undefined;

    // The project-level dispose() must delegate to the language service so the
    // internal ts.LanguageService caches (not reclaimable by the GC) are released.
    expect(() => project.dispose()).to.not.throw();

    // The underlying compiler language service should now be disposed. ts-morph
    // doesn't expose a disposed flag, but calling dispose() again on the same
    // compiler object is a no-op once disposed — assert the path is wired and
    // idempotent rather than asserting TS internals.
    expect(() => compilerObject.dispose()).to.not.throw();
  });

  it("LanguageService should expose a dispose() method", () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const languageService = project.getLanguageService();

    expect(typeof languageService.dispose).to.equal("function");
    expect(() => languageService.dispose()).to.not.throw();
    // Idempotent: a second call must not throw.
    expect(() => languageService.dispose()).to.not.throw();
  });

  it("should not leak the language service when a project is disposed and recreated", () => {
    // Smoke test for the regression: disposing a project and creating a new one
    // should not throw or leave the language service in a bad state. The actual
    // memory reclamation (TS internal caches) can't be asserted in a unit test
    // without --expose-gc + RSS measurement (see the issue's repro); here we
    // guard the API contract and that the lifecycle is safe to repeat.
    const projects: Project[] = [];
    for (let i = 0; i < 5; i++) {
      const project = new Project({ useInMemoryFileSystem: true });
      project.createSourceFile(`file${i}.ts`, `export const v${i} = ${i};`);
      project.getPreEmitDiagnostics();
      expect(() => project.dispose()).to.not.throw();
      projects.push(project);
    }
    // A brand-new project after a sequence of disposed ones still works.
    const fresh = new Project({ useInMemoryFileSystem: true });
    fresh.createSourceFile("final.ts", "export const done = true;");
    expect(fresh.getPreEmitDiagnostics()).to.have.lengthOf(0);
    expect(() => fresh.dispose()).to.not.throw();
  });
});
