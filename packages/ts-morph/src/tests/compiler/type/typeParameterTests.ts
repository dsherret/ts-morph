import { expect } from "chai";
import { TypeParameter } from "../../../compiler";
import { getInfoFromText } from "../testHelpers";

describe(nameof(TypeParameter), () => {
    function getTypeParameter(text: string) {
        const { sourceFile } = getInfoFromText(text);
        const type = sourceFile.getVariableDeclarations()[0].getType();
        return type.getCallSignatures()[0].getTypeParameters()[0];
    }

    describe(nameof<TypeParameter>(s => s.getConstraint), () => {
        it("should be undefined when there isn't one", () => {
            const typeParam = getTypeParameter("let t: <T>() => void;");
            expect(typeParam.getConstraint()).to.be.undefined;
        });

        it("should get the constraint", () => {
            const typeParam = getTypeParameter("let t: <T extends string>() => void;");
            expect(typeParam.getConstraint()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameter>(s => s.getConstraintOrThrow), () => {
        it("should throw when there isn't one", () => {
            const typeParam = getTypeParameter("let t: <T>() => void;");
            expect(() => typeParam.getConstraintOrThrow()).to.throw();
        });

        it("should get the constraint", () => {
            const typeParam = getTypeParameter("let t: <T extends string>() => void;");
            expect(typeParam.getConstraintOrThrow().getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameter>(s => s.getDefault), () => {
        it("should be undefined when there isn't one", () => {
            const typeParam = getTypeParameter("let t: <T>() => void;");
            expect(typeParam.getDefault()).to.be.undefined;
        });

        it("should get the default type", () => {
            const typeParam = getTypeParameter("let t: <T = string>() => void;");
            expect(typeParam.getDefault()!.getText()).to.equal("string");
        });
    });

    describe(nameof<TypeParameter>(s => s.getDefaultOrThrow), () => {
        it("should throw when there isn't one", () => {
            const typeParam = getTypeParameter("let t: <T>() => void;");
            expect(() => typeParam.getDefaultOrThrow()).to.throw();
        });

        it("should get the default type", () => {
            const typeParam = getTypeParameter("let t: <T = string>() => void;");
            expect(typeParam.getDefaultOrThrow().getText()).to.equal("string");
        });
    });
});
