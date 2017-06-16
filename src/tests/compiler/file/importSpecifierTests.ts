import {expect} from "chai";
import {ImportDeclaration, ImportSpecifier} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImportSpecifier), () => {
    describe(nameof<ImportSpecifier>(n => n.setName), () => {
        it("should rename only in the current file", () => {
            const {firstChild, sourceFile, tsSimpleAst} = getInfoFromText<ImportDeclaration>("import {name} from './file'; const t = name;");
            const namedImport = firstChild.getNamedImports()[0];
            const otherSourceFile = tsSimpleAst.addSourceFileFromText("file.ts", "export class name {}\nexport class newName {}");
            namedImport.setName("newName");
            expect(sourceFile.getText()).to.equal("import {newName} from './file'; const t = newName;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });

        it("should rename only the identifier when an alias already exists", () => {
            const {firstChild, sourceFile, tsSimpleAst} = getInfoFromText<ImportDeclaration>("import {name as alias} from './file'; const t = alias;");
            const namedImport = firstChild.getNamedImports()[0];
            const otherSourceFile = tsSimpleAst.addSourceFileFromText("file.ts", "export class name {}\nexport class newName {}");
            namedImport.setName("newName");
            expect(sourceFile.getText()).to.equal("import {newName as alias} from './file'; const t = alias;");
            expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
        });
    });

    describe(nameof<ImportSpecifier>(n => n.getName), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            expect(namedImport.getName().getText()).to.equal(name);
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

    describe(nameof<ImportSpecifier>(n => n.setAlias), () => {
        function doTest(text: string, alias: string, expected: string) {
            const {firstChild, sourceFile, tsSimpleAst} = getInfoFromText<ImportDeclaration>(text);
            const otherSourceFile = tsSimpleAst.addSourceFileFromText("file.ts", "export class name {}");
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

    describe(nameof<ImportSpecifier>(n => n.getAlias), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            if (alias == null)
                expect(namedImport.getAlias()).to.equal(undefined);
            else
                expect(namedImport.getAlias()!.getText()).to.equal(alias);
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
});
