import {expect} from "chai";
import {SourceFile, ImportDeclaration, ExportDeclaration} from "./../../../compiler";
import {ImportDeclarationStructure, ExportDeclarationStructure} from "./../../../structures";
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

        it("should save the file", done => {
            expect(sourceFile.isSaved()).to.be.false;

            sourceFile.save().then(() => {
                expect(sourceFile.isSaved()).to.be.true;
                const args = host.getWrittenFileArguments();
                expect(args[0]).to.equal(filePath);
                expect(args[1]).to.equal(fileText);
                expect(args.length).to.equal(2);
                done();
            });
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
            const args = host.getWrittenFileArguments();
            expect(args[0]).to.equal(filePath);
            expect(args[1]).to.equal(fileText);
            expect(args.length).to.equal(2);
        });
    });

    describe(nameof<SourceFile>(n => n.isSourceFile), () => {
        const {sourceFile, firstChild} = getInfoFromText("enum MyEnum {}");
        it("should return true for the source file", () => {
            expect(sourceFile.isSourceFile()).to.be.true;
        });

        it("should return false for something not a source file", () => {
            expect(firstChild.isSourceFile()).to.be.false;
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
        function doTest(startCode: string, index: number, structures: ImportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
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

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `import "./test";\n\nexport class Class {}\n`);
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
});
