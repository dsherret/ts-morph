import {expect} from "chai";
import {BodiedNode, NamespaceDeclaration} from "./../../../compiler";
import {BodiedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(BodiedNode), () => {
    describe(nameof<BodiedNode>(n => n.setBodyText), () => {
        function doTest(startCode: string, newText: string, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>(startCode);
            firstChild.setBodyText(newText);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        // most of these tests are in bodyableNodeTests
        it("should set the body text", () => {
            doTest("namespace identifier {}", "var myVar;", "namespace identifier {\n    var myVar;\n}");
        });
    });

    describe(nameof<NamespaceDeclaration>(n => n.fill), () => {
        function doTest(startCode: string, structure: BodiedNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>(startCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should set the text", () => {
            doTest("namespace identifier {\n}", { bodyText: "var myVar;" }, "namespace identifier {\n    var myVar;\n}");
        });
    });
});
