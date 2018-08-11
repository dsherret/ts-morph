import { expect } from "chai";
import { ImportDeclaration, ImportSpecifier } from "../../../compiler";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ImportSpecifier), () => {
    describe(nameof<ImportSpecifier>(n => n.setName), () => {
        it("should only change what's imported", () => {
            const {firstChild, sourceFile, project} = getInfoFromText<ImportDeclaration>("import {name} from './file'; const t = name;");
            const namedImport = firstChild.getNamedImports()[0];
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
            namedImport.setName("newName");
            expect(sourceFile.getText()).to.equal("import {newName} from './file'; const t = name;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });

        it("should set only the identifier when an alias already exists", () => {
            const {firstChild, sourceFile, project} = getInfoFromText<ImportDeclaration>("import {name as alias} from './file'; const t = alias;");
            const namedImport = firstChild.getNamedImports()[0];
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
            namedImport.setName("newName");
            expect(sourceFile.getText()).to.equal("import {newName as alias} from './file'; const t = alias;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.getNameNode), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            expect(namedImport.getNameNode().getText()).to.equal(name);
        }

        it("should get the name when there is no alias", () => {
            doTest(`import {name} from "./test";`, "name");
        });

        it("should get the name when there is an alias", () => {
            doTest(`import {name as alias} from "./test";`, "name");
        });

        it("should get the identifier when it's a default keyword", () => {
            doTest(`import {default as alias} from "./test";`, "default");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.getNameNode), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            expect(namedImport.getName()).to.equal(name);
        }

        it("should get the name", () => {
            doTest(`import {name} from "./test";`, "name");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.setAlias), () => {
        function doTest(text: string, alias: string, expected: string) {
            const {firstChild, sourceFile, project} = getInfoFromText<ImportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const namedImport = firstChild.getNamedImports()[0];
            namedImport.setAlias(alias);
            expect(sourceFile.getText()).to.equal(expected);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
        }

        it("should be set when there is no alias", () => {
            doTest("import {name} from './file';", "alias", "import {name as alias} from './file';");
        });

        it("should be set and rename anything in the current file to the alias", () => {
            doTest("import {name} from './file'; const t = name;", "alias", "import {name as alias} from './file'; const t = alias;");
        });

        it("should rename when there is an alias", () => {
            doTest("import {name as alias} from './file'; const t = alias;", "newAlias", "import {name as newAlias} from './file'; const t = newAlias;");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.getAliasNode), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            if (alias == null)
                expect(namedImport.getAliasNode()).to.equal(undefined);
            else
                expect(namedImport.getAliasNode()!.getText()).to.equal(alias);
        }

        it("should be undefined there is no alias", () => {
            doTest(`import {name} from "./test";`, undefined);
        });

        it("should get the alias when there is an alias", () => {
            doTest(`import {name as alias} from "./test";`, "alias");
        });

        it("should get the alias when there is a default keyword", () => {
            doTest(`import {default as alias} from "./test";`, "alias");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.getImportDeclaration), () => {
        it("should get the parent import declaration", () => {
            const {firstChild} = getInfoFromText<ImportDeclaration>(`import {name} from "./test";`);
            const namedImport = firstChild.getNamedImports()[0];
            expect(namedImport.getImportDeclaration()).to.equal(firstChild);
        });
    });

    describe(nameof<ImportSpecifier>(n => n.remove), () => {
        function doTest(text: string, nameToRemove: string, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            const importSpecifier = ArrayUtils.find(sourceFile.getImportDeclarations()[0].getNamedImports(), i => i.getNameNode().getText() === nameToRemove)!;
            importSpecifier.remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the named import when it's the first one", () => {
            doTest(`import {Name1, Name2} from "module-name";`, "Name1", `import {Name2} from "module-name";`);
        });

        it("should remove the named import when it's in the middle", () => {
            doTest(`import {Name1, Name2, Name3} from "module-name";`, "Name2", `import {Name1, Name3} from "module-name";`);
        });

        it("should remove the named import when it's the last one", () => {
            doTest(`import {Name1, Name2} from "module-name";`, "Name2", `import {Name1} from "module-name";`);
        });

        it("should remove the named imports when only one exist", () => {
            doTest(`import {Name1} from "module-name";`, "Name1", `import "module-name";`);
        });

        it("should remove the named imports when only one exists and a default import exist", () => {
            doTest(`import defaultExport, {Name1} from "module-name";`, "Name1", `import defaultExport from "module-name";`);
        });
    });
});
