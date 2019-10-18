import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, ExportGetableNode, NamespaceDeclaration, VariableStatement, Node } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(ExportGetableNode), () => {
    describe(nameof<ExportGetableNode>(n => n.hasExportKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const node = getInfoFromText(text).firstChild as Node & ExportGetableNode;
            expect(node.hasExportKeyword()).to.equal(expected);
        }

        it("should have an export keyword when exported", () => {
            doTest("export var myVar = 1;", true);
        });

        it("should not have an export keyword when not exported", () => {
            doTest("var myVar = 1;", false);
        });
    });

    describe(nameof<ExportGetableNode>(n => n.getExportKeyword), () => {
        function doTest(text: string, expected: string | undefined, childSelector?: (node: Node) => Node & ExportGetableNode) {
            let node = getInfoFromText(text).firstChild as Node & ExportGetableNode;
            if (childSelector != null)
                node = childSelector(node);
            const keyword = node.getExportKeyword();
            if (expected != null)
                expect(keyword!.getText()).to.equal(expected);
            else
                expect(keyword).to.be.undefined;
        }

        it("should have an export keyword when exported", () => {
            doTest("export var myVar = 1;", "export");
        });

        it("should not have an export keyword when not exported", () => {
            doTest("var myVar = 1;", undefined);
        });

        describe("variable declaration", () => {
            const selectVariableDeclaration = (node: Node) => node.getFirstDescendantByKindOrThrow(SyntaxKind.VariableDeclaration);

            it("should have when exists", () => {
                doTest("export var myVar = 1;", "export", selectVariableDeclaration);
            });

            it("should not have when not exists", () => {
                doTest("var myVar = 1;", undefined, selectVariableDeclaration);
            });

            it("should not have in a for statement", () => {
                doTest("for (const t in u) {}", undefined, selectVariableDeclaration);
            });
        });
    });

    describe(nameof<ExportGetableNode>(n => n.getExportKeywordOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstChild } = getInfoFromText<VariableStatement>(text);
            if (expected != null)
                expect(firstChild.getExportKeywordOrThrow().getText()).to.equal(expected);
            else
                expect(() => firstChild.getExportKeywordOrThrow()).to.throw();
        }

        it("should have an export keyword when exported", () => {
            doTest("export var myVar = 1;", "export");
        });

        it("should not have an export keyword when not exported", () => {
            doTest("var myVar = 1;", undefined);
        });
    });

    describe(nameof<ExportGetableNode>(n => n.hasDefaultKeyword), () => {
        function doTest(text: string, expected: boolean) {
            const { firstChild } = getInfoFromText<VariableStatement>(text);
            expect(firstChild.hasDefaultKeyword()).to.equal(expected);
        }

        it("should have when has", () => {
            doTest("export default class Test {}", true);
        });

        it("should not have when not has", () => {
            doTest("var myVar = 1;", false);
        });
    });

    describe(nameof<ExportGetableNode>(n => n.getDefaultKeyword), () => {
        function doTest(text: string, expected: string | undefined, childSelector?: (node: Node) => Node & ExportGetableNode) {
            let node = getInfoFromText(text).firstChild as Node & ExportGetableNode;
            if (childSelector != null)
                node = childSelector(node);
            const keyword = node.getDefaultKeyword();
            if (expected != null)
                expect(keyword!.getText()).to.equal(expected);
            else
                expect(keyword).to.be.undefined;
        }

        it("should have when exists", () => {
            doTest("export default class Test {}", "default");
        });

        it("should not have when not exists", () => {
            doTest("export class Test {}", undefined);
        });
    });

    describe(nameof<ExportGetableNode>(n => n.getDefaultKeywordOrThrow), () => {
        function doTest(text: string, expected: string | undefined) {
            const { firstChild } = getInfoFromText<VariableStatement>(text);
            if (expected != null)
                expect(firstChild.getDefaultKeywordOrThrow().getText()).to.equal(expected);
            else
                expect(() => firstChild.getDefaultKeywordOrThrow()).to.throw();
        }

        it("should have when exists", () => {
            doTest("export default class Test {}", "default");
        });

        it("should not have when not exists", () => {
            doTest("export class Test {}", undefined);
        });
    });

    describe(nameof<ExportGetableNode>(n => n.isExported), () => {
        describe("regular", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<ClassDeclaration>(text);
                expect(firstChild.isExported()).to.equal(expected);
            }

            it("should not be exported when not", () => {
                doTest("class Identifier {}", false);
            });

            it("should be exported when default exported on a different line", () => {
                doTest("class Identifier {}\nexport default Identifier;", true);
            });

            it("should be exported when exported via an export statement on a different line", () => {
                doTest("class Identifier {}\nexport {Identifier};", true);
            });

            it("should be exported when default exported on the same line", () => {
                doTest("export default class Identifier {}", true);
            });

            it("should be when a named export", () => {
                doTest("export class Identifier {}", true);
            });
        });

        describe("class in namepsace", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<NamespaceDeclaration>(text);
                expect(firstChild.getClasses()[0].isExported()).to.equal(expected);
            }

            it("should be when exported from a namespace", () => {
                doTest("namespace Identifier { export class Identifier {} }", true);
            });

            it("should not be when not exported from a namespace", () => {
                doTest("namespace Identifier { class Identifier {} }", false);
            });
        });

        describe("variable declaration", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<VariableStatement>(text);
                expect(firstChild.getDeclarations()[0].isExported()).to.equal(expected);
            }

            it("should not be exported when not", () => {
                doTest("const t = 5;", false);
            });

            it("should be exported when default exported on a different line", () => {
                doTest("const t = 4, u = 3;\nexport default t;", true);
            });

            it("should not be exported when other declaration is default exported on a different line", () => {
                doTest("const t = 4, u = 3;\nexport default u;", false);
            });

            it("should be exported when exported via an export statement on a different line", () => {
                doTest("const t = 4, u = 3;\nexport {t};", true);
            });

            it("should not be exported when other declaration is exported via an export statement on a different line", () => {
                doTest("const t = 4, u = 3;\nexport {u};", false);
            });

            it("should be when a named export on the same line", () => {
                doTest("export const t = 4, u = 3;", true);
            });
        });
    });

    describe(nameof<ExportGetableNode>(n => n.isDefaultExport), () => {
        describe("regular", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<ClassDeclaration>(text);
                expect(firstChild.isDefaultExport()).to.equal(expected);
            }

            it("should be the default export when default exported on a different line", () => {
                doTest("class Identifier {}\nexport default Identifier;", true);
            });

            it("should be the default export when default exported on the same line", () => {
                doTest("export default class Identifier {}", true);
            });

            it("should not be a default export when not", () => {
                doTest("class Identifier {}", false);
            });

            it("should not be a default export when not and there exists another default export", () => {
                doTest("class Identifier {}\nexport default class Identifier2 {}", false);
            });
        });

        describe("variable declaration", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<VariableStatement>(text);
                expect(firstChild.getDeclarations()[0].isDefaultExport()).to.equal(expected);
            }

            it("should be the default export when default exported on a different line", () => {
                doTest("const t = 4, u = 5;\nexport default t;", true);
            });

            it("should not be the default export when a different declaration is default exported", () => {
                doTest("const t = 4, u = 5;\nexport default u;", false);
            });

            it("should not be when not", () => {
                doTest("const t = 4;", false);
            });
        });
    });

    describe(nameof<ExportGetableNode>(n => n.isNamedExport), () => {
        describe("regular", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<ClassDeclaration>(text);
                expect(firstChild.isNamedExport()).to.equal(expected);
            }

            it("should be a named export when one", () => {
                doTest("export class Identifier {}", true);
            });

            it("should be a when exported on a different line", () => {
                doTest("class Identifier {} export { Identifier };", true);
            });

            it("should not be a named export when it's a default export", () => {
                doTest("export default class Identifier {}", false);
            });

            it("should not be when default exported on a different line", () => {
                doTest("class Identifier {} export default Identifier;", false);
            });

            it("should not be a named export when neither a default or named export", () => {
                doTest("class Identifier {}", false);
            });

            it("should not be a named export when contained in a namespace", () => {
                const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Namespace { export class Identifier {} }");
                const innerClass = firstChild.getClasses()[0];
                expect(innerClass.isNamedExport()).to.be.false;
            });
        });

        describe("variable declaration", () => {
            function doTest(text: string, expected: boolean) {
                const { firstChild } = getInfoFromText<VariableStatement>(text);
                expect(firstChild.getDeclarations()[0].isNamedExport()).to.equal(expected);
            }

            it("should be a named export when one", () => {
                doTest("export const t = 4;", true);
            });

            it("should be when named exported on a different line", () => {
                doTest("const t = 4, u = 5; export { t };", true);
            });

            it("should not be when it's a default export", () => {
                doTest("const t = 4; export default t;", false);
            });

            it("should not be when another declaration is named exported on a different line", () => {
                doTest("const t = 4, u = 5; export { u };", false);
            });

            it("should not be when another declaration is default exported on a different line", () => {
                doTest("const t = 4, u = 5; export default u;", false);
            });

            it("should not be a named export when neither a default or named export", () => {
                doTest("const t = 5;", false);
            });

            it("should not be a named export when contained in a namespace", () => {
                const { firstChild } = getInfoFromText<NamespaceDeclaration>("namespace Namespace { export const t = 4; }");
                const innerClass = firstChild.getVariableDeclarations()[0];
                expect(innerClass.isNamedExport()).to.be.false;
            });
        });
    });
});
