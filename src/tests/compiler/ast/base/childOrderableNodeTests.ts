import { expect } from "chai";
import { ChildOrderableNode, EnumDeclaration } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ChildOrderableNode), () => {
    describe(nameof<ChildOrderableNode>(n => n.setOrder), () => {
        describe("enum", () => {
            function doThrowTest(startCode: string, newIndex: number) {
                const { sourceFile } = getInfoFromText(startCode);
                const enumDec = (sourceFile.getChildSyntaxListOrThrow().getChildren()[0] as EnumDeclaration);
                expect(() => enumDec.setOrder(newIndex)).to.throw();
            }

            it("should throw when specifying an index < 0", () => {
                doThrowTest("enum Identifier1 {}", -1);
            });

            it("should throw when specifying an index > child count - 1", () => {
                doThrowTest("enum Identifier1 {}", 1);
            });

            function doTest(startCode: string, oldIndex: number, newIndex: number, expectedCode: string) {
                const { sourceFile } = getInfoFromText(startCode);
                (sourceFile.getChildSyntaxListOrThrow().getChildren()[oldIndex] as EnumDeclaration).setOrder(newIndex);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should not change the order of the node when moving to the same index", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}", 0, 0, "enum Identifier1 {}\n\nenum Identifier2 {}");
            });

            it("should change the order of the node when there's two moving first to last", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}", 0, 1, "enum Identifier2 {}\n\nenum Identifier1 {}");
            });

            it("should change the order of the node when there's two moving last to first", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}", 1, 0, "enum Identifier2 {}\n\nenum Identifier1 {}");
            });

            it("should change the order of the node when there's three moving first to last", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}", 0, 2,
                    "enum Identifier2 {}\n\nenum Identifier3 {}\n\nenum Identifier1 {}");
            });

            it("should change the order of the node when there's three moving last to first", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}", 2, 0,
                    "enum Identifier3 {}\n\nenum Identifier1 {}\n\nenum Identifier2 {}");
            });

            it("should change the order of the node moving middle to first", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}", 1, 0,
                    "enum Identifier2 {}\n\nenum Identifier1 {}\n\nenum Identifier3 {}");
            });

            it("should change the order of the node moving middle to last", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}", 1, 2,
                    "enum Identifier1 {}\n\nenum Identifier3 {}\n\nenum Identifier2 {}");
            });

            it("should change the order of the node moving the first middle node to be the second middle node", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}\n\nenum Identifier4 {}", 1, 2,
                    "enum Identifier1 {}\n\nenum Identifier3 {}\n\nenum Identifier2 {}\n\nenum Identifier4 {}");
            });

            it("should change the order of the node moving the second middle node to be the first middle node", () => {
                doTest("enum Identifier1 {}\n\nenum Identifier2 {}\n\nenum Identifier3 {}\n\nenum Identifier4 {}", 1, 2,
                    "enum Identifier1 {}\n\nenum Identifier3 {}\n\nenum Identifier2 {}\n\nenum Identifier4 {}");
            });

            it("should change the order of the nodes when there's documentation going first to last", () => {
                doTest("/** Docs1 */\nenum Identifier1 {}\n/** Docs2 */\nenum Identifier2 {}", 0, 1,
                    "/** Docs2 */\nenum Identifier2 {}\n\n/** Docs1 */\nenum Identifier1 {}");
            });

            it("should change the order of the nodes when there's documentation going last to first", () => {
                doTest("/** Docs1 */\nenum Identifier1 {}\n/** Docs2 */\nenum Identifier2 {}", 0, 1,
                    "/** Docs2 */\nenum Identifier2 {}\n\n/** Docs1 */\nenum Identifier1 {}");
            });
        });

        describe("class member", () => {
            function doTest(startCode: string, oldIndex: number, newIndex: number, expectedCode: string) {
                const { sourceFile } = getInfoFromText(startCode);
                (sourceFile.getClasses()[0].getChildSyntaxListOrThrow().getChildren()[oldIndex] as any as ChildOrderableNode).setOrder(newIndex);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should change the order of the members when there's two, moving first to last", () => {
                doTest("class C {\n    prop: string;\n\n    method() {}\n}", 0, 1, "class C {\n    method() {}\n\n    prop: string;\n}");
            });

            it("should change the order of the members when there's two, moving last to first", () => {
                doTest("class C {\n    prop: string;\n\n    method() {}\n}", 1, 0, "class C {\n    method() {}\n\n    prop: string;\n}");
            });

            it("should change the order of the members when there's multiple, moving first to last", () => {
                doTest("class C {\n    p1: string;\n\n    m2() {}\n\n    p3: number;\n}", 0, 2,
                    "class C {\n    m2() {}\n\n    p3: number;\n    p1: string;\n}");
            });

            it("should change the order of the members when there's multiple, moving last to first", () => {
                doTest("class C {\n    p1: string;\n\n    m2() {}\n\n    p3: number;\n}", 2, 0,
                    "class C {\n    p3: number;\n    p1: string;\n\n    m2() {}\n}");
            });
        });

        describe("interface member", () => {
            function doTest(startCode: string, oldIndex: number, newIndex: number, expectedCode: string) {
                const { sourceFile } = getInfoFromText(startCode);
                (sourceFile.getInterfaces()[0].getChildSyntaxListOrThrow().getChildren()[oldIndex] as any as ChildOrderableNode).setOrder(newIndex);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should change the order of the members when there's two, moving first to last", () => {
                doTest("interface I {\n    prop: string;\n    method(): void;\n}", 0, 1, "interface I {\n    method(): void;\n    prop: string;\n}");
            });

            it("should change the order of the members when there's two, moving last to first", () => {
                doTest("interface I {\n    prop: string;\n\n    method(): void;\n}", 1, 0, "interface I {\n    method(): void;\n    prop: string;\n}");
            });

            it("should change the order of the members when there's multiple, moving first to last", () => {
                doTest("interface I {\n    p1: string;\n\n    m2(): void;\n    p3: number;\n}", 0, 2,
                    "interface I {\n    m2(): void;\n    p3: number;\n    p1: string;\n}");
            });

            it("should change the order of the members when there's multiple, moving last to first", () => {
                doTest("interface I {\n    p1: string;\n\n    m2(): void;\n    p3: number;\n}", 2, 0,
                    "interface I {\n    p3: number;\n    p1: string;\n\n    m2(): void;\n}");
            });
        });
    });
});
