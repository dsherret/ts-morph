import { expect } from "chai";
import { ExportDeclaration, ExportSpecifier } from "../../../compiler";
import Project from "../../../main";
import { SyntaxKind } from "../../../typescript";
import { ArrayUtils } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ExportSpecifier), () => {
    function getProject() {
        return new Project({ useVirtualFileSystem: true });
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
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = project.createSourceFile("Exports.ts", {
                exports: [{ namedExports: ["MyClass"], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = project.createSourceFile("Main.ts", `import { MyClass } from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setName("MyNewName");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export { MyNewName } from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import { MyClass } from "./Exports";\n\nconst t = MyClass;\n`);
        });

        it("should change it when there's an alias", () => {
            const project = getProject();
            const exportsFile = project.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setName("MyNewName");
            expect(exportsFile.getFullText()).to.equal(`export { MyNewName as MyAlias } from "./MyClass";\n`);
        });

        it("should rename in current file if exporting from current file", () => {
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass" }],
                exports: [{ namedExports: ["MyClass"]}]
            });
            myClassFile.getExportDeclarations()[0].getNamedExports()[0].setName("Identifier");
            expect(myClassFile.getFullText()).to.equal(`class MyClass {\n}\n\nexport { Identifier };\n`);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getAliasNode), () => {
        function doTest(text: string, alias: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            if (alias == null)
                expect(namedExport.getAliasNode()).to.equal(undefined);
            else
                expect(namedExport.getAliasNode()!.getText()).to.equal(alias);
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
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = project.createSourceFile("Exports.ts", {
                exports: [{ namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = project.createSourceFile("Main.ts", `import { MyAlias } from "./Exports";\n\nconst t = MyAlias;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(exportsFile.getFullText()).to.equal(`export { MyClass as MyNewAlias } from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import { MyNewAlias } from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });

        it("should add new alias and update all usages to the new alias", () => {
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                classes: [{ name: "MyClass", isExported: true }]
            });
            const exportsFile = project.createSourceFile("Exports.ts", {
                exports: [{ namedExports: ["MyClass"], moduleSpecifier: "./MyClass" }]
            });
            const mainFile = project.createSourceFile("Main.ts", `import { MyClass } from "./Exports";\n\nconst t = MyClass;\n`);
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setAlias("MyNewAlias");
            expect(myClassFile.getFullText()).to.equal(`export class MyClass {\n}\n`);
            expect(exportsFile.getFullText()).to.equal(`export { MyClass as MyNewAlias } from "./MyClass";\n`);
            expect(mainFile.getFullText()).to.equal(`import { MyNewAlias } from "./Exports";\n\nconst t = MyNewAlias;\n`);
        });
    });

    function setupLocalTargetSymbolTest() {
        const project = getProject();
        const mainFile = project.createSourceFile("main.ts", `export { MyClass, OtherClass } from "./MyClass";`);
        const myClassFile = project.createSourceFile("MyClass.ts", `export class MyClass {}`);
        return mainFile.getExportDeclarations()[0].getNamedExports();
    }

    describe(nameof<ExportSpecifier>(n => n.getLocalTargetSymbol), () => {
        it("should get the local target symbol when it exists", () => {
            const myClassExportSpecifier = setupLocalTargetSymbolTest()[0];
            expect(myClassExportSpecifier.getLocalTargetSymbol()!.getDeclarations()[0].getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should returned undefined when it doesn't exist", () => {
            const otherClassExportSpecifier = setupLocalTargetSymbolTest()[1];
            expect(otherClassExportSpecifier.getLocalTargetSymbol()).to.be.undefined;
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getLocalTargetSymbolOrThrow), () => {
        it("should get the local target symbol when it exists", () => {
            const myClassExportSpecifier = setupLocalTargetSymbolTest()[0];
            expect(myClassExportSpecifier.getLocalTargetSymbolOrThrow().getDeclarations()[0].getKind()).to.equal(SyntaxKind.ClassDeclaration);
        });

        it("should throw when it doesn't exist", () => {
            const otherClassExportSpecifier = setupLocalTargetSymbolTest()[1];
            expect(() => otherClassExportSpecifier.getLocalTargetSymbolOrThrow()).to.throw();
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getLocalTargetDeclarations), () => {
        it("should get the local target declarations when they exist", () => {
            const myClassExportSpecifier = setupLocalTargetSymbolTest()[0];
            expect(myClassExportSpecifier.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.ClassDeclaration]);
        });

        it("should returned an empty array when they don't exist", () => {
            const otherClassExportSpecifier = setupLocalTargetSymbolTest()[1];
            expect(otherClassExportSpecifier.getLocalTargetDeclarations()).to.deep.equal([]);
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
