import {expect} from "chai";
import {TypedNode, VariableStatement, TypeAliasDeclaration, ClassDeclaration, PropertyDeclaration, FunctionDeclaration} from "./../../../compiler";
import {TypedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TypedNode), () => {
    const {sourceFile: mainSourceFile} = getInfoFromText("var myImplicitVar = 1; var myExplicitVar: string; type TypeAlias1 = string;");
    const implicitVarDeclaration = mainSourceFile.getVariableStatements()[0].getDeclarationList().getDeclarations()[0];
    const explicitVarDeclaration = mainSourceFile.getVariableStatements()[1].getDeclarationList().getDeclarations()[0];
    const typeAliasDeclaration = mainSourceFile.getTypeAliases()[0];

    describe(nameof<TypedNode>(n => n.getType), () => {
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

    describe(nameof<TypedNode>(n => n.setType), () => {
        describe("class properties", () => {
            it("should set when implicit, with a semi-colon, and initializer", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>(`class Identifier { prop = ""; }`);
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setType("any");
                expect(firstChild.getText()).to.equal(`class Identifier { prop: any = ""; }`);
            });

            it("should set when explicit, with a semi-colon, no initializer", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { prop: string; }");
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setType("number");
                expect(firstChild.getText()).to.equal("class Identifier { prop: number; }");
            });

            it("should set when explicit, without a semi-colon, no initializer", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier { prop: string }");
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setType("number");
                expect(firstChild.getText()).to.equal("class Identifier { prop: number }");
            });

            it("should set when explicit, with a semi-colon, with initializer", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>(`class Identifier { prop: string = ""; }`);
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setType("any");
                expect(firstChild.getText()).to.equal(`class Identifier { prop: any = ""; }`);
            });
        });

        describe("function parameters", () => {
            it("should set when implicit", () => {
                const {firstChild} = getInfoFromText<FunctionDeclaration>(`function Identifier(param) {}`);
                const param = firstChild.getParameters()[0];
                param.setType("number");
                expect(firstChild.getText()).to.equal(`function Identifier(param: number) {}`);
            });

            it("should set when implicit and multiple parameters", () => {
                const {firstChild} = getInfoFromText<FunctionDeclaration>(`function Identifier(param, param2) {}`);
                const param = firstChild.getParameters()[0];
                param.setType("number");
                expect(firstChild.getText()).to.equal(`function Identifier(param: number, param2) {}`);
            });

            it("should set when explicit", () => {
                const {firstChild} = getInfoFromText<FunctionDeclaration>(`function Identifier(param: string) {}`);
                const param = firstChild.getParameters()[0];
                param.setType("number");
                expect(firstChild.getText()).to.equal(`function Identifier(param: number) {}`);
            });

            it("should set when explicit and with an initializer", () => {
                const {firstChild} = getInfoFromText<FunctionDeclaration>(`function Identifier(param: string = "") {}`);
                const param = firstChild.getParameters()[0];
                param.setType("any");
                expect(firstChild.getText()).to.equal(`function Identifier(param: any = "") {}`);
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
        });

        describe("variable declaration", () => {
            it("should set when no type exists", () => {
                const {firstChild} = getInfoFromText<VariableStatement>(`var identifier;`);
                const declaration = firstChild.getDeclarationList().getDeclarations()[0];
                declaration.setType("number");
                expect(firstChild.getText()).to.equal(`var identifier: number;`);
            });

            it("should set when type exists", () => {
                const {firstChild} = getInfoFromText<VariableStatement>(`var identifier: string;`);
                const declaration = firstChild.getDeclarationList().getDeclarations()[0];
                declaration.setType("number");
                expect(firstChild.getText()).to.equal(`var identifier: number;`);
            });

            it("should set when type exists and initializer", () => {
                const {firstChild} = getInfoFromText<VariableStatement>(`var identifier: string = "";`);
                const declaration = firstChild.getDeclarationList().getDeclarations()[0];
                declaration.setType("number");
                expect(firstChild.getText()).to.equal(`var identifier: number = "";`);
            });

            it("should set for other declaration in list", () => {
                const {firstChild} = getInfoFromText<VariableStatement>(`var var1, var2, var3;`);
                const declaration = firstChild.getDeclarationList().getDeclarations()[1];
                declaration.setType("number");
                expect(firstChild.getText()).to.equal(`var var1, var2: number, var3;`);
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

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("type myAlias = string;", {}, "type myAlias = string;");
        });
    });
});
