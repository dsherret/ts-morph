import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ForgetfulNodeCache } from "../../factories/ForgetfulNodeCache";
import { getInfoFromText } from "../compiler/testHelpers";

describe(nameof(ForgetfulNodeCache), () => {
    it("should forget nodes created after a forget point", () => {
        const { firstChild } = getInfoFromText("class MyClass { prop: string; }");
        const cache = new ForgetfulNodeCache();
        cache.getOrCreate(firstChild.compilerNode, () => firstChild);

        cache.setForgetPoint();
        const classKeyword = firstChild.getFirstChildByKindOrThrow(SyntaxKind.ClassKeyword);
        cache.getOrCreate(classKeyword.compilerNode, () => classKeyword);

        cache.setForgetPoint();
        const openBraceToken = firstChild.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken);
        cache.getOrCreate(openBraceToken.compilerNode, () => openBraceToken);

        cache.forgetLastPoint();
        expect(openBraceToken.wasForgotten()).to.be.true;
        expect(classKeyword.wasForgotten()).to.be.false;
        expect(firstChild.wasForgotten()).to.be.false;

        cache.setForgetPoint();
        const closeBraceToken = firstChild.getFirstChildByKindOrThrow(SyntaxKind.CloseBraceToken);
        cache.getOrCreate(closeBraceToken.compilerNode, () => closeBraceToken);

        cache.forgetLastPoint();
        expect(closeBraceToken.wasForgotten()).to.be.true;
        expect(firstChild.wasForgotten()).to.be.false;
        const syntaxList = firstChild.getChildSyntaxListOrThrow();
        const property = syntaxList.getChildren()[0];
        cache.rememberNode(property);

        cache.forgetLastPoint();
        expect(openBraceToken.wasForgotten()).to.be.true;
        expect(closeBraceToken.wasForgotten()).to.be.true;
        expect(classKeyword.wasForgotten()).to.be.true;
        expect(property.wasForgotten()).to.be.false; // it was remembered
        expect(syntaxList.wasForgotten()).to.be.false; // it should remember the parents
        expect(firstChild.wasForgotten()).to.be.false;
    });
});
