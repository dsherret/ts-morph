import {TsSimpleAst} from "./../TsSimpleAst";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`#${nameof<TsSimpleAst>(ast => ast.createSourceFileFromText)}`, () => {
        it("", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
            const enumDef = sourceFile.getEnumDeclarations()[0];
            enumDef.setName("NewName");
            const addedEnum = sourceFile.addEnumDeclaration({
                name: "MyNewEnum"
            });
            addedEnum.setName("MyOtherNewName");
            const enumMember = enumDef.getMembers()[0];
            enumMember.setName("myNewMemberName");
            expect(enumMember.getValue()).to.equal(0);
            expect(sourceFile.getFullText()).to.equal("enum NewName {\n    myNewMemberName\n}\nlet myEnum: NewName;\nlet myOtherEnum: MyOtherNewName;\nenum MyOtherNewName {\n}\n");
        });
    });
});
