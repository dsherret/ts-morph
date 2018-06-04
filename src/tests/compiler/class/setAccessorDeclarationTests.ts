import { expect } from "chai";
import { ClassDeclaration, SetAccessorDeclaration } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

function getSetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const setAccessor = ArrayUtils.find(result.firstChild.getInstanceProperties(), f => f.getKind() === SyntaxKind.SetAccessor) as SetAccessorDeclaration;
    return {...result, setAccessor};
}

describe(nameof(SetAccessorDeclaration), () => {
    describe(nameof<SetAccessorDeclaration>(d => d.getGetAccessor), () => {
        it("should return undefined if no corresponding set accessor exists", () => {
            const {setAccessor} = getSetAccessorInfo(`class Identifier { set identifier(val: string) {} }`);
            expect(setAccessor.getGetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {setAccessor} = getSetAccessorInfo(code);
            expect(setAccessor.getGetAccessor()!.getText()).to.equal(`get identifier() { return ""; }`);
        });
    });

    describe(nameof<SetAccessorDeclaration>(d => d.getGetAccessorOrThrow), () => {
        it("should throw if no corresponding set accessor exists", () => {
            const {setAccessor} = getSetAccessorInfo(`class Identifier { set identifier(val: string) {} }`);
            expect(() => setAccessor.getGetAccessorOrThrow()).to.throw();
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {setAccessor} = getSetAccessorInfo(code);
            expect(setAccessor.getGetAccessorOrThrow().getText()).to.equal(`get identifier() { return ""; }`);
        });
    });

    describe(nameof<SetAccessorDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as SetAccessorDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("class Identifier {\n    set prop(val: string) { }\n}", "prop", "class Identifier {\n}");
        });

        it("should not remove the get accessor", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    get prop(): string { return ''; }\n}", "prop",
                "class Identifier {\n    get prop(): string { return ''; }\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    set prop2(val: string) {}\n}", "prop",
                "class Identifier {\n    set prop2(val: string) {}\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("class Identifier {\n    set prop(val: string) {}\n\n    set prop2(val: string) {}\n\n    set prop3(val: string) {}\n}", "prop2",
                "class Identifier {\n    set prop(val: string) {}\n\n    set prop3(val: string) {}\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("class Identifier {\n    prop: string;\n    set prop2(val: string) {}\n}", "prop2",
                "class Identifier {\n    prop: string;\n}");
        });
    });
});
