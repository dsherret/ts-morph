import {TsSimpleAst} from "./../TsSimpleAst";
import * as errors from "./../errors";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`constructor`, () => {
        it("should throw an exception if providing both a tsconfig.json and compiler options.", () => {
            expect(() => {
                // tslint:disable-next-line
                new TsSimpleAst({
                    tsConfigFilePath: "",
                    compilerOptions: {}
                });
            }).to.throw(errors.InvalidOperationError, "Cannot set both tsConfigFilePath and compilerOptions.");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.createSourceFileFromText), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst();
            ast.createSourceFileFromText("file.ts", "");
            expect(() => {
                ast.createSourceFileFromText("file.ts", "");
            }).to.throw(errors.InvalidOperationError, "A source file already exists at the provided file path: file.ts");
        });
    });

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
