import {expect} from "chai";
import {Project} from "./../../../Project";
import {ts, SyntaxKind} from "./../../../typescript";
import {ExternalModuleReference} from "./../../../compiler";
import * as errors from "./../../../errors";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

describe(nameof(ExternalModuleReference), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ExternalModuleReference>(text, SyntaxKind.ExternalModuleReference);
    }

    // I'm not sure how to make expression null

    describe(nameof<ExternalModuleReference>(n => n.getExpression), () => {
        it("should get the expression", () => {
            const {descendant} = getNode("import test = require('expression');");
            expect(descendant.getExpression()!.getText()).to.equal("'expression'");
        });
    });

    describe(nameof<ExternalModuleReference>(n => n.getExpressionOrThrow), () => {
        it("should get the expression", () => {
            const {descendant} = getNode("import test = require('expression');");
            expect(descendant.getExpressionOrThrow().getText()).to.equal("'expression'");
        });
    });

    describe(nameof<ExternalModuleReference>(n => n.getReferencedSourceFile), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFile()).to.equal(classSourceFile);
        });

        it("should return undefined when the referenced file doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFile()).to.be.undefined;
        });
    });

    describe(nameof<ExternalModuleReference>(n => n.getReferencedSourceFileOrThrow), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFileOrThrow()).to.equal(classSourceFile);
        });

        it("should throw when the referenced file doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);

            expect(() => mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFileOrThrow()).to.throw();
        });
    });
});
