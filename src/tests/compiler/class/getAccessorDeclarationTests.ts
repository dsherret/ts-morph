import { expect } from "chai";
import { ClassDeclaration, GetAccessorDeclaration } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

function getGetAccessorInfo(text: string) {
    const result = getInfoFromText<ClassDeclaration>(text);
    const getAccessor = ArrayUtils.find(result.firstChild.getInstanceProperties(), f => f.getKind() === SyntaxKind.GetAccessor) as GetAccessorDeclaration;
    return {...result, getAccessor};
}

describe(nameof(GetAccessorDeclaration), () => {
    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessor), () => {
        it("should return undefined if no corresponding get accessor exists", () => {
            const {getAccessor} = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(getAccessor.getSetAccessor()).to.be.undefined;
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {getAccessor} = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessor()!.getText()).to.equal("set identifier(val: string) {}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(d => d.getSetAccessorOrThrow), () => {
        it("should throw if no corresponding get accessor exists", () => {
            const {getAccessor} = getGetAccessorInfo(`class Identifier { get identifier(): string { return "" } }`);
            expect(() => getAccessor.getSetAccessorOrThrow()).to.throw();
        });

        it("should return the set accessor if a corresponding one exists", () => {
            const code = `class Identifier { get identifier() { return ""; } set identifier(val: string) {}\n` +
                `get identifier2(): string { return "" }\nset identifier2(value: string) {} }`;
            const {getAccessor} = getGetAccessorInfo(code);
            expect(getAccessor.getSetAccessorOrThrow().getText()).to.equal("set identifier(val: string) {}");
        });
    });

    describe(nameof<GetAccessorDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as GetAccessorDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only member", () => {
            doTest("class Identifier {\n    get prop(): string { return ''; }\n}", "prop", "class Identifier {\n}");
        });

        it("should not remove the set accessor", () => {
            doTest("class Identifier {\n    get prop(): string { return ''; }\n\n    set prop(val: string) {}\n}", "prop",
                "class Identifier {\n    set prop(val: string) {}\n}");
        });

        it("should remove when it's the first member", () => {
            doTest("class Identifier {\n    get prop(): string {}\n\n    get prop2(): string {}\n}", "prop",
                "class Identifier {\n    get prop2(): string {}\n}");
        });

        it("should remove when it's the middle member", () => {
            doTest("class Identifier {\n    get prop(): string {}\n\n    get prop2(): string {}\n\n    get prop3(): string {}\n}", "prop2",
                "class Identifier {\n    get prop(): string {}\n\n    get prop3(): string {}\n}");
        });

        it("should remove when it's the last member", () => {
            doTest("class Identifier {\n    prop: string;\n    get prop2(): string {}\n}", "prop2",
                "class Identifier {\n    prop: string;\n}");
        });
    });
});
