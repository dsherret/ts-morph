import {expect} from "chai";
import TsSimpleAst from "./../../../main";
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

    describe(nameof<ExportSpecifier>(n => n.setName), () => {
        it("should change what's imported, but not change anything in the other files", () => {
            const ast = new TsSimpleAst();
            const myClassFile = ast.addSourceFileFromStructure("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.addSourceFileFromStructure("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.addSourceFileFromText("Main.ts", `import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExports()[0].getNamedExports()[0].setName("MyNewName");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export {MyNewName} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
        });

        it("should change it when there's an alias", () => {
            const ast = new TsSimpleAst();
            const exportsFile = ast.addSourceFileFromStructure("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            exportsFile.getExports()[0].getNamedExports()[0].setName("MyNewName");
            expect(exportsFile.getFullText()).to.equal(`export {MyNewName as MyAlias} from "./MyClass";\n`);
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

    describe(nameof<ExportSpecifier>(n => n.setAlias), () => {
        it("should rename existing alias", () => {
            const ast = new TsSimpleAst();
            const myClassFile = ast.addSourceFileFromStructure("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.addSourceFileFromStructure("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.addSourceFileFromText("Main.ts", `import {MyAlias} from "./Exports";\n\nconst t = MyAlias;\n`);
            exportsFile.getExports()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(exportsFile.getFullText()).to.equal(`export {MyClass as MyNewAlias} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyNewAlias} from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });

        it("should add new alias and update all usages to the new alias", () => {
            const ast = new TsSimpleAst();
            const myClassFile = ast.addSourceFileFromStructure("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.addSourceFileFromStructure("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.addSourceFileFromText("Main.ts", `import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExports()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export {MyClass as MyNewAlias} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyNewAlias} from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });
    });
});
