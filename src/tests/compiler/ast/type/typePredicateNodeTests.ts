import { expect } from "chai";
import { TypePredicateNode } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(TypePredicateNode), () => {
    function getTypePredicateNode(text: string) {
        const { sourceFile } = getInfoFromText(text);
        return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.TypePredicate);
    }

    describe(nameof<TypePredicateNode>(n => n.getParameterNameNode), () => {
        it("should get", () => {
            expect(getTypePredicateNode("function test(asdf): asdf is string {}").getParameterNameNode().getText(), "asdf");
        });
    });

    describe(nameof<TypePredicateNode>(n => n.getTypeNode), () => {
        it("should get", () => {
            expect(getTypePredicateNode("function test(asdf): asdf is string {}").getTypeNode().getText(), "string");
        });
    });
});
