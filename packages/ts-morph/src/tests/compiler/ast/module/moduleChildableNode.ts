import { expect } from "chai";
import { ModuleChildableNode, ModuleDeclaration } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("ModuleChildableNode", () => {
    describe(nameof.property<ModuleChildableNode>("getParentModule"), () => {
        it("should get the parent namespace when not using dot notation", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace { class MyClass {} }");
            expect(firstChild.getClasses()[0].getParentModule()).to.equal(firstChild);
        });

        it("should get the parent namespace when using dot notation", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.MyOtherNamespace { class MyClass {} }");
            expect(firstChild.getClasses()[0].getParentModule()).to.equal(firstChild);
        });

        it("should get the parent namespace when using dot notation with the module keyword", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("module MyNamespace.MyOtherNamespace { class MyClass {} }");
            expect(firstChild.getClasses()[0].getParentModule()).to.equal(firstChild);
        });

        it("should get the parent namespace for variable statements", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.MyOtherNamespace { const v; }");
            expect(firstChild.getVariableStatements()[0].getParentModule()).to.equal(firstChild);
        });

        it("should return undefined when not in a namespace", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.MyOtherNamespace { }");
            expect(firstChild.getParentModule()).to.equal(undefined);
        });
    });

    describe(nameof.property<ModuleChildableNode>("getParentModuleOrThrow"), () => {
        it("should get the parent namespace when it exists", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace { class MyClass {} }");
            expect(firstChild.getClasses()[0].getParentModuleOrThrow()).to.equal(firstChild);
        });

        it("should throw when not in a namespace", () => {
            const { firstChild } = getInfoFromText<ModuleDeclaration>("namespace MyNamespace.MyOtherNamespace { }");
            expect(() => firstChild.getParentModuleOrThrow()).to.throw();
        });
    });
});
