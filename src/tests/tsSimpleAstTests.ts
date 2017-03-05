import {TsSimpleAst} from "./../TsSimpleAst";
import {TsEnumDeclaration} from "./../compiler";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`#${nameof<TsSimpleAst>(ast => ast.createSourceFileFromText)}`, () => {
        it("", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;");
            const enumDeclaration = sourceFile.getChildren()[0] as TsEnumDeclaration;
            enumDeclaration.getNameNode().rename("NewName");
            expect(sourceFile.getText()).to.equal("enum NewName {}\nlet myEnum: NewName;");
        });
    });
});
