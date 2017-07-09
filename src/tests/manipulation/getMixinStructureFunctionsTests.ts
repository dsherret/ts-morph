import {expect} from "chai";
import * as compiler from "./../../compiler";
import * as structures from "./../../structures";
import {getInfoFromText} from "./../compiler/testHelpers";
import * as getMixinStructureFuncs from "./../../manipulation/getMixinStructureFunctions";

describe(nameof(getMixinStructureFuncs.fromAbstractableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.AbstractableNodeStructure>) {
        const {firstChild} = getInfoFromText<compiler.ClassDeclaration>(startingCode);
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
        const {firstChild} = getInfoFromText<compiler.ClassDeclaration>(startingCode);
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
        const {firstChild} = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromAsyncableNode(firstChild)).to.deep.equal(expectedStructure);
    }

    it("should get when async", () => {
        doTest("async function identifier() {}", { isAsync: true });
    });

    it("should get when not async", () => {
        doTest("function identifier() {}", { isAsync: false });
    });
});

describe(nameof(getMixinStructureFuncs.fromExportableNode), () => {
    function doTest(startingCode: string, expectedStructure: MakeRequired<structures.ExportableNodeStructure>) {
        const {firstChild} = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
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
        const {firstChild} = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
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
        const {firstChild} = getInfoFromText<compiler.FunctionDeclaration>(startingCode);
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
        const {firstChild} = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromStaticableNode(firstChild.getAllMembers()[0] as compiler.MethodDeclaration)).to.deep.equal(expectedStructure);
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
        const {firstChild} = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromScopedNode(firstChild.getAllMembers()[0] as compiler.MethodDeclaration)).to.deep.equal(expectedStructure);
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
        const {firstChild} = getInfoFromText<compiler.ClassDeclaration>(startingCode);
        expect(getMixinStructureFuncs.fromScopeableNode(firstChild.getConstructors()[0].getParameters()[0])).to.deep.equal(expectedStructure);
    }

    it("should get when has scope", () => {
        doTest("class Identifier { constructor(private param: string) {} }", { scope: compiler.Scope.Private });
    });

    it("should get when scope is not defined", () => {
        doTest("class Identifier { constructor(param: string) {} }", { scope: undefined });
    });
});
