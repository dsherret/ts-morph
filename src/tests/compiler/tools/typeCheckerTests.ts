import { expect } from "chai";
import { CallExpression, TypeChecker } from "../../../compiler";
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
        function setup(source: string) {
            const { descendant, project, sourceFile } = getInfoFromTextWithDescendant<CallExpression>(source, SyntaxKind.CallExpression);
            const typeChecker = project.getTypeChecker();
            return {descendant, typeChecker, sourceFile};
        }
        it("should not resolve unknown signature", () => {
            const { descendant, typeChecker } = setup("foo();");
            const resolvedSignature = typeChecker.getResolvedSignature(descendant);
            expect(resolvedSignature).to.be.undefined;
            expect(() => typeChecker.getResolvedSignatureOrThrow(descendant)).to.throw(InvalidOperationError);
        });
        it("should resolve signature in same file", () => {
            const { descendant, typeChecker, sourceFile } = setup("function foo(){}; foo();");
            const resolvedSignature = typeChecker.getResolvedSignature(descendant);
            expect(resolvedSignature).not.to.be.undefined;
            expect(() => typeChecker.getResolvedSignatureOrThrow(descendant)).not.to.throw();
            const foo = sourceFile.getFunctionOrThrow("foo");
            expect(resolvedSignature).to.equal(foo.getSignature());
        });
        it("should resolve signature in ambient module", () => {
            const { project } = getInfoFromText("");
            const fileSystem = project.getFileSystem();

            fileSystem.writeFileSync("/node_modules/@types/foo/index.d.ts", `
    declare module 'foo' {
        export function bar(x:number): number;
        export function bar(x:string): string;
    }`);
            const fileName = "./test.ts";
            fileSystem.writeFileSync(fileName, "import {bar} from 'foo'; bar(123);");
            const sourceFile = project.addExistingSourceFile(fileName);
            const callExpression = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
            const typeChecker = project.getTypeChecker();
            const resolvedSignature = typeChecker.getResolvedSignatureOrThrow(callExpression);
            expect(resolvedSignature.getReturnType().isNumber()).to.be.true;
        });
    });
});
