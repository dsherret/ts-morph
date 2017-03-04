import {TsSimpleAst} from "./../TsSimpleAst";
import {expect} from "chai";

describe(nameof(TsSimpleAst), () => {
    describe(`#${nameof<TsSimpleAst>(ast => ast.addSourceFileFromText)}`, () => {
        it("", () => {
            const ast = new TsSimpleAst();
            ast.addSourceFileFromText("MyFile.txt", "enum MyEnum {}");
            const sourceFile = ast.getSourceFiles()[0];
            expect(sourceFile.text).to.equal("enum MyEnum {}");
        });
    });
});
