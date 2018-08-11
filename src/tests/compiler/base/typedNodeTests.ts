import { expect } from "chai";
import { ClassDeclaration, FunctionDeclaration, Node, PropertyDeclaration, TypeAliasDeclaration, TypedNode, VariableStatement } from "../../../compiler";
import { TypedNodeStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypedNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("var myImplicitVar = 1; var myExplicitVar: string; type TypeAlias1 = string;");
    const implicitVarDeclaration = mainSourceFile.getVariableStatements()[0].getDeclarations()[0];
    const explicitVarDeclaration = mainSourceFile.getVariableStatements()[1].getDeclarations()[0];
    const typeAliasDeclaration = mainSourceFile.getTypeAliases()[0];

    describe(nameof<Node>(n => n.getType), () => {
        it("should get the expected implicit type", () => {
            expect(implicitVarDeclaration.getType().getText()).to.equal("number");
        });

        it("should get the expected explicit type", () => {
            expect(explicitVarDeclaration.getType().getText()).to.equal("string");
        });

        it("should get the expected type for a type alias", () => {
            expect(typeAliasDeclaration.getType().getText()).to.equal("string");
        });
    });

    describe(nameof<TypedNode>(n => n.getTypeNode), () => {
        it("should return undefined when no type node exists", () => {
            expect(implicitVarDeclaration.getTypeNode()).to.be.undefined;
        });

        it("should get the type node when it exists", () => {
            expect(explicitVarDeclaration.getTypeNode()!.getText()).to.equal("string");
        });

        it("should get the type node for a type alias", () => {
            expect(typeAliasDeclaration.getTypeNode()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypedNode>(n => n.getTypeNodeOrThrow), () => {
        it("should get the type node when it exists", () => {
            expect(explicitVarDeclaration.getTypeNodeOrThrow().getText()).to.equal("string");
        });

        it("should return undefined when no type node exists", () => {
            expect(() => implicitVarDeclaration.getTypeNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<TypedNode>(n => n.setType), () => {
        describe("class properties", () => {
            function doTest(startText: string, type: string, expectedText: string) {
                const {firstChild} = getInfoFromText<ClassDeclaration>(startText);
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setType(type);
                expect(firstChild.getText()).to.equal(expectedText);
            }

            it("should set when implicit, with a semi-colon, and initializer", () => {
                doTest(`class Identifier { prop = ""; }`, "any", `class Identifier { prop: any = ""; }`);
            });

            it("should set when explicit, with a semi-colon, no initializer", () => {
                doTest("class Identifier { prop: string; }", "number", "class Identifier { prop: number; }");
            });

            it("should set when explicit, without a semi-colon, no initializer", () => {
                doTest("class Identifier { prop: string }", "number", "class Identifier { prop: number }");
            });

            it("should set when explicit, with a semi-colon, with initializer", () => {
                doTest(`class Identifier { prop: string = ""; }`, "any", `class Identifier { prop: any = ""; }`);
            });

            it("should set when only has a question token", () => {
                doTest(`class Identifier { prop?; }`, "any", `class Identifier { prop?: any; }`);
            });

            it("should set when only has an exclamation token", () => {
                doTest(`class Identifier { prop!; }`, "any", `class Identifier { prop!: any; }`);
            });

            it("should remove when the type is empty", () => {
                doTest(`class Identifier { prop: string = ""; }`, "", `class Identifier { prop = ""; }`);
            });
        });

        describe("function parameters", () => {
            function doTest(startText: string, type: string, expectedText: string) {
                const {firstChild} = getInfoFromText<FunctionDeclaration>(startText);
                const param = firstChild.getParameters()[0];
                param.setType(type);
                expect(firstChild.getText()).to.equal(expectedText);
            }

            it("should set when implicit", () => {
                doTest(`function Identifier(param) {}`, "number", `function Identifier(param: number) {}`);
            });

            it("should set when implicit and multiple parameters", () => {
                doTest(`function Identifier(param, param2) {}`, "number", `function Identifier(param: number, param2) {}`);
            });

            it("should set when explicit", () => {
                doTest(`function Identifier(param: string) {}`, "number", `function Identifier(param: number) {}`);
            });

            it("should set when explicit and with an initializer", () => {
                doTest(`function Identifier(param: string = "") {}`, "any", `function Identifier(param: any = "") {}`);
            });

            it("should remove when the type is empty", () => {
                doTest(`function Identifier(param: string = "") {}`, "", `function Identifier(param = "") {}`);
            });
        });

        describe("type alias", () => {
            // todo: support this scenario
            /*
            it("should set when no type exists", () => {
                const {firstChild} = getInfoFromText<TypeAliasDeclaration>(`type Identifier;`);
                firstChild.setType("number");
                expect(firstChild.getText()).to.equal(`type Identifier = number;`);
            });
            */

            it("should set when type exists", () => {
                const {firstChild} = getInfoFromText<TypeAliasDeclaration>(`type Identifier = string;`);
                firstChild.setType("number");
                expect(firstChild.getText()).to.equal(`type Identifier = number;`);
            });

            it("should throw an error when providing nothing", () => {
                const {firstChild} = getInfoFromText<TypeAliasDeclaration>(`type Identifier = string;`);
                expect(() => firstChild.setType("")).to.throw();
            });
        });

        describe("variable declaration", () => {
            function doTest(startText: string, type: string, expectedText: string) {
                const {firstChild} = getInfoFromText<VariableStatement>(expectedText);
                const declaration = firstChild.getDeclarations()[0];
                declaration.setType(type);
                expect(firstChild.getText()).to.equal(expectedText);
            }

            it("should set when no type exists", () => {
                doTest(`var identifier;`, "number", `var identifier: number;`);
            });

            it("should set when type exists", () => {
                doTest(`var identifier: string;`, "number", `var identifier: number;`);
            });

            it("should set when type exists and initializer", () => {
                doTest(`var identifier: string = "";`, "number", `var identifier: number = "";`);
            });

            it("should set for other declaration in list", () => {
                const {firstChild} = getInfoFromText<VariableStatement>(`var var1, var2, var3;`);
                const declaration = firstChild.getDeclarations()[1];
                declaration.setType("number");
                expect(firstChild.getText()).to.equal(`var var1, var2: number, var3;`);
            });

            it("should remove when the type is empty", () => {
                doTest(`var identifier: string = "";`, "", `var identifier = "";`);
            });
        });
    });

    describe(nameof<TypeAliasDeclaration>(t => t.fill), () => {
        function doTest(startingCode: string, structure: TypedNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("type myAlias = string;", { type: "number" }, "type myAlias = number;");
        });

        it("should modify when setting as a writer function", () => {
            doTest("type myAlias = string;", { type: writer => writer.write("number") }, "type myAlias = number;");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("type myAlias = string;", {}, "type myAlias = string;");
        });
    });

    describe(nameof<TypedNode>(n => n.removeType), () => {
        function doTest(startText: string, expectedText: string) {
            const {firstChild} = getInfoFromText<ClassDeclaration>(startText);
            const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
            prop.removeType();
            expect(firstChild.getText()).to.equal(expectedText);
        }

        it("should remove when exists", () => {
            doTest(`class Identifier { prop: string = ""; }`, `class Identifier { prop = ""; }`);
        });

        it("should do nothing when not exists", () => {
            doTest(`class Identifier { prop = ""; }`, `class Identifier { prop = ""; }`);
        });

        it("should throw an error when removing a type alias", () => {
            const {firstChild} = getInfoFromText<TypeAliasDeclaration>(`type Identifier = string;`);
            expect(() => firstChild.removeType()).to.throw();
        });
    });
});
