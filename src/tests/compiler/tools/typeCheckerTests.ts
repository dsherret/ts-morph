import { expect } from "chai";
import { CallExpression, TypeChecker, NamedNode } from "../../../compiler";
import { InvalidOperationError } from "../../../errors";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(TypeChecker), () => {
    describe(nameof<TypeChecker>(p => p.getAmbientModules), () => {
        it("should get the ambient modules when they exist", () => {
            const { project } = getInfoFromText("");
            const fileSystem = project.getFileSystem();

            fileSystem.writeFileSync("/node_modules/@types/jquery/index.d.ts", `
    declare module 'jquery' {
        export = jQuery;
    }
    declare const jQuery: JQueryStatic;
    interface JQueryStatic {
        test: string;
    }`);
            fileSystem.writeFileSync("/node_modules/@types/jquery/package.json",
                `{ "name": "@types/jquery", "version": "1.0.0", "typeScriptVersion": "2.3" }`);

            const ambientModules = project.getTypeChecker().getAmbientModules();
            expect(ambientModules.length).to.equal(1);
            expect(ambientModules[0].getName()).to.equal(`"jquery"`);
        });

        it("should not have any when they don't exist", () => {
            const { project } = getInfoFromText("");
            expect(project.getTypeChecker().getAmbientModules().length).to.equal(0);
        });
    });

    describe(nameof<TypeChecker>(p => p.getResolvedSignature), () => {
        function doTest(text: string, declarationName: string | undefined) {
            const { descendant, project } = getInfoFromTextWithDescendant<CallExpression>(text, SyntaxKind.CallExpression);
            const result = project.getTypeChecker().getResolvedSignature(descendant);
            if (declarationName == null)
                expect(result).to.be.undefined;
            else
                expect((result!.getDeclaration() as NamedNode).getName()).to.equal(declarationName);
        }

        it("should not resolve unknown signature", () => {
            doTest("foo();", undefined);
        });

        it("should resolve signature in same file", () => {
            doTest("function foo(){}; foo();", "foo");
        });
    });

    describe(nameof<TypeChecker>(p => p.getResolvedSignatureOrThrow), () => {
        function doTest(text: string, declarationName: string | undefined) {
            const { descendant, project } = getInfoFromTextWithDescendant<CallExpression>(text, SyntaxKind.CallExpression);
            if (declarationName == null)
                expect(() => project.getTypeChecker().getResolvedSignatureOrThrow(descendant)).to.throw();
            else {
                const result = project.getTypeChecker().getResolvedSignatureOrThrow(descendant);
                expect((result.getDeclaration() as NamedNode).getName()).to.equal(declarationName);
            }
        }

        it("should not resolve unknown signature", () => {
            doTest("foo();", undefined);
        });

        it("should resolve signature in same file", () => {
            doTest("function foo(){}; foo();", "foo");
        });
    });
});
