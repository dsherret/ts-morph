import { expect } from "chai";
import { TypeGuards } from "../../utils";
import { getInfoFromText } from "../compiler/testHelpers";
import { SyntaxKind } from "../../typescript";
import "chai/register-should";

describe(nameof(TypeGuards), () => {
    // most of the code in TypeGuards is not worth the effort to test... it's auto generated from code so it should be close to correct

    describe(nameof(TypeGuards.hasExpression), () => {
        it("should have an expression when it's a function call", () => {
            const { firstChild } = getInfoFromText("funcCall()");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("funcCall()");
        });

        it("should not have an expression when it doesn't", () => {
            const { firstChild } = getInfoFromText("class Test {}");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });

        it("should have an expression when it's a return statement with a value", () => {
            const { firstChild } = getInfoFromText("return 5;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("5");
        });

        it("should not have an expression when it's a return statement without a value", () => {
            const { firstChild } = getInfoFromText("return;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });
    });

    describe(nameof(TypeGuards.hasName), () => {
        it("should have a name when it does", () => {
            const { firstChild } = getInfoFromText("class MyClass {}; import {a} from 'b'");
            expect(TypeGuards.hasName(firstChild)).to.be.true;
            if (TypeGuards.hasName(firstChild))
                expect(firstChild.getName()).to.equal("MyClass");
        });

        it("should not have a name when it doesn't", () => {
            const { firstChild } = getInfoFromText("func()");
            expect(TypeGuards.hasName(firstChild)).to.be.false;
        });

        xit("should never throw", () => { // is throwing!
            const { sourceFile } = getInfoFromText(`export default function(){}`);
            sourceFile.getDescendants().forEach(node => {
                const nodeLabel = node.getKindName() + "-" + node.getText();
                expect(() => TypeGuards.hasName(node), nodeLabel).not.to.throw();
            });
        });

        it("should have name if it's an identifier", () => {
            const { sourceFile } = getInfoFromText(`import {a} from 'foo'; let b:c;`);
            sourceFile.getDescendants().filter(TypeGuards.isIdentifier).forEach(node => {
                const nodeLabel = node.getKindName() + "-" + node.getText();
                expect(TypeGuards.hasName(node) || nodeLabel, `no name found for identifier ${node.getText()}` ).to.be.true;
            });
        });

        xit("should have a name if it is renameable", () => {
            // TODO: like we did for "should be renameable if it has a name" but viceversa
        });
    });

    describe(nameof(TypeGuards.isRenameableNode), () => {
        it("should be renameable when it is a declaration that has name", () => {
            const { sourceFile } = getInfoFromText(`
                function a(){}; var b = 1; class c{}; interface d{f();h:string};
                export default function e(){};export type g = typeof b`);
            ["a", "b", "c", "d", "e", "f", "g"].forEach(name => {
                const node = sourceFile.getDescendants().find(n => TypeGuards.isDeclaration(n) &&
                    TypeGuards.hasName(n) && n.getName() === name);
                expect(!!node, `no declaration node with name ${name} found`).to.be.true;
                const notRenameableLabel = { text: node!.getText(), kind: node!.getKindName() };
                expect(TypeGuards.isRenameableNode(node!) || notRenameableLabel).to.be.true;
            });
        });

        xit("should be renameable if it has a name", () => {
            const { sourceFile } = getInfoFromText(`
                import {g} from 'g_'; const c = function (h: i): j { var k = l as m; }
            `);
            ["g", "h", "i", "j", "k", "l", "m"].forEach(name => {
                const node = sourceFile.getDescendants().find(n => TypeGuards.hasName(n) && n.getName() === name)!;
                expect(!!node, `no node with name ${name} found`).to.be.true;
                const notRenameableLabel = node.getText() + "-" + node.getKindName();
                expect(TypeGuards.isRenameableNode(node) || notRenameableLabel, "has a name but is not renameable").to.be.true;
            });
        });

        it("should not be renameable if there are no identifiers", () => {
            const { sourceFile } = getInfoFromText("while(true){break}; export default [()=>[{}['key'] && [2*2][0],'a']");
            sourceFile.forEachDescendant(d => expect(TypeGuards.isRenameableNode(d) && { text: d.getText(), kind: d.getKindName() }).to.be.false);
        });
    });
});
