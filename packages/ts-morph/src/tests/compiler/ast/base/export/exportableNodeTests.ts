import { expect } from "chai";
import { ClassDeclaration, ExportableNode, FunctionDeclaration, NamespaceDeclaration } from "../../../../../compiler";
import { errors } from "@ts-morph/common";
import { ExportableNodeStructure } from "../../../../../structures";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(ExportableNode), () => {
    describe(nameof<ExportableNode>(n => n.setIsDefaultExport), () => {
        function doTest(text: string, value: boolean, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(text);
            firstChild.setIsDefaultExport(value);
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        describe("setting as the default export", () => {
            it("should remove any existing default export and make the specified class the default export", () => {
                doTest("class Identifier {}\nexport default class Identifier2 {}", true, "export default class Identifier {}\nclass Identifier2 {}");
            });

            it("should remove any existing default export and make the specified class the default export when using a default export statement", () => {
                doTest("class Identifier {}\nclass Identifier2 {}\nexport default Identifier2;\n", true,
                    "export default class Identifier {}\nclass Identifier2 {}\n");
            });

            it("should do nothing if already the default export", () => {
                doTest("export default class Identifier {}", true, "export default class Identifier {}");
            });

            it("should add default if already an export", () => {
                doTest("export class Identifier {}", true, "export default class Identifier {}");
            });

            it("should set enums on a new line", () => {
                doTest("enum Identifier {}", true, "enum Identifier {}\n\nexport default Identifier;");
            });

            it("should set namespaces on a new line", () => {
                doTest("namespace Identifier {}", true, "namespace Identifier {}\n\nexport default Identifier;");
            });

            it("should set type aliases on a new line", () => {
                doTest("type Identifier = string;", true, "type Identifier = string;\n\nexport default Identifier;");
            });

            it("should throw an error if setting as a default export within a namespace", () => {
                const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Identifier { class Identifier {} }");
                const innerChild = firstChild.getClasses()[0];
                expect(() => innerChild.setIsDefaultExport(true)).to.throw(errors.InvalidOperationError);
            });

            it("should add the default export on a new line when ambientable", () => {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("/** Test */ export declare class Identifier {}");
                firstChild.setIsDefaultExport(true);
                expect(sourceFile.getFullText()).to.equal("/** Test */ export declare class Identifier {}\n\nexport default Identifier;");
            });
        });

        describe("unsetting as the default export", () => {
            it("should remove the default export", () => {
                doTest("export default class Identifier {}", false, "class Identifier {}");
            });

            it("should do nothing if already not the default export", () => {
                doTest("export class Identifier {}\nexport default class Identifier2 {}", false,
                    "export class Identifier {}\nexport default class Identifier2 {}");
            });
        });
    });

    describe(nameof<ExportableNode>(n => n.setIsExported), () => {
        function doTest(text: string, value: boolean, expected: string) {
            const { sourceFile, firstChild } = getInfoFromText<ClassDeclaration>(text);
            firstChild.setIsExported(value);
            expect(sourceFile.getText()).to.equal(expected);
        }

        function doInnerTest(text: string, value: boolean, expected: string) {
            const { sourceFile, firstChild } = getInfoFromText<NamespaceDeclaration>(text);
            const innerChild = firstChild.getClasses()[0];
            innerChild.setIsExported(value);
            expect(sourceFile.getText()).to.equal(expected);
        }

        describe("setting as exported", () => {
            it("should do nothing if already exported", () => {
                doTest("export class Identifier {}", true, "export class Identifier {}");
            });

            it("should add the export keyword if not exported", () => {
                doTest("class Identifier {}", true, "export class Identifier {}");
            });

            it("should add the export keyword if not exported to a class that has decorators", () => {
                doTest("@dec class Identifier {}", true, "@dec export class Identifier {}");
            });

            it("should do nothing if already exported from a namespace", () => {
                doInnerTest("namespace Identifier { export class Identifier {} }", true, "namespace Identifier { export class Identifier {} }");
            });

            it("should add the export keyword if not exported from a namespace", () => {
                doInnerTest("namespace Identifier { class Identifier {} }", true, "namespace Identifier { export class Identifier {} }");
            });

            it("should remove it as a default export keyword if one", () => {
                doTest("export default class Identifier {}", true, "export class Identifier {}");
            });

            it("should not remove it as a default export if one and exported in a separate statement", () => {
                doTest("class Identifier {}\nexport default Identifier;\n", true, "export class Identifier {}\nexport default Identifier;\n");
            });
        });

        describe("setting as not exported", () => {
            it("should do nothing if already not exported", () => {
                doTest("class Identifier {}", false, "class Identifier {}");
            });

            it("should remove the export keyword if exported", () => {
                doTest("export class Identifier {}", false, "class Identifier {}");
            });

            it("should remove the export keyword if exported and has another modifier", () => {
                doTest("export abstract class Identifier {}", false, "abstract class Identifier {}");
            });

            it("should do nothing if already not exported from a namespace", () => {
                doInnerTest("namespace Identifier { class Identifier {} }", false, "namespace Identifier { class Identifier {} }");
            });

            it("should remove the export keyword if exported from a namespace", () => {
                doInnerTest("namespace Identifier { export class Identifier {} }", false, "namespace Identifier { class Identifier {} }");
            });

            it("should remove it as a default export if one", () => {
                doTest("export default class Identifier {}", false, "class Identifier {}");
            });

            it("should remove it as a default export if one and setting to true", () => {
                doTest("export default class Identifier {}", true, "export class Identifier {}");
            });

            it("should not remove it as a default export if one and exported in a separate statement", () => {
                doTest("class Identifier {}\nexport default Identifier;\n", false, "class Identifier {}\nexport default Identifier;\n");
            });
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.set), () => {
        function doTest(startingCode: string, structure: ExportableNodeStructure, expectedCode: string) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("function myFunction() {}", {}, "function myFunction() {}");
        });

        it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
            doTest("export default function myFunction() {}", {}, "export default function myFunction() {}");
        });

        it("should modify when setting as export", () => {
            doTest("function myFunction() {}", { isExported: true }, "export function myFunction() {}");
        });

        it("should modify when setting as default export", () => {
            doTest("function myFunction() {}", { isDefaultExport: true }, "export default function myFunction() {}");
        });

        it("should be default export when setting as default export and exported", () => {
            doTest("function myFunction() {}", { isDefaultExport: true, isExported: true }, "export default function myFunction() {}");
        });
    });

    describe(nameof<FunctionDeclaration>(f => f.getStructure), () => {
        function doTest(startingCode: string, expectedStructure: { isDefaultExport: boolean; isExported: boolean; }) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startingCode);
            const structure = firstChild.getStructure();
            expect(structure.isDefaultExport).to.equal(expectedStructure.isDefaultExport);
            expect(structure.isExported).to.equal(expectedStructure.isExported);
        }

        it("should be false when not has", () => {
            doTest("function myFunction() {}", { isDefaultExport: false, isExported: false });
        });

        it("should be true when has export", () => {
            doTest("export function myFunction() {}", { isDefaultExport: false, isExported: true });
        });

        it("should be true when has export and default", () => {
            doTest("export default function myFunction() {}", { isDefaultExport: true, isExported: true });
        });
    });
});
