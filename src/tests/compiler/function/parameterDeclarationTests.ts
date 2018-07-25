import { expect } from "chai";
import { FunctionDeclaration, ParameterDeclaration } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { ParameterDeclarationSpecificStructure, ParameterDeclarationStructure } from "../../../structures";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(ParameterDeclaration), () => {
    describe(nameof<ParameterDeclaration>(d => d.isRestParameter), () => {
        function doTest(startCode: string, isRestParameter: boolean) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isRestParameter()).to.be.equal(isRestParameter);
        }

        it("should be a rest parameter when is one", () => {
            doTest("function func(...param: string[]){}", true);
        });

        it("should not be a rest parameter when not one", () => {
            doTest("function func(param: string[]){}", false);
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.setIsRestParameter), () => {
        function doTest(startCode: string, isRestParameter: boolean, expectedCode: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ParameterDeclaration>(startCode, SyntaxKind.Parameter);
            descendant.setIsRestParameter(isRestParameter);
            expect(sourceFile.getFullText()).to.be.equal(expectedCode);
        }

        it("should not change when not changing", () => {
            doTest("function func(...param: string[]){}", true, "function func(...param: string[]){}");
        });

        it("should set as rest parameter", () => {
            doTest("function func(param: string[]){}", true, "function func(...param: string[]){}");
        });

        it("should remove as rest parameter", () => {
            doTest("function func(...param: string[]){}", false, "function func(param: string[]){}");
        });

        it("should add parens when there isn't any in an arrow function", () => {
            doTest("const t = u => '';", true, "const t = (...u) => '';");
        });

        it("should do nothing when setting to false and there are no parens", () => {
            doTest("const t = u => '';", false, "const t = u => '';");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.isParameterProperty), () => {
        function doTest(startCode: string, isParameterProperty: boolean) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isParameterProperty()).to.be.equal(isParameterProperty);
        }

        it("should be parameter property when has a scope", () => {
            doTest("function func(public param: any){}", true);
        });

        it("should be parameter property when is readonly", () => {
            doTest("function func(readonly param: any){}", true);
        });

        it("should not be parameter property when not readonly or having a scope", () => {
            doTest("function func(param: any){}", false);
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.isOptional), () => {
        function doTest(startCode: string, isOptional: boolean) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.equal(isOptional);
        }

        it("should be a optional when optional", () => {
            doTest("function func(param?: string){}", true);
        });

        it("should be a optional when has a default value", () => {
            doTest("function func(param = 4){}", true);
        });

        it("should be optional when has a rest parameter", () => {
            doTest("function func(...param: string[]){}", true);
        });

        it("should not be a optional otherwise", () => {
            doTest("function func(param: string){}", false);
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.fill), () => {
        function doTest(startCode: string, structure: Partial<ParameterDeclarationStructure>, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            firstParam.fill(structure);
            expect(sourceFile.getFullText()).to.be.equal(expectedCode);
        }

        it("should not modify when not changing", () => {
            doTest("function func(param: string) {}", {}, "function func(param: string) {}");
        });

        it("should modify when setting", () => {
            const structure: MakeRequired<ParameterDeclarationSpecificStructure> = {
                isRestParameter: true
            };
            doTest("function func(param: string) {}", structure, "function func(...param: string) {}");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(code);
            ArrayUtils.find(firstChild.getParameters(), p => p.getName() === nameToRemove)!.remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only parameter", () => {
            doTest("function identifier(param) {}", "param", "function identifier() {}");
        });

        it("should remove when it's the first parameter", () => {
            doTest("function identifier(param: string, param2) {}", "param", "function identifier(param2) {}");
        });

        it("should remove when it's the last parameter", () => {
            doTest("function identifier(param: string, param2?: string = '') {}", "param2", "function identifier(param: string) {}");
        });

        it("should remove when it's the middle parameter", () => {
            doTest("function identifier(param, param2, param3) {}", "param2", "function identifier(param, param3) {}");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.setHasQuestionToken), () => {
        function doTest(code: string, value: boolean, expectedCode: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ParameterDeclaration>(code, SyntaxKind.Parameter);
            descendant.setHasQuestionToken(value);
            expect(descendant.wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set when there is no parens in an arrow function", () => {
            doTest("const t = u => '';", true, "const t = (u?) => '';");
        });

        it("should set when there is parens in an arrow function", () => {
            doTest("const t = (u) => '';", true, "const t = (u?) => '';");
        });

        it("should do nothing when setting to false and there are no parens or question token", () => {
            doTest("const t = u => '';", false, "const t = u => '';");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.setInitializer), () => {
        function doTest(code: string, initializer: string, expectedCode: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ParameterDeclaration>(code, SyntaxKind.Parameter);
            descendant.setInitializer(initializer);
            expect(descendant.wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set when there is no parens in an arrow function", () => {
            doTest("const t = u => '';", "5", "const t = (u = 5) => '';");
        });

        it("should set when there is parens in an arrow function", () => {
            doTest("const t = (u) => '';", "5", "const t = (u = 5) => '';");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.setType), () => {
        function doTest(code: string, type: string, expectedCode: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ParameterDeclaration>(code, SyntaxKind.Parameter);
            descendant.setType(type);
            expect(descendant.wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should set the type when there is no parens in an arrow function", () => {
            doTest("const t = u => '';", "any", "const t = (u: any) => '';");
        });

        it("should set the type when there is parens in an arrow function", () => {
            doTest("const t = (u) => '';", "any", "const t = (u: any) => '';");
        });
    });
});
