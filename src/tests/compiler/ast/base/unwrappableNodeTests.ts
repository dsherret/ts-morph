import { expect } from "chai";
import { UnwrappableNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(UnwrappableNode), () => {
    describe(nameof<UnwrappableNode>(n => n.unwrap), () => {
        function doTest(startCode: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText(startCode);
            const nodeInBody = firstChild.getChildSyntaxListOrThrow().getChildren()[0];
            (firstChild as any as UnwrappableNode).unwrap();
            expect(() => firstChild.compilerNode).to.throw(); // should be forgotten
            expect(() => nodeInBody.compilerNode).to.not.throw();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should unwrap a namespace", () => {
            doTest(`namespace Test {
    var t: string;
    var u: string;
var v: string;
}`, `var t: string;\nvar u: string;\nvar v: string;`);
        });

        it("should unwrap a namespace with periods in name", () => {
            doTest(`namespace Test.This.Out {
    var t: string;
}`, `var t: string;`);
        });

        it("should unwrap with the correct indentation", () => {
            doTest(`
    namespace Test {
        var t: string;
    }`, `\n    var t: string;`);
        });

        it("should not unindent any string literals", () => {
            doTest(`namespace Test {
    var t = "some text \\
    goes here";
    var u = \`some text
    goes here\`;
    var v = \`some text
    goes here $\{test
    }more
    and $\{more}\`;
}`, `var t = "some text \\
    goes here";
var u = \`some text
    goes here\`;
var v = \`some text
    goes here $\{test
}more
    and $\{more}\`;`);
        });

        it("should unwrap a function", () => {
            doTest(`function myFunction(param: string) {
    var t: string;
}`, `var t: string;`);
        });
    });
});
