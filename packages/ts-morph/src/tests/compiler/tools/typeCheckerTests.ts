import { SyntaxKind, SymbolFlags } from "@ts-morph/common";
import { expect } from "chai";
import { CallExpression, TypeChecker, NamedNode, SourceFile, Node } from "../../../compiler";
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
            expect((result?.getDeclaration() as NamedNode)?.getName()).to.equal(declarationName);
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

    describe(nameof<TypeChecker>(p => p.getSymbolsInScope), () => {
        function doTest(text: string, selectNode: (sourceFile: SourceFile) => Node, meaning: SymbolFlags, expectedSymbolNames: string[]) {
            const { sourceFile, project } = getInfoFromText(text);
            const node = selectNode(sourceFile);
            const result = project.getTypeChecker().getSymbolsInScope(node, meaning);
            expect(result.map(s => s.getName()).sort()).to.deep.equal(expectedSymbolNames.sort());
        }

        it("should get all the symbols in the provided scope filtered by meaning", () => {
            doTest(
                "function a() { function b() {} const c = ''; function e() { function f() {} } }",
                sourceFile => sourceFile.getFunctionOrThrow("a").getVariableDeclarationOrThrow("c"),
                SymbolFlags.Function,
                ["a", "b", "e"]
            );
        });
    });
});
