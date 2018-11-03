import { expect } from "chai";
import { Statement } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(Statement), () => {
    describe(nameof<Statement>(n => n.remove), () => {
        it("should remove the statement from its sourcefile", () => {
            const { sourceFile } = getInfoFromText(`const foo = 1; const bar = 2;`);
            const statement = sourceFile.getVariableDeclarationOrThrow("foo");
            statement.remove();
            expect(sourceFile.getText()).to.equals(`const bar = 2;`);
        });
    });
});
