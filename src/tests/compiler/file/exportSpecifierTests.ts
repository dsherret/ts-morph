import {expect} from "chai";
import TsSimpleAst from "./../../../main";
import {ExportDeclaration, ExportSpecifier} from "./../../../compiler";
import {ArrayUtils} from "./../../../utils";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportSpecifier), () => {
    function getAst() {
        return new TsSimpleAst({ useVirtualFileSystem: true });
    }

    describe(nameof<ExportSpecifier>(n => n.getNameNode), () => {
        function doTest(text: string, name: string) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            expect(namedExport.getNameNode().getText()).to.equal(name);
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
            const ast = getAst();
            const myClassFile = ast.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.createSourceFile("Main.ts", `import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setName("MyNewName");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export {MyNewName} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
        });

        it("should change it when there's an alias", () => {
            const ast = getAst();
            const exportsFile = ast.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setName("MyNewName");
            expect(exportsFile.getFullText()).to.equal(`export {MyNewName as MyAlias} from "./MyClass";\n`);
        });

        it("should rename in current file if exporting from current file", () => {
            const ast = getAst();
            const myClassFile = ast.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass" }],
                exports: [{ namedExports: [{ name: "MyClass" }]}]
            });
            myClassFile.getExportDeclarations()[0].getNamedExports()[0].setName("Identifier");
            expect(myClassFile.getFullText()).to.equal(`class MyClass {\n}\n\nexport {Identifier};\n`);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.renameName), () => {
        it("should rename in current file if exporting from current file", () => {
            const ast = getAst();
            const myClassFile = ast.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass" }],
                exports: [{ namedExports: [{ name: "MyClass" }]}]
            });
            myClassFile.getExportDeclarations()[0].getNamedExports()[0].renameName("Identifier");
            expect(myClassFile.getFullText()).to.equal(`class Identifier {\n}\n\nexport {Identifier};\n`);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getAliasIdentifier), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            if (alias == null)
                expect(namedExport.getAliasIdentifier()).to.equal(undefined);
            else
                expect(namedExport.getAliasIdentifier()!.getText()).to.equal(alias);
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
            const ast = getAst();
            const myClassFile = ast.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.createSourceFile("Main.ts", `import {MyAlias} from "./Exports";\n\nconst t = MyAlias;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(exportsFile.getFullText()).to.equal(`export {MyClass as MyNewAlias} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyNewAlias} from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });

        it("should add new alias and update all usages to the new alias", () => {
            const ast = getAst();
            const myClassFile = ast.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = ast.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = ast.createSourceFile("Main.ts", `import {MyClass} from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export {MyClass as MyNewAlias} from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import {MyNewAlias} from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getExportDeclaration), () => {
        it("should get the parent export declaration", () => {
            const {firstChild} = getInfoFromText<ExportDeclaration>(`export {name} from "./test";`);
            const namedExport = firstChild.getNamedExports()[0];
            expect(namedExport.getExportDeclaration()).to.equal(firstChild);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.remove), () => {
        function doTest(text: string, nameToRemove: string, expectedText: string) {
            const {sourceFile, firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = ArrayUtils.find(firstChild.getNamedExports(), e => e.getNameNode().getText() === nameToRemove);
            namedExport!.remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should change to a namespace import when there's only one to remove and a module specifier exists", () => {
            doTest(`export {name} from "./test";`, "name", `export * from "./test";`);
        });

        it("should remove the export declaration when there's only one to remove and no module specifier exists", () => {
            doTest(`export {name};`, "name", ``);
        });

        it("should remove the named import when it's the first", () => {
            doTest(`export {name1, name2} from "./test";`, "name1", `export {name2} from "./test";`);
        });

        it("should remove the named import when it's in the middle", () => {
            doTest(`export {name1, name2, name3} from "./test";`, "name2", `export {name1, name3} from "./test";`);
        });

        it("should remove the named import when it's the last", () => {
            doTest(`export {name1, name2} from "./test";`, "name2", `export {name1} from "./test";`);
        });
    });
});
