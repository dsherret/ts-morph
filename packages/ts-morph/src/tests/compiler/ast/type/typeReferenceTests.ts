import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TypeReferenceNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(TypeReferenceNode), () => {
    function getTypeReferenceNode(text: string) {
        const { sourceFile } = getInfoFromText(text);
        return sourceFile.getVariableDeclarations()[0].getTypeNodeOrThrow() as TypeReferenceNode;
    }

    describe(nameof<TypeReferenceNode>(t => t.getTypeName), () => {
        function doTest(text: string, expectedSyntaxKind: SyntaxKind, expectedTypeName: string) {
            const typeRefNode = getTypeReferenceNode(text);
            expect(typeRefNode.getTypeName().getKind()).to.equal(expectedSyntaxKind);
            expect(typeRefNode.getTypeName().getText()).to.equal(expectedTypeName);
        }

        it("should get the type name when an identifier", () => {
            doTest("const myVariable: Class<string>;", SyntaxKind.Identifier, "Class");
        });

        it("should get the type name when a fully qualified name", () => {
            doTest("const myVariable: Class.Tests<string>;", SyntaxKind.QualifiedName, "Class.Tests");
        });
    });

    describe(nameof<TypeReferenceNode>(t => t.getTypeArguments), () => {
        function doTest(text: string, expectedArgs: string[]) {
            const typeRefNode = getTypeReferenceNode(text);
            expect(typeRefNode.getTypeArguments().map(t => t.getText())).to.deep.equal(expectedArgs);
        }

        it("should return empty an empty array when there are no type args", () => {
            doTest("const myVariable: Class.Tests;", []);
        });

        it("should get the type args when an identifier", () => {
            doTest("const myVariable: Class<string>;", ["string"]);
        });

        it("should get the type args when a fully qualified name", () => {
            doTest("const myVariable: Class.Tests<string>;", ["string"]);
        });
    });
});
