import {expect} from "chai";
import {ImportDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImportDeclaration), () => {
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
                expect(namedImports[i].getIdentifier().getText()).to.equal(expected[i].name);
                if (expected[i].alias == null)
                    expect(namedImports[i].getAliasIdentifier()).to.equal(undefined);
                else
                    expect(namedImports[i].getAliasIdentifier()!.getText()).to.equal(expected[i].alias);
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
