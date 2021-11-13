import { SyntaxKind, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ExternalModuleReference } from "../../../../compiler";
import { Project } from "../../../../Project";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ExternalModuleReference", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ExternalModuleReference>(text, SyntaxKind.ExternalModuleReference);
    }

    // I'm not sure how to make expression null

    describe(nameof.property<ExternalModuleReference>("getExpression"), () => {
        it("should get the expression", () => {
            const { descendant } = getNode("import test = require('expression');");
            expect(descendant.getExpression()!.getText()).to.equal("'expression'");
        });
    });

    describe(nameof.property<ExternalModuleReference>("getExpressionOrThrow"), () => {
        it("should get the expression", () => {
            const { descendant } = getNode("import test = require('expression');");
            expect(descendant.getExpressionOrThrow().getText()).to.equal("'expression'");
        });
    });

    describe(nameof.property<ExternalModuleReference>("isRelative"), () => {
        function doTest(text: string, expected: boolean) {
            const { descendant } = getNode(text);
            expect(descendant.isRelative()).to.equal(expected);
        }

        it("should be when using ./", () => {
            doTest("import test = require('./test');", true);
        });

        it("should be when using ../", () => {
            doTest("import test = require('../test');", true);
        });

        it("should not be when using /", () => {
            doTest("import test = require('/test');", false);
        });

        it("should not be when not", () => {
            doTest("import test = require('test');", false);
        });

        it("should not be when empty", () => {
            doTest("import test = require();", false);
        });

        it("should not be when a number for some reason", () => {
            doTest("import test = require(5);", false);
        });
    });

    describe(nameof.property<ExternalModuleReference>("getReferencedSourceFile"), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFile()).to.equal(classSourceFile);
        });

        it("should return undefined when the referenced file doesn't exist", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFile()).to.be.undefined;
        });
    });

    describe(nameof.property<ExternalModuleReference>("getReferencedSourceFileOrThrow"), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFileOrThrow())
                .to.equal(classSourceFile);
        });

        it("should throw when the referenced file doesn't exist", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);

            expect(() => mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ExternalModuleReference).getReferencedSourceFileOrThrow()).to.throw();
        });
    });
});
