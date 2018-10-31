import { expect } from "chai";
import { SyntaxKind } from "typescript";
import { Statement } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Statement), () => {

    describe(nameof<Statement>(n => n.remove), () => {
        it("should remove the statement from its sourcefile", () => {
            const { sourceFile, project } = getInfoFromText(`const foo = 1; const bar = 2;`);
            const statement = sourceFile.getVariableDeclarationOrThrow("foo");
            statement.remove();

            expect(sourceFile.getText()).to.equals(`const bar = 2;`);
        });
    });

    describe(nameof<Statement>(n => n.moveToNewFile), () => {
        it("Should move the statement to a new file updating all references", () => {
            const { sourceFile, project } = getInfoFromText(`
export class SomeClass {}
export someInstance = new SomeClass();
`);
            const statement = sourceFile.getStatementByKindOrThrow(SyntaxKind.ClassDeclaration);
            const newFile = statement.moveToNewFile();

            expect(sourceFile.getText()).to.equals(`import { SomeClass } from "./SomeClass";

 someInstance = new SomeClass();
`);
            expect(newFile!.getFilePath()).to.equal("/SomeClass.ts");
            expect(newFile!.getText()).to.equals(`export class SomeClass {
}`);
        });
    });
});
