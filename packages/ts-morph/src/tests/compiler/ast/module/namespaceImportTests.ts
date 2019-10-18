import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { NamespaceImport } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(NamespaceImport), () => {
    function getNamespaceImport(text: string) {
        return getInfoFromTextWithDescendant<NamespaceImport>(text, SyntaxKind.NamespaceImport);
    }

    describe(nameof<NamespaceImport>(n => n.setName), () => {
        it("should only change what's imported", () => {
            const { descendant, sourceFile, project } = getNamespaceImport("import * as ts from './file'; const t = ts;");
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
            descendant.setName("tsNew");
            expect(sourceFile.getText()).to.equal("import * as tsNew from './file'; const t = ts;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });
    });

    describe(nameof<NamespaceImport>(n => n.rename), () => {
        it("should rename what's imported", () => {
            const { descendant, sourceFile, project } = getNamespaceImport("import * as ts from './file'; const t = ts;");
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
            descendant.rename("tsNew");
            expect(sourceFile.getText()).to.equal("import * as tsNew from './file'; const t = tsNew;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });
    });

    describe(nameof<NamespaceImport>(n => n.getNameNode), () => {
        function doTest(text: string, name: string) {
            const { descendant } = getNamespaceImport(text);
            expect(descendant.getNameNode().getText()).to.equal(name);
        }

        it("should get the name", () => {
            doTest(`import * as name from "./test";`, "name");
        });
    });

    describe(nameof<NamespaceImport>(n => n.getName), () => {
        function doTest(text: string, name: string) {
            const { descendant } = getNamespaceImport(text);
            expect(descendant.getName()).to.equal(name);
        }

        it("should get the name", () => {
            doTest(`import * as name from "./test";`, "name");
        });
    });
});
