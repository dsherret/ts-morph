import {expect} from "chai";
import {ImportDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImportDeclaration), () => {
    describe(nameof<ImportDeclaration>(n => n.setModuleSpecifier), () => {
        function doTest(text: string, newModuleSpecifier: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setModuleSpecifier(newModuleSpecifier);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should set the module specifier when using single quotes", () => {
            doTest(`import test from './test';`, "./new-test", `import test from './new-test';`);
        });

        it("should set the module specifier when using double quotes", () => {
            doTest(`import test from "./test";`, "./new-test", `import test from "./new-test";`);
        });

        it("should set the module specifier when it's empty", () => {
            doTest(`import test from "";`, "./new-test", `import test from "./new-test";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getModuleSpecifier), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            expect(firstChild.getModuleSpecifier()).to.equal(expected);
        }

        it("should get the module specifier when using single quotes", () => {
            doTest("import * as test from './test'", "./test");
        });

        it("should get the module specifier when using double quotes", () => {
            doTest(`import defaultExport, {test} from "./test"`, "./test");
        });

        it("should get the module specifier when importing for side effects", () => {
            doTest(`import "./test"`, "./test");
        });
    });

    describe(nameof<ImportDeclaration>(n => n.setDefaultImport), () => {
        function doTest(text: string, newDefaultImport: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setDefaultImport(newDefaultImport);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should rename when exists", () => {
            doTest(`import identifier from './file'; const t = identifier;`, "newName", `import newName from './file'; const t = newName;`);
        });

        it("should set the default import when importing for side effects", () => {
            doTest(`import './file';`, "identifier", `import identifier from './file';`);
        });

        it("should set the default import when named import exists", () => {
            doTest(`import {named} from './file';`, "identifier", `import identifier, {named} from './file';`);
        });

        it("should set the default import when namespace import exists", () => {
            doTest(`import * as name from './file';`, "identifier", `import identifier, * as name from './file';`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getDefaultImport), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const defaultImport = firstChild.getDefaultImport();
            if (expectedName == null)
                expect(defaultImport).to.be.undefined;
            else
                expect(defaultImport!.getText()).to.equal(expectedName);
        }

        it("should get the default import when it exists", () => {
            doTest(`import defaultImport from "./test";`, "defaultImport");
        });

        it("should get the default import when a named import exists as well", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, "defaultImport");
        });

        it("should get the default import when a namespace import exists as well", () => {
            doTest(`import defaultImport, * as name from "./test";`, "defaultImport");
        });

        it("should not get the default import when a named import exists", () => {
            doTest(`import {name as any} from "./test";`, undefined);
        });

        it("should not get the default import when a namespace import exists", () => {
            doTest(`import * as name from "./test";`, undefined);
        });

        it("should not get the default import when importing for the side effects", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.setNamespaceImport), () => {
        function doTest(text: string, newNamespaceImport: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setNamespaceImport(newNamespaceImport);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should rename when exists", () => {
            doTest(`import * as identifier from './file'; const t = identifier;`, "newName", `import * as newName from './file'; const t = newName;`);
        });

        it("should set the namespace import when importing for side effects", () => {
            doTest(`import './file';`, "identifier", `import * as identifier from './file';`);
        });

        it("should throw an error when a named import exists", () => {
            expect(() => {
                const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(`import {named} from './file';`);
                firstChild.setNamespaceImport("identifier");
            }).to.throw();
        });

        it("should set the namespace import when a default import exists", () => {
            doTest(`import name from './file';`, "identifier", `import name, * as identifier from './file';`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamespaceImport), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const identifier = firstChild.getNamespaceImport();
            if (expectedName == null)
                expect(identifier).to.be.undefined;
            else
                expect(identifier!.getText()).to.equal(expectedName);
        }

        it("should get the namespace import when it exists", () => {
            doTest(`import * as name from "./test";`, "name");
        });

        it("should get the namespace import when a default import exists as well", () => {
            doTest(`import defaultImport, * as name from "./test";`, "name");
        });

        it("should not get the default import when a default and named import exist", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, undefined);
        });

        it("should not get the default import when a named import exists", () => {
            doTest(`import {name as any} from "./test";`, undefined);
        });

        it("should not get the default import when a default import exists", () => {
            doTest(`import defaultImport from "./test";`, undefined);
        });

        it("should not get the default import when importing for the side effects", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamedImports), () => {
        function doTest(text: string, expected: { name: string; alias?: string; }[]) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImports = firstChild.getNamedImports();
            expect(namedImports.length).to.equal(expected.length);
            for (let i = 0; i < namedImports.length; i++) {
                expect(namedImports[i].getName().getText()).to.equal(expected[i].name);
                if (expected[i].alias == null)
                    expect(namedImports[i].getAlias()).to.equal(undefined);
                else
                    expect(namedImports[i].getAlias()!.getText()).to.equal(expected[i].alias);
            }
        }

        it("should get the named imports", () => {
            doTest(`import {name, name2, name3 as name4} from "./test";`, [{ name: "name" }, { name: "name2" }, { name: "name3", alias: "name4" }]);
        });

        it("should get the named import when a default and named import exist", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, [{ name: "name", alias: "any" }]);
        });

        it("should not get anything when only a namespace import exists", () => {
            doTest(`import * as name from "./test";`, []);
        });

        it("should not get anything when a a namespace import and a default import exists", () => {
            doTest(`import defaultImport, * as name from "./test";`, []);
        });

        it("should not get anything when a default import exists", () => {
            doTest(`import defaultImport from "./test";`, []);
        });

        it("should not get anything when importing for the side effects", () => {
            doTest(`import "./test";`, []);
        });
    });
});
