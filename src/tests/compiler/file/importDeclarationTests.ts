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

    describe(nameof<ImportDeclaration>(n => n.getNamespaceImportIdentifier), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const identifier = firstChild.getNamespaceImportIdentifier();
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

        it("should not get the default import when a defualt and named import exist", () => {
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
});
