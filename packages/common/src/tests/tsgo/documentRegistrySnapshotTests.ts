import { expect } from "chai";
import { DocumentRegistry } from "../../tsgo/documentRegistry";

/**
 * What a registry operation costs, in snapshots.
 *
 * A snapshot is a program clone and a round trip, and the whole of the deferral in
 * `DocumentRegistry` is that a *syntactic* operation opens none: a manipulation is a
 * text edit and a re-parse of one file, and nothing about it needs a program. Getting
 * that wrong the other way is worse than slow — an operation that needs semantics and
 * does not open a snapshot answers from a superseded program — so both directions are
 * asserted here rather than argued.
 */
describe("DocumentRegistry snapshots", () => {
  function newRegistry(files: Record<string, string> = { "/a.ts": "export class A {}\n" }) {
    return new DocumentRegistry({ files });
  }

  describe("what an edit costs", () => {
    it("should open one snapshot for a run of edits to the same file, at the next read", () => {
      const registry = newRegistry();
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      for (let i = 0; i < 8; i++)
        registry.parseSourceFileText("/a.ts", `export class A { m${i}() {} }\n`);
      expect(registry.snapshotsOpened - before).to.equal(0);

      expect(registry.getSourceFileOrThrow("/a.ts").text).to.equal("export class A { m7() {} }\n");
      expect(registry.snapshotsOpened - before).to.equal(1);
      registry.dispose();
    });

    it("should open one snapshot for a run of edits across several files", () => {
      const registry = newRegistry({ "/a.ts": "export class A {}\n", "/b.ts": "export class B {}\n" });
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      for (let i = 0; i < 4; i++) {
        registry.parseSourceFileText("/a.ts", `export class A { a${i}() {} }\n`);
        registry.parseSourceFileText("/b.ts", `export class B { b${i}() {} }\n`);
      }
      expect(registry.snapshotsOpened - before).to.equal(0);
      registry.program.getSourceFileNames();
      expect(registry.snapshotsOpened - before).to.equal(1);
      registry.dispose();
    });

    it("should open no snapshot at all for a run of creates that are then edited", () => {
      const registry = newRegistry({});
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      for (let i = 0; i < 20; i++) {
        registry.setSourceFileText(`/f${i}.ts`, `export class C${i} {}\n`);
        expect(registry.parseSourceFileAt(`/f${i}.ts`).text).to.equal(`export class C${i} {}\n`);
        registry.parseSourceFileText(`/f${i}.ts`, `export class C${i} { m() {} }\n`);
      }
      expect(registry.snapshotsOpened - before).to.equal(0);
      registry.dispose();
    });

    it("should not open a snapshot to say whether a file came from an external library", () => {
      const registry = newRegistry();
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      registry.parseSourceFileText("/a.ts", "export class A { m() {} }\n");
      expect(registry.isSourceFileFromExternalLibrary("/a.ts")).to.equal(false);
      expect(registry.snapshotsOpened - before).to.equal(0);
      registry.dispose();
    });

    it("should say a file no open project holds is not from an external library", () => {
      const registry = newRegistry();
      expect(registry.isSourceFileFromExternalLibrary("/a.ts")).to.equal(false);
      expect(registry.snapshotsOpened).to.equal(0);
      registry.dispose();
    });
  });

  /**
   * The doors, named as a list the code has to keep agreeing with.
   *
   * Everything semantic in ts-morph's public API — types, symbols, diagnostics,
   * references, rename, formatting, emit — reaches the compiler through one of these
   * four and therefore through a flush. A fifth added later is a stale answer rather
   * than a slow one, which is the failure mode nothing throws on, so the whole of the
   * registry's own surface is enumerated here: a member that is neither a door nor
   * classified as syntactic fails this test until someone decides which it is.
   */
  describe("the syntactic/semantic boundary", () => {
    const doors: Record<string, (registry: DocumentRegistry) => unknown> = {
      project: registry => registry.project,
      checker: registry => registry.checker,
      program: registry => registry.program,
      getSourceFile: registry => registry.getSourceFile("/a.ts"),
      getSourceFileOrThrow: registry => registry.getSourceFileOrThrow("/a.ts"),
      createOrUpdateSourceFile: registry => registry.createOrUpdateSourceFile("/a.ts", "export class A { c() {} }\n"),
      createOrUpdateSourceFiles: registry => registry.createOrUpdateSourceFiles([{ fileName: "/a.ts", text: "export class A { d() {} }\n" }]),
    };

    const syntactic: Record<string, (registry: DocumentRegistry) => unknown> = {
      parseSourceFileText: registry => registry.parseSourceFileText("/a.ts", "export class A { e() {} }\n"),
      parseSourceFileAt: registry => registry.parseSourceFileAt("/a.ts"),
      setSourceFileText: registry => registry.setSourceFileText("/a.ts", "export class A { f() {} }\n"),
      setCompilerOptions: registry => registry.setCompilerOptions({}),
      removeSourceFile: registry => registry.removeSourceFile("/b.ts"),
      getSourceFileVersion: registry => registry.getSourceFileVersion("/a.ts"),
      isSourceFileFromExternalLibrary: registry => registry.isSourceFileFromExternalLibrary("/a.ts"),
      snapshotsOpened: registry => registry.snapshotsOpened,
      dispose: registry => registry.dispose(),
    };

    it("should account for every member of the registry", () => {
      const classified = new Set([...Object.keys(doors), ...Object.keys(syntactic)]);
      const members = Object.getOwnPropertyNames(DocumentRegistry.prototype).filter(name => name !== "constructor");
      const unclassified = members.filter(name => !classified.has(name));
      expect(unclassified).to.deep.equal(
        [],
        "a new member of DocumentRegistry has to be named above as a door or as syntactic — see the comment on this describe",
      );
    });

    for (const [name, use] of Object.entries(doors)) {
      it(`should apply what is waiting when \`${name}\` is read`, () => {
        const registry = newRegistry({ "/a.ts": "export class A {}\n", "/b.ts": "export class B {}\n" });
        registry.program.getSourceFileNames();
        registry.parseSourceFileText("/a.ts", "export class A { m() {} }\n");
        const before = registry.snapshotsOpened;
        use(registry);
        expect(registry.snapshotsOpened - before).to.equal(1);
        registry.dispose();
      });
    }

    for (const [name, use] of Object.entries(syntactic)) {
      it(`should leave what is waiting alone when \`${name}\` is used`, () => {
        const registry = newRegistry({ "/a.ts": "export class A {}\n", "/b.ts": "export class B {}\n" });
        registry.program.getSourceFileNames();
        registry.parseSourceFileText("/a.ts", "export class A { m() {} }\n");
        const before = registry.snapshotsOpened;
        use(registry);
        expect(registry.snapshotsOpened - before).to.equal(0);
      });
    }
  });

  describe("changes waiting for the same path", () => {
    it("should keep a created file created when it is then changed", () => {
      const registry = newRegistry({});
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      registry.setSourceFileText("/new.ts", "export class N {}\n");
      registry.parseSourceFileText("/new.ts", "export class N { m() {} }\n");
      expect(registry.snapshotsOpened - before).to.equal(0);
      expect(registry.getSourceFileOrThrow("/new.ts").text).to.equal("export class N { m() {} }\n");
      expect(registry.snapshotsOpened - before).to.equal(1);
      registry.dispose();
    });

    it("should drop both reports for a file created and removed before either is applied", () => {
      const registry = newRegistry();
      registry.program.getSourceFileNames();
      const before = registry.snapshotsOpened;

      registry.setSourceFileText("/new.ts", "export class N {}\n");
      registry.removeSourceFile("/new.ts", { discardContents: true });
      expect(registry.snapshotsOpened - before).to.equal(0);
      expect(registry.getSourceFile("/new.ts")).to.equal(undefined);
      expect(registry.getSourceFileOrThrow("/a.ts").text).to.equal("export class A {}\n");
      registry.dispose();
    });

    it("should replace a waiting change with the deletion that follows it", () => {
      const registry = newRegistry({ "/a.ts": "export class A {}\n", "/b.ts": "export class B {}\n" });
      registry.program.getSourceFileNames();
      registry.parseSourceFileText("/b.ts", "export class B { m() {} }\n");
      registry.removeSourceFile("/b.ts", { discardContents: true });
      expect(registry.getSourceFile("/b.ts")).to.equal(undefined);
      registry.dispose();
    });

    it("should apply a waiting deletion before the same path is written again", () => {
      const registry = newRegistry({ "/a.ts": "export class A {}\n", "/b.ts": "export class B {}\n" });
      registry.program.getSourceFileNames();
      registry.removeSourceFile("/b.ts", { discardContents: true });
      const before = registry.snapshotsOpened;
      registry.setSourceFileText("/b.ts", "export class B2 {}\n");
      expect(registry.snapshotsOpened - before).to.equal(1);
      expect(registry.getSourceFileOrThrow("/b.ts").text).to.equal("export class B2 {}\n");
      registry.dispose();
    });
  });

  /**
   * A parse-only tree and the program's own are one object.
   *
   * They have to be: a caller that holds a node from one and a node from the other for
   * the same path holds two nodes equal in everything but identity, and identity is what
   * a client keying its own bookkeeping off nodes relies on. See SourceFileCache#offer.
   */
  it("should hand back the tree it parsed when the program is later read", () => {
    const registry = newRegistry();
    registry.program.getSourceFileNames();
    const parsed = registry.parseSourceFileText("/a.ts", "export class A { m() {} }\n");
    expect(registry.getSourceFileOrThrow("/a.ts")).to.equal(parsed);
    registry.dispose();
  });

  it("should hand back the tree it parsed for a file it created", () => {
    const registry = newRegistry({});
    registry.setSourceFileText("/new.ts", "export class N {}\n");
    const parsed = registry.parseSourceFileAt("/new.ts");
    expect(registry.getSourceFileOrThrow("/new.ts")).to.equal(parsed);
    registry.dispose();
  });
});
