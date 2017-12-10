import {expect} from "chai";
import * as ts from "typescript";
import {SourceFile, ImportDeclaration, ExportDeclaration, EmitResult, FormatCodeSettings, QuoteType} from "./../../../compiler";
import {IndentationText, ManipulationSettings, NewLineKind} from "./../../../ManipulationSettings";
import {ImportDeclarationStructure, ExportDeclarationStructure, SourceFileSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";
import {getFileSystemHostWithFiles} from "./../../testHelpers";
import {TsSimpleAst} from "./../../../TsSimpleAst";
import {FileUtils} from "./../../../utils";

describe(nameof(SourceFile), () => {
    describe(nameof<SourceFile>(n => n.copy), () => {
        const fileText = "    interface Identifier {}    ";
        const {sourceFile, tsSimpleAst} = getInfoFromText(fileText, { filePath: "Folder/File.ts" });
        const relativeSourceFile = sourceFile.copy("../NewFolder/NewFile.ts");
        const absoluteSourceFile = sourceFile.copy(FileUtils.getStandardizedAbsolutePath("NewFile.ts"));

        describe(nameof(tsSimpleAst), () => {
            it("should include the copied source files", () => {
                expect(tsSimpleAst.getSourceFiles().length).to.equal(3);
            });
        });

        describe("relative source file", () => {
            it("should not be saved", () => {
                expect(relativeSourceFile.isSaved()).to.be.false;
            });

            it("should have have the same text", () => {
                expect(relativeSourceFile.getFullText()).to.equal(fileText);
            });

            it("should have the expected path", () => {
                expect(relativeSourceFile.getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("NewFolder/NewFile.ts"));
            });
        });

        describe("absolute source file", () => {
            it("should not be saved", () => {
                expect(absoluteSourceFile.isSaved()).to.be.false;
            });

            it("should have have the same text", () => {
                expect(absoluteSourceFile.getFullText()).to.equal(fileText);
            });

            it("should have the expected path", () => {
                expect(absoluteSourceFile.getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("NewFile.ts"));
            });
        });
    });

    describe(nameof<SourceFile>(n => n.save), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = FileUtils.getStandardizedAbsolutePath("/Folder/File.ts");
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", async () => {
            expect(sourceFile.isSaved()).to.be.false;

            await sourceFile.save();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
            expect(host.getCreatedDirectories()).to.deep.equal([FileUtils.getDirPath(filePath)]);
        });
    });

    describe(nameof<SourceFile>(n => n.delete), () => {
        const filePath = FileUtils.getStandardizedAbsolutePath("/Folder/File.ts");
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText("", { filePath, host });
        sourceFile.saveSync();

        it("should delete the file", async () => {
            await sourceFile.delete();
            expect(sourceFile.wasForgotten()).to.be.true;
            const deleteLog = host.getDeleteLog();
            const entry = deleteLog[0];
            expect(entry.path).to.equal(filePath);
            expect(deleteLog.length).to.equal(1);
            expect(host.getFiles()).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(n => n.deleteSync), () => {
        const filePath = FileUtils.getStandardizedAbsolutePath("/Folder/File.ts");
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText("", { filePath, host });
        sourceFile.saveSync();

        it("should delete the file", () => {
            sourceFile.deleteSync();
            expect(sourceFile.wasForgotten()).to.be.true;
            const deleteLog = host.getDeleteLog();
            const entry = deleteLog[0];
            expect(entry.path).to.equal(filePath);
            expect(deleteLog.length).to.equal(1);
            expect(host.getFiles()).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(n => n.isSaved), () => {
        const filePath = FileUtils.getStandardizedAbsolutePath("/Folder/File.ts");

        it("should not be saved after doing an action that will replace the tree", () => {
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.addClass({ name: "NewClass" });
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should not be saved after doing an action that changes only the text", () => {
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.getClasses()[0].rename("NewClassName");
            expect(sourceFile.isSaved()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.saveSync), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = FileUtils.getStandardizedAbsolutePath("/Folder/File.ts");
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", () => {
            expect(sourceFile.isSaved()).to.be.false;

            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getSyncWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
            expect(host.getCreatedDirectories()).to.deep.equal([FileUtils.getDirPath(filePath)]);
        });
    });

    describe(nameof<SourceFile>(n => n.isDeclarationFile), () => {
        it("should be a source file when the file name ends with .d.ts", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("MyFile.d.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.true;
        });

        it("should not be a source file when the file name ends with .ts", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("MyFile.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.insertImports), () => {
        function doTest(startCode: string, index: number, structures: ImportDeclarationStructure[], expectedCode: string, useSingleQuotes = false) {
            const {sourceFile, tsSimpleAst} = getInfoFromText(startCode);
            if (useSingleQuotes)
                tsSimpleAst.manipulationSettings.set({ quoteType: QuoteType.Single });
            const result = sourceFile.insertImports(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of imports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { defaultImport: "identifier", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namespaceImport: "name", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namedImports: [{ name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedImports: [{ name: "name" }], moduleSpecifier: "./test" },
                { namespaceImport: "name", moduleSpecifier: "./test" }
            ], [
                `import "./test";`,
                `import identifier from "./test";`,
                `import identifier, * as name from "./test";`,
                `import identifier, {name, name as alias} from "./test";`,
                `import {name} from "./test";`,
                `import * as name from "./test";`
            ].join("\n") + "\n");
        });

        it("should throw when specifying a namespace import and named imports", () => {
            const {sourceFile} = getInfoFromText("");

            expect(() => {
                sourceFile.insertImports(0, [{ namespaceImport: "name", namedImports: [{ name: "name" }], moduleSpecifier: "file" }]);
            }).to.throw();
        });

        it("should insert at the beginning and use single quotes when specified", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `import './test';\n\nexport class Class {}\n`, true);
        });

        it("should insert in the middle", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }], `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nimport "./test";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.insertImport), () => {
        function doTest(startCode: string, index: number, structure: ImportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertImport(index, structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, { moduleSpecifier: "./file2" }, `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addImport), () => {
        function doTest(startCode: string, structure: ImportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addImport(structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`, { moduleSpecifier: "./file3" },
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" },
                `import "./file";\n\nexport class MyClass {}\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addImports), () => {
        function doTest(startCode: string, structures: ImportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addImports(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\n\nexport class MyClass {}\n`, [{ moduleSpecifier: "./file2" }, { moduleSpecifier: "./file3" }],
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getImports), () => {
        it("should get the import declarations", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImports().length).to.equal(2);
            expect(sourceFile.getImports()[0]).to.be.instanceOf(ImportDeclaration);
        });
    });

    describe(nameof<SourceFile>(n => n.getImport), () => {
        it("should get the import declaration", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImport(i => i.getDefaultImport() != null)!.getText()).to.equal("import myImport from 'test';");
        });
    });

    describe(nameof<SourceFile>(n => n.getImportOrThrow), () => {
        it("should get the import declaration", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportOrThrow(i => i.getDefaultImport() != null).getText()).to.equal("import myImport from 'test';");
        });

        it("should throw when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getImportOrThrow(e => false)).to.throw();
        });
    });

    describe(nameof<SourceFile>(n => n.insertExports), () => {
        function doTest(startCode: string, index: number, structures: ExportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExports(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { namedExports: [{ name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedExports: [{ name: "name" }] },
                { }
            ], [
                `export * from "./test";`,
                `export {name, name as alias} from "./test";`,
                `export {name};`,
                `export {};`
            ].join("\n") + "\n");
        });

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `export * from "./test";\n\nexport class Class {}\n`);
        });

        it("should insert in the middle", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }],
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nexport * from "./test";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.insertExport), () => {
        function doTest(startCode: string, index: number, structure: ExportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExport(index, structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, { moduleSpecifier: "./file2" },
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExport), () => {
        function doTest(startCode: string, structure: ExportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExport(structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" },
                `export class MyClass {}\n\nexport * from "./file";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExports), () => {
        function doTest(startCode: string, structures: ExportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExports(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `export class MyClass {}\n\nexport * from "./file1";\nexport * from "./file2";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getExports), () => {
        it("should get the export declarations", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExports().length).to.equal(2);
            expect(sourceFile.getExports()[0]).to.be.instanceOf(ExportDeclaration);
        });
    });

    describe(nameof<SourceFile>(n => n.getExport), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExport(e => e.isNamespaceExport())!.getText()).to.equal("export * from 'test';");
        });
    });

    describe(nameof<SourceFile>(n => n.getExportOrThrow), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportOrThrow(e => e.isNamespaceExport()).getText()).to.equal("export * from 'test';");
        });

        it("should throw when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getExportOrThrow(e => false)).to.throw();
        });
    });

    describe(nameof<SourceFile>(n => n.getDefaultExportSymbol), () => {
        it("should return undefined when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            expect(sourceFile.getDefaultExportSymbol()).to.be.undefined;
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            const defaultExportSymbol = sourceFile.getDefaultExportSymbol()!;
            expect(defaultExportSymbol.getName()).to.equal("default");
        });

        it("should return the default export symbol when default exported on a separate statement", () => {
            const {sourceFile} = getInfoFromText("class Identifier {}\nexport default Identifier;");
            const defaultExportSymbol = sourceFile.getDefaultExportSymbol()!;
            expect(defaultExportSymbol.getName()).to.equal("default");
        });
    });

    describe(nameof<SourceFile>(n => n.getDefaultExportSymbolOrThrow), () => {
        it("should throw when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getDefaultExportSymbolOrThrow()).to.throw();
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            expect(sourceFile.getDefaultExportSymbolOrThrow().getName()).to.equal("default");
        });
    });

    describe(nameof<SourceFile>(n => n.removeDefaultExport), () => {
        it("should do nothing when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("");
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("class Identifier {}");
        });

        it("should return the default export symbol when default exported on a separate statement", () => {
            const {sourceFile} = getInfoFromText("namespace Identifier {}\nclass Identifier {}\nexport default Identifier;\n");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("namespace Identifier {}\nclass Identifier {}\n");
        });
    });

    describe(nameof<SourceFile>(n => n.getLanguageVariant), () => {
        it("should return standard when in a ts file", () => {
            const {sourceFile} = getInfoFromText("");
            expect(sourceFile.getLanguageVariant()).to.equal(ts.LanguageVariant.Standard);
        });

        it("should return jsx when in a tsx file", () => {
            const {sourceFile} = getInfoFromText("", { filePath: "file.tsx" });
            expect(sourceFile.getLanguageVariant()).to.equal(ts.LanguageVariant.JSX);
        });
    });

    describe(nameof<SourceFile>(n => n.emit), () => {
        it("should emit the source file", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst({ compilerOptions: { noLib: true, outDir: "dist" } }, fileSystem);
            const sourceFile = ast.addSourceFileFromText("file1.ts", "const num1 = 1;");
            ast.addSourceFileFromText("file2.ts", "const num2 = 2;");
            const result = sourceFile.emit();

            expect(result).to.be.instanceof(EmitResult);
            const writeLog = fileSystem.getSyncWriteLog();
            expect(writeLog[0].filePath).to.equal("dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        });

        it("should create the directories when emitting", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst({ compilerOptions: { noLib: true, outDir: "dist/subdir" } }, fileSystem);
            const sourceFile = ast.addSourceFileFromText("/test.ts", "const num1 = 1;");
            ast.emit();
            const directories = fileSystem.getCreatedDirectories();
            expect(directories).to.deep.equal(["dist", "dist/subdir"]);
        });
    });

    describe(nameof<SourceFile>(n => n.fill), () => {
        function doTest(startingCode: string, structure: SourceFileSpecificStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("", {}, "");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<SourceFileSpecificStructure> = {
                imports: [{ moduleSpecifier: "module" }],
                exports: [{ moduleSpecifier: "export-module" }]
            };
            doTest("", structure, `import "module";\n\nexport * from "export-module";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.formatText), () => {
        function doTest(startingCode: string, expectedCode: string, manipulationSettings: Partial<ManipulationSettings> = {}, settings: FormatCodeSettings = {}) {
            const {tsSimpleAst, sourceFile} = getInfoFromText(startingCode);
            tsSimpleAst.manipulationSettings.set(manipulationSettings);
            sourceFile.formatText(settings);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should format the text when it contains different spacing", () => {
            doTest("class     MyClass{}", "class MyClass {}\n");
        });

        it("should not add a newline when specifying not to ensure", () => {
            doTest("class MyClass{}", "class MyClass {}", {}, { ensureNewLineAtEndOfFile: false });
        });

        it("should not by default add spaces immediately within named import braces", () => {
            doTest("import {name, name2} from 'test';", "import {name, name2} from 'test';\n");
        });

        it("should format the text with eight spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n        myMethod() {\n        }\n}\n",
                { indentationText: IndentationText.EightSpaces });
        });

        it("should format the text with four spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n    myMethod() {\n    }\n}\n",
                { indentationText: IndentationText.FourSpaces });
        });

        it("should format the text with two spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n        console.log(t);\n    }\n}",
                "class MyClass {\n  myMethod() {\n    console.log(t);\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format the text with tabs", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab });
        });

        it("should format the text to spaces when using tabs", () => {
            doTest("class MyClass {\n\tmyMethod() {\n\t}\n}",
                "class MyClass {\n  myMethod() {\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format the text with slash r slash n newlines", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\r\n\tmyMethod() {\r\n\t}\r\n}\r\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.CarriageReturnLineFeed });
        });

        it("should format the text with slash n newlines", () => {
            doTest("class MyClass {\r\n    myMethod() {\r\n    }\r\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.LineFeed });
        });

        it("should format and not indent within strings", () => {
            doTest("class MyClass {\n    myMethod() {\n        const t = `\nt`;\n    }\n}",
                "class MyClass {\n  myMethod() {\n    const t = `\nt`;\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format and not format within strings", () => {
            doTest("class MyClass {\n    myMethod() {\n        const t = `\n    t`;\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t\tconst t = `\n    t`;\n\t}\n}\n",
                { indentationText: IndentationText.Tab });
        });

        it("should format the text when it contains multiple semi colons", () => {
            doTest("var myTest: string;;;;", "var myTest: string;;;;\n");
        });

        it("should format the text when it contains syntax errors", () => {
            doTest("function myTest(}{{{{}}) {}", "function myTest(}{{{{}}) {}\n");
        });

        it("should format the text in the documentation as described", () => {
            doTest(`var myVariable     :      string |    number;
function myFunction(param    : MyClass){
return "";
}
`, `var myVariable: string | number;
function myFunction(param: MyClass) {
    return "";
}
`);
        });
    });

    describe(nameof<SourceFile>(n => n.indent), () => {
        function doTest(startingCode: string, rangeOrPos: [number, number] | number, times: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.indent(rangeOrPos, times);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when the range is outside the lower bound of the file", () => {
            const {sourceFile} = getInfoFromText(" ");
            expect(() => sourceFile.indent([-1, 0])).to.throw();
        });

        it("should throw when the range is outside the upper bound of the file", () => {
            const {sourceFile} = getInfoFromText(" ");
            expect(() => sourceFile.indent([0, 2])).to.throw();
        });

        it("should throw when the range is flipped", () => {
            const {sourceFile} = getInfoFromText("     ");
            expect(() => sourceFile.indent([2, 1])).to.throw();
        });

        it("should indent the specified pos", () => {
            doTest("//testing\n//testing\n//testing", 11, 1, "//testing\n    //testing\n//testing");
        });

        it("should do nothing when specifying a times of 0", () => {
            doTest("//testing\n//testing\n//testing", 11, 0, "//testing\n//testing\n//testing");
        });

        it("should indent the specified text based on the lines provided", () => {
            const sourceFileLines = ["class MyClass {", "    test;", "}"];
            doTest(sourceFileLines.join("\n"), [sourceFileLines[0].length + 1, sourceFileLines[0].length + 1 + sourceFileLines[1].length], 3,
                `class MyClass {
                test;
}`);
        });

        it("should indent the line when specifying the end of it for the start of the range", () => {
            const sourceFileLines = ["class MyClass {", "    test;", "}"];
            doTest(sourceFileLines.join("\n"), [sourceFileLines[0].length, sourceFileLines[0].length + 1], 1,
                `    class MyClass {
        test;
}`);
        });

        it("should not indent within a multiline string", () => {
            doTest(`"somestring \\\notherstring";`, 17, 1, `"somestring \\\notherstring";`);
        });

        it("should not indent within a template string", () => {
            doTest(`\`testingthiso\ntestingmore$\{here}testing\`;`, 17, 1, `\`testingthiso\ntestingmore$\{here}testing\`;`);
        });

        it("should indent when string starts on line", () => {
            doTest(`"somestring";`, 0, 1, `    "somestring";`);
        });

        it("should indent when only specifying two spaces", () => {
            const {sourceFile} = getInfoFromText("//code");
            sourceFile.global.manipulationSettings.set({ indentationText: IndentationText.TwoSpaces });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("  //code");
        });

        it("should indent when specifying tabs", () => {
            const {sourceFile} = getInfoFromText("//code");
            sourceFile.global.manipulationSettings.set({ indentationText: IndentationText.Tab });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("\t//code");
        });
    });

    describe(nameof<SourceFile>(n => n.unindent), () => {
        // most of the tests are in indent
        function doTest(startingCode: string, rangeOrPos: [number, number] | number, times: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.unindent(rangeOrPos, times);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should do nothing when already unindented to the end of the line", () => {
            doTest("//testing\n//testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when indented", () => {
            doTest("//testing\n    //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when the line doesn't have the unindent number of spaces", () => {
            doTest("//testing\n //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
            doTest("//testing\n  //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
            doTest("//testing\n   //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when using tabs", () => {
            doTest("//testing\n\t\t\t//testing\n//testing", 11, 1, "//testing\n\t\t//testing\n//testing");
        });

        it("should unindent when mixing tabs and spaces", () => {
            doTest("//testing\n\t\t    //testing\n//testing", 11, 3, "//testing\n//testing\n//testing");
        });

        it("should unindent multiple times", () => {
            doTest("//testing\n\t\t\t//testing\n//testing", 11, 2, "//testing\n\t//testing\n//testing");
        });
    });
});
