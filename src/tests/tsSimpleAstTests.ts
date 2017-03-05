import {TsSimpleAst} from "./../TsSimpleAst";
import {EnumDefinition} from "./../definitions";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`#${nameof<TsSimpleAst>(ast => ast.createSourceFileFromText)}`, () => {
        it("", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.ts", "enum MyEnum {}\nlet myEnum: MyEnum;");
            const enumDef = sourceFile.getEnums()[0];
            enumDef.setName("NewName");
            expect(sourceFile.getText()).to.equal("enum NewName {}\nlet myEnum: NewName;");
        });
    });
});
