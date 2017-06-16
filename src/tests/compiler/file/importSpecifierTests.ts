import {expect} from "chai";
import {ImportDeclaration, ImportSpecifier} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImportSpecifier), () => {
    describe(nameof<ImportSpecifier>(n => n.getIdentifier), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            expect(namedImport.getIdentifier().getText()).to.equal(name);
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

    describe(nameof<ImportSpecifier>(n => n.getAliasIdentifier), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImport = firstChild.getNamedImports()[0];
            if (alias == null)
                expect(namedImport.getAliasIdentifier()).to.equal(undefined);
            else
                expect(namedImport.getAliasIdentifier()!.getText()).to.equal(alias);
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
