import { ArrayUtils, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ExportDeclaration, ExportSpecifier } from "../../../../compiler";
import { Project } from "../../../../Project";
import { ExportSpecifierStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, OptionalTrivia } from "../../testHelpers";

describe(nameof(ExportSpecifier), () => {
    function getProject() {
        return new Project({ useInMemoryFileSystem: true });
    }

    describe(nameof<ExportSpecifier>(n => n.getNameNode), () => {
        function doTest(text: string, name: string) {
            const { firstChild } = getInfoFromText<ExportDeclaration>(text);
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

    describe(nameof<ExportSpecifier>(n => n.getName), () => {
        function doTest(text: string, name: string) {
            const { firstChild } = getInfoFromText<ExportDeclaration>(text);
            const namedImport = firstChild.getNamedExports()[0];
            expect(namedImport.getName()).to.equal(name);
        }

        it("should get the name", () => {
            doTest(`export {name} from "./test";`, "name");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.setName), () => {
        it("should change what's imported, but not change anything in the other files", () => {
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                statements: [{ kind: StructureKind.Class, name: "MyClass", isExported: true }]
            });
            const exportsFile = project.createSourceFile("Exports.ts", {
                statements: [{ kind: StructureKind.ExportDeclaration, namedExports: ["MyClass"], moduleSpecifier: "./MyClass" }]
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
                statements: [{ kind: StructureKind.ExportDeclaration, namedExports: [{ name: "MyClass", alias: "MyAlias" }], moduleSpecifier: "./MyClass" }]
            });
            exportsFile.getExportDeclarations()[0].getNamedExports()[0].setName("MyNewName");
            expect(exportsFile.getFullText()).to.equal(`export { MyNewName as MyAlias } from "./MyClass";\n`);
        });

        it("should rename in current file if exporting from current file", () => {
            const project = getProject();
            const myClassFile = project.createSourceFile("MyClass.ts", {
                statements: [{ kind: StructureKind.Class, name: "MyClass" }, { kind: StructureKind.ExportDeclaration, namedExports: ["MyClass"] }]
            });
            myClassFile.getExportDeclarations()[0].getNamedExports()[0].setName("Identifier");
            expect(myClassFile.getFullText()).to.equal(`class MyClass {\n}\n\nexport { Identifier };\n`);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getAliasNode), () => {
        function doTest(text: string, alias: string | undefined) {
            const { firstChild } = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports()[0];
            expect(namedExport.getAliasNode()?.getText()).to.equal(alias);
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

    describe(nameof<ExportSpecifier>(n => n.renameAlias), () => {
        function doTest(text: string, newAlias: string, expected: string, expectedImportName: string) {
            const { sourceFile, project } = getInfoFromText<ExportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const importingFile = project.createSourceFile("importingFile.ts", `import { name } from './testFile';`);
            const namedImport = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            namedImport.renameAlias(newAlias);
            expect(sourceFile.getText()).to.equal(expected);
            expect(importingFile.getImportDeclarations()[0].getNamedImports()[0].getName()).to.equal(expectedImportName);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
        }

        it("should rename existing alias", () => {
            doTest("import {name as alias} from './file'; export { alias as name };", "newAlias",
                "import {name as alias} from './file'; export { alias as newAlias };", "newAlias");
        });

        it("should add new alias and update all usages to the new alias", () => {
            doTest("import {name} from './file'; export { name };", "newAlias", "import {name} from './file'; export { name as newAlias };", "newAlias");
        });

        it("should remove and rename existing alias when specifying an empty string", () => {
            doTest("import {name as alias} from './file'; export { alias as name };", "", "import {name as alias} from './file'; export { alias };", "alias");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.setAlias), () => {
        function doTest(text: string, newAlias: string, expected: string, expectedImportName: string) {
            const { sourceFile, project } = getInfoFromText<ExportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const importingFile = project.createSourceFile("importingFile.ts", `import { name } from './testFile';`);
            const namedImport = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            namedImport.setAlias(newAlias);
            expect(sourceFile.getText()).to.equal(expected);
            expect(importingFile.getImportDeclarations()[0].getNamedImports()[0].getName()).to.equal(expectedImportName);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
        }

        it("should update existing alias and not update the usages", () => {
            doTest("import {name as alias} from './file'; export { alias as name };", "newAlias",
                "import {name as alias} from './file'; export { alias as newAlias };", "name");
        });

        it("should add new alias and not update the usages", () => {
            doTest("import {name} from './file'; export { name };", "newAlias", "import {name} from './file'; export { name as newAlias };", "name");
        });

        it("should remove existing alias when specifying an empty string and not update the usages", () => {
            doTest("import {name as alias} from './file'; export { alias as name };", "", "import {name as alias} from './file'; export { alias };", "name");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.removeAlias), () => {
        function doTest(text: string, expected: string, expectedImportName: string) {
            const { sourceFile, project } = getInfoFromText<ExportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const importingFile = project.createSourceFile("importingFile.ts", `import { name } from './testFile';`);
            const namedImport = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            namedImport.removeAlias();
            expect(sourceFile.getText()).to.equal(expected);
            expect(importingFile.getImportDeclarations()[0].getNamedImports()[0].getName()).to.equal(expectedImportName);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
        }

        it("should do nothing when there is no alias", () => {
            doTest("export {name} from './file';", "export {name} from './file';", "name");
        });

        it("should be remove and not rename when there is an alias", () => {
            doTest("import {name as alias } from './file'; export { alias as name };", "import {name as alias } from './file'; export { alias };", "name");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.removeAliasWithRename), () => {
        function doTest(text: string, expected: string, expectedImportName: string) {
            const { sourceFile, project } = getInfoFromText<ExportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const importingFile = project.createSourceFile("importingFile.ts", `import { name } from './testFile';`);
            const namedImport = sourceFile.getExportDeclarations()[0].getNamedExports()[0];
            namedImport.removeAliasWithRename();
            expect(sourceFile.getText()).to.equal(expected);
            expect(importingFile.getImportDeclarations()[0].getNamedImports()[0].getName()).to.equal(expectedImportName);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
        }

        it("should do nothing when there is no alias", () => {
            doTest("export {name} from './file';", "export {name} from './file';", "name");
        });

        it("should be remove and update the current file when there is an alias", () => {
            doTest("import {name as alias} from './file'; export { alias as name};", "import {name as alias} from './file'; export { alias};", "alias");
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

        it("should get when it's a variable declaration", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `export { myVar } from "./myVar";`);
            project.createSourceFile("myVar.ts", `export var myVar = 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.VariableDeclaration]);
        });

        it("should get the original declaration when it's re-exported from another file", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `export { myVar } from "./other";`);
            project.createSourceFile("other.ts", `export * from "./myVar";`);
            project.createSourceFile("myVar.ts", `export var myVar = 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.VariableDeclaration]);
        });

        it("should get the original declaration when it's exported from another file as an alias", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `export { myNewVar } from "./other";`);
            project.createSourceFile("other.ts", `export { myVar as myNewVar } from "./myVar";`);
            project.createSourceFile("myVar.ts", `export var myVar = 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.VariableDeclaration]);
        });

        it("should get the source file when it's exported", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `export { vars } from "./other";`);
            project.createSourceFile("other.ts", `import * as vars from "./myVar"; export { vars };`);
            project.createSourceFile("myVar.ts", `export var myVar = 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.SourceFile]);
        });

        it("should get the import specifier that's exported", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `import * as vars from "./myVar"; export { vars };`);
            project.createSourceFile("myVar.ts", `export var myVar = 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.NamespaceImport]);
        });

        it("should get an export assignment", () => {
            const project = getProject();
            const mainFile = project.createSourceFile("main.ts", `export { default } from "./other";`);
            project.createSourceFile("other.ts", `export default 5;`);

            const namedExport = mainFile.getExportDeclarations()[0].getNamedExports()[0];
            expect(namedExport.getLocalTargetDeclarations().map(d => d.getKind())).to.deep.equal([SyntaxKind.ExportAssignment]);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getExportDeclaration), () => {
        it("should get the parent export declaration", () => {
            const { firstChild } = getInfoFromText<ExportDeclaration>(`export {name} from "./test";`);
            const namedExport = firstChild.getNamedExports()[0];
            expect(namedExport.getExportDeclaration()).to.equal(firstChild);
        });
    });

    describe(nameof<ExportSpecifier>(n => n.remove), () => {
        function doTest(text: string, nameToRemove: string, expectedText: string) {
            const { sourceFile, firstChild } = getInfoFromText<ExportDeclaration>(text);
            const namedExport = firstChild.getNamedExports().find(e => e.getNameNode().getText() === nameToRemove);
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

    describe(nameof<ExportSpecifier>(n => n.set), () => {
        function doTest(text: string, structure: Partial<ExportSpecifierStructure>, expectedText: string, expectedImportName: string) {
            const { sourceFile, project } = getInfoFromText<ExportDeclaration>(text);
            const otherSourceFile = project.createSourceFile("file.ts", "export class name {}");
            const importingFile = project.createSourceFile("importingFile.ts", `import { name } from './testFile';`);
            sourceFile.getExportDeclarations()[0].getNamedExports()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(otherSourceFile.getText()).to.equal("export class name {}");
            expect(importingFile.getImportDeclarations()[0].getNamedImports()[0].getName()).to.equal(expectedImportName);
        }

        it("should not change anything when nothing is specified", () => {
            const code = `import {name as alias} from './file'; export { alias as name};`;
            doTest(code, {}, code, "name");
        });

        it("should not rename when adding an alias and changing the name", () => {
            doTest(`import { name as alias } from './file'; export { alias as name};`, { name: "a", alias: "alias" },
                `import { name as alias } from './file'; export { a as alias};`, "name");
        });

        it("should not rename when adding an alias", () => {
            doTest(`import { name } from './file'; export { name };`, { alias: "alias" }, `import { name } from './file'; export { name as alias };`, "name");
        });

        it("should not rename when removing an alias", () => {
            doTest(`import { name as alias } from './file'; export { alias as name };`, { alias: undefined },
                `import { name as alias } from './file'; export { alias };`, "name");
        });

        it("should not rename when changing the alias and name", () => {
            doTest(`import { name as alias } from './file'; export { alias as name };`, { name: "name2", alias: "alias2" },
                `import { name as alias } from './file'; export { name2 as alias2 };`, "name");
        });

        it("should not rename when removing the alias and changing the name", () => {
            doTest(`import { name as alias } from './file'; export { alias as name };`, { name: "name2", alias: undefined },
                `import { name as alias } from './file'; export { name2 };`, "name");
        });
    });

    describe(nameof<ExportSpecifier>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<ExportSpecifierStructure>>) {
            const { firstChild } = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.getNamedExports()[0].getStructure()).to.deep.equal(expectedStructure);
        }

        it("should get structure when no alias", () => {
            doTest(`export { name } from "./test";`, {
                kind: StructureKind.ExportSpecifier,
                alias: undefined,
                name: "name"
            });
        });

        it("should get structure when has alias", () => {
            doTest(`export { name as alias } from "./test";`, {
                kind: StructureKind.ExportSpecifier,
                alias: "alias",
                name: "name"
            });
        });
    });
});
