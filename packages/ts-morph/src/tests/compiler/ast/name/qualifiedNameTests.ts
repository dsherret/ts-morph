import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { QualifiedName, TypeReferenceNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(QualifiedName), () => {
    function getQualifiedName(text: string) {
        const { sourceFile } = getInfoFromText(text);
        const typeRefNode = sourceFile.getVariableDeclarations()[0].getTypeNodeOrThrow() as TypeReferenceNode;
        const qualifiedName = typeRefNode.getTypeName() as QualifiedName;
        expect(qualifiedName.getKind()).to.equal(SyntaxKind.QualifiedName);
        return qualifiedName;
    }

    describe(nameof<QualifiedName>(q => q.getRight), () => {
        it("should get the identifier on the right", () => {
            const qualifiedName = getQualifiedName("const t: Some.Qualified.Name<string>");
            expect(qualifiedName.getRight().getText()).to.equal("Name");
        });
    });

    describe(nameof<QualifiedName>(q => q.getLeft), () => {
        it("should get the qualified name on the left while it lasts", () => {
            const qualifiedName = getQualifiedName("const t: Some.Qualified.Name<string>");
            expect(qualifiedName.getLeft().getText()).to.equal("Some.Qualified");
            const leftQualifiedName = qualifiedName.getLeft() as QualifiedName;
            expect(leftQualifiedName.getRight().getText()).to.equal("Qualified");
            expect(leftQualifiedName.getRight().getKind()).to.equal(SyntaxKind.Identifier);
            expect(leftQualifiedName.getLeft().getText()).to.equal("Some");
            expect(leftQualifiedName.getLeft().getKind()).to.equal(SyntaxKind.Identifier);
        });
    });
});
