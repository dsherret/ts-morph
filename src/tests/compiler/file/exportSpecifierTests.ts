import {expect} from "chai";
import {ExportDeclaration, ExportSpecifier} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportSpecifier), () => {
    describe(nameof<ExportSpecifier>(n => n.getName), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            expect(namedExport.getName().getText()).to.equal(name);
        }

        it("should get the name when there is no alias", () => {
            doTest(`export {name} from "./test";`, "name");
        });

        it("should get the name when there is an alias", () => {
            doTest(`export {name as alias} from "./test";`, "name");
        });

        it("should get the identifier when it's a default keyword", () => {
            doTest(`export {default as alias} from "./test";`, "default");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getAlias), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            if (alias == null)
                expect(namedExport.getAlias()).to.equal(undefined);
            else
                expect(namedExport.getAlias()!.getText()).to.equal(alias);
        }

        it("should be undefined there is no alias", () => {
            doTest(`export {name} from "./test";`, undefined);
        });

        it("should get the alias when there is an alias", () => {
            doTest(`export {name as alias} from "./test";`, "alias");
        });

        it("should get the alias when there is a default keyword", () => {
            doTest(`export {default as alias} from "./test";`, "alias");
        });
    });
});
