import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration } from "../../../compiler";
import { PropertyDeclarationStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(PropertyDeclaration), () => {
    function getFirstPropertyWithInfo(code: string) {
        const opts = getInfoFromText<ClassDeclaration>(code);
        return { ...opts, firstProperty: opts.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<PropertyDeclaration>(n => n.fill), () => {
        function doTest(code: string, structure: Partial<PropertyDeclarationStructure>, expectedCode: string) {
            const {firstProperty, sourceFile} = getFirstPropertyWithInfo(code);
            firstProperty.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the property when nothing is set", () => {
            doTest("class Identifier { prop: string; }", {}, "class Identifier { prop: string; }");
        });

        it("should change the property when setting", () => {
            doTest("class Identifier { prop: string; }", { type: "number" }, "class Identifier { prop: number; }");
        });
    });

    describe(nameof<PropertyDeclaration>(n => n.remove), () => {
        function doTest(code: string, nameToRemove: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            (firstChild.getInstanceProperty(nameToRemove)! as PropertyDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it's the only property", () => {
            doTest("class Identifier {\n    prop: string;\n}", "prop", "class Identifier {\n}");
        });

        it("should remove when it's the first property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n}", "prop",
                "class Identifier {\n    prop2: string;\n}");
        });

        it("should remove when it's the middle property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n    prop3: string;\n}", "prop2",
                "class Identifier {\n    prop: string;\n    prop3: string;\n}");
        });

        it("should remove when it's the last property", () => {
            doTest("class Identifier {\n    prop: string;\n    prop2: string;\n}", "prop2",
                "class Identifier {\n    prop: string;\n}");
        });

        it("should remove when it's beside a method with a body", () => {
            doTest("class Identifier {\n    method(){}\n\n    prop: string;\n}", "prop",
                "class Identifier {\n    method(){}\n}");
        });

        it("should remove when it's inside two methods", () => {
            doTest("class Identifier {\n    method(){}\n\n    prop: string;\n\n    method2() {}\n}", "prop",
                "class Identifier {\n    method(){}\n\n    method2() {}\n}");
        });

        it("should remove when it's in an ambient class", () => {
            doTest("declare class Identifier {\n    method(): void;\n\n    prop: string;\n\n    method2(): void;\n}", "prop",
                "declare class Identifier {\n    method(): void;\n    method2(): void;\n}");
        });
    });
});
