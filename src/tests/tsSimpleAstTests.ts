import {TsSimpleAst} from "./../TsSimpleAst";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`#${nameof<TsSimpleAst>(ast => ast.createSourceFileFromText)}`, () => {
        it("", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.txt", "enum MyEnum {}");
            expect(sourceFile.getText()).to.equal("enum MyEnum {}");
        });
    });
});
