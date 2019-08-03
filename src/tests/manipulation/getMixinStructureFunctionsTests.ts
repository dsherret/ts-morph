import { expect } from "chai";
import * as compiler from "../../compiler";
import * as getMixinStructureFuncs from "../../manipulation/helpers/getMixinStructureFunctions";
import * as structures from "../../structures";
import { getInfoFromText } from "../compiler/testHelpers";

describe(nameof(getMixinStructureFuncs.fromAbstractableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.AbstractableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromAbstractableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when abstract", () => {
        doTest("abstract class MyClass {}", { isAbstract: true });
    });

    it("should get when not abstract", () => {
        doTest("class MyClass {}", { isAbstract: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromAmbientableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.AmbientableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromAmbientableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when ambient", () => {
        doTest("declare class MyClass {}", { hasDeclareKeyword: true });
    });

    it("should get when not ambient", () => {
        doTest("class MyClass {}", { hasDeclareKeyword: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromAsyncableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.AsyncableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromAsyncableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when async", () => {
        doTest("async function identifier() {}", { isAsync: true });
    });

    it("should get when not async", () => {
        doTest("function identifier() {}", { isAsync: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromAwaitableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.AwaitableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ForOfStatement>(startingCode);
        expect(getMixinStructureFuncs.fromAwaitableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when is a generator", () => {
        doTest("for await (const x of []) {}", { isAwaited: true });
    });

    it("should get when not a generator", () => {
        doTest("for (const x of []) {}", { isAwaited: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromExportableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ExportableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromExportableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when default export", () => {
        doTest("export default function identifier() {}", { isDefaultExport: true, isExported: true });
    });

    it("should get as not default export if default exported on a different statement", () => {
        doTest("function identifier() {}\nexport default identifier;", { isDefaultExport: false, isExported: false });
    });

    it("should get when an export", () => {
        doTest("export function identifier() {}", { isDefaultExport: false, isExported: true });
    });

    it("should get when not exported", () => {
        doTest("function identifier() {}", { isDefaultExport: false, isExported: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromGeneratorableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.GeneratorableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromGeneratorableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when is a generator", () => {
        doTest("function* identifier() {}", { isGenerator: true });
    });

    it("should get when not a generator", () => {
        doTest("function identifier() {}", { isGenerator: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromReturnTypedNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ReturnTypedNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromReturnTypedNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when has a return type", () => {
        doTest("function identifier(): string {}", { returnType: "string" });
    });

    it("should get when not has a return type", () => {
        doTest("function identifier() {}", { returnType: undefined });
    });
});

describe(nameof(getMixinStructureFuncs.fromStaticableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.StaticableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromStaticableNode(firstChild.getMembers()[0] as compiler.MethodDeclaration)).to.deep.equal(expectedStructure);
    }

    it("should get when is static", () => {
        doTest("class Identifier { static method() {} }", { isStatic: true });
    });

    it("should get when not static", () => {
        doTest("class Identifier { method() {} }", { isStatic: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromScopedNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ScopedNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromScopedNode(firstChild.getMembers()[0] as compiler.MethodDeclaration)).to.deep.equal(expectedStructure);
    }

    it("should get when has scope", () => {
        doTest("class Identifier { private method() {} }", { scope: compiler.Scope.Private });
    });

    it("should get when scope is not defined", () => {
        doTest("class Identifier { method() {} }", { scope: undefined });
    });
});

describe(nameof(getMixinStructureFuncs.fromScopeableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ScopeableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromScopeableNode(firstChild.getConstructors()[0].getParameters()[0])).to.deep.equal(expectedStructure);
    }

    it("should get when has scope", () => {
        doTest("class Identifier { constructor(private param: string) {} }", { scope: compiler.Scope.Private });
    });

    it("should get when scope is not defined", () => {
        doTest("class Identifier { constructor(param: string) {} }", { scope: undefined });
    });
});

describe(nameof(getMixinStructureFuncs.fromExtendsClauseableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ExtendsClauseableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.InterfaceDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromExtendsClauseableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get no extends", () => {
        doTest("interface Identifier {}", { extends: undefined });
    });

    it("should get when has extends", () => {
        doTest("interface Identifier extends First, Second<Third> { }", { extends: ["First", "Second<Third>"] });
    });
});

describe(nameof(getMixinStructureFuncs.fromImplementsClauseableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ImplementsClauseableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromImplementsClauseableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get no implements", () => {
        doTest("class Identifier {}", { implements: undefined });
    });

    it("should get when has implements", () => {
        doTest("class Identifier implements First, Second<Third> { }", { implements: ["First", "Second<Third>"] });
    });
});

describe(nameof(getMixinStructureFuncs.fromQuestionTokenableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.QuestionTokenableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromQuestionTokenableNode(firstChild.getMembers()[0] as compiler.PropertyDeclaration)).to.deep.equal(expectedStructure);
    }

    it("should get when has question token", () => {
        doTest("class Identifier { prop?: string; }", { hasQuestionToken: true });
    });

    it("should get when not has question token", () => {
        doTest("class Identifier { prop: string; }", { hasQuestionToken: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromReadonlyableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ReadonlyableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromReadonlyableNode(firstChild.getMembers()[0] as compiler.PropertyDeclaration)).to.deep.equal(expectedStructure);
    }

    it("should get when is readonly", () => {
        doTest("class Identifier { readonly prop: string; }", { isReadonly: true });
    });

    it("should get when not readonly", () => {
        doTest("class Identifier { prop: string; }", { isReadonly: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromTypedNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.TypedNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromTypedNode(firstChild.getMembers()[0] as compiler.PropertyDeclaration)).to.deep.equal(expectedStructure);
    }

    it("should get when has a type", () => {
        doTest("class Identifier { prop: string; }", { type: "string" });
    });

    it("should get when not has a type", () => {
        doTest("class Identifier { prop; }", { type: undefined });
    });
});

describe(nameof(getMixinStructureFuncs.fromInitializerExpressionableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.InitializerExpressionableNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromInitializerExpressionableNode(firstChild.getMembers()[0] as compiler.PropertyDeclaration)).to.deep
            .equal(expectedStructure);
    }

    it("should get when has a an initailizer", () => {
        doTest("class Identifier { prop = 'some value'; }", { initializer: "'some value'" });
    });

    it("should get when not has an initailizer", () => {
        doTest("class Identifier { prop; }", { initializer: undefined });
    });
});

describe(nameof(getMixinStructureFuncs.fromNamedNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.NamedNodeStructure>) {
        const { firstChild } = getInfoFromText<compiler.InterfaceDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromNamedNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get the name", () => {
        doTest("interface Identifier { }", { name: "Identifier" });
    });
});
