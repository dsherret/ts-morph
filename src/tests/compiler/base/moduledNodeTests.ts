import { expect } from "chai";
import { SourceFile, NamespaceDeclaration, ModuledNode, QuoteKind, ImportDeclaration, ExportDeclaration } from "../../../compiler";
import { ImportDeclarationStructure, ExportDeclarationStructure, ModuledNodeStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ModuledNode), () => {
    describe(nameof<ModuledNode>(n => n.insertImportDeclarations), () => {
        function doTest(startCode: string, index: number, structures: ImportDeclarationStructure[], expectedCode: string, useSingleQuotes = false) {
            const { sourceFile, project } = getInfoFromText(startCode);
            if (useSingleQuotes)
                project.manipulationSettings.set({ quoteKind: QuoteKind.Single });
            const result = sourceFile.insertImportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of imports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { defaultImport: "identifier", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namespaceImport: "name", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namedImports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedImports: ["name"], moduleSpecifier: "./test" },
                { namespaceImport: "name", moduleSpecifier: "./test" }
            ], [
                `import "./test";`,
                `import identifier from "./test";`,
                `import identifier, * as name from "./test";`,
                `import identifier, { name1, name, name as alias } from "./test";`,
                `import { name } from "./test";`,
                `import * as name from "./test";`
            ].join("\n") + "\n");
        });

        it("should throw when specifying a namespace import and named imports", () => {
            const { sourceFile } = getInfoFromText("");

            expect(() => {
                sourceFile.insertImportDeclarations(0, [{ namespaceImport: "name", namedImports: ["name"], moduleSpecifier: "file" }]);
            }).to.throw();
        });

        it("should insert an import if the file was read with a utf-8 bom", () => {
            doTest("\uFEFF", 0, [{ moduleSpecifier: "./test" }], `import "./test";\n`);
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

        function doNamespaceTest(startCode: string, index: number, structures: ImportDeclarationStructure[], expectedCode: string) {
            const { sourceFile, project } = getInfoFromText(startCode);
            const result = sourceFile.getNamespaces()[0].insertImportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert into namespace", () => {
            doNamespaceTest(`declare module N {\n}`, 0, [{ moduleSpecifier: "./test" }], `declare module N {\n    import "./test";\n}`);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertImportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: ImportDeclarationStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertImportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, { moduleSpecifier: "./file2" }, `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addImportDeclaration), () => {
        function doTest(startCode: string, structure: ImportDeclarationStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclaration(structure);
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

    describe(nameof<ModuledNode>(n => n.addImportDeclarations), () => {
        function doTest(startCode: string, structures: ImportDeclarationStructure[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclarations(structures);
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

    describe(nameof<ModuledNode>(n => n.getImportDeclarations), () => {
        it("should get in a source file", () => {
            const { sourceFile } = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportDeclarations().length).to.equal(2);
            expect(sourceFile.getImportDeclarations()[0]).to.be.instanceOf(ImportDeclaration);
        });

        it("should get in a namespace", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("declare namespace N { import myImport from 'test'; }");
            expect(firstChild.getImportDeclarations().length).to.equal(1);
            expect(firstChild.getImportDeclarations()[0]).to.be.instanceOf(ImportDeclaration);
        });
    });

    describe(nameof<ModuledNode>(n => n.getImportDeclaration), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const result = sourceFile.getImportDeclaration(conditionOrModuleSpecifier);
            if (expected == null)
                expect(result).to.be.undefined;
            else
                expect(result!.getText()).to.equal(expected);
        }

        it("should get the import declaration", () => {
            doTest("import myImport from 'test'; import {next} from './test';", i => i.getDefaultImport() != null, "import myImport from 'test';");
        });

        it("should get the import declaration when providing module specifier text", () => {
            doTest("import myImport from 'test'; import {next} from './test';", "./test", "import {next} from './test';");
        });

        it("should return undefined when not exists", () => {
            doTest("import myImport from 'test';", "asdfasdf", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.getImportDeclarationOrThrow), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expected == null)
                expect(() => sourceFile.getImportDeclarationOrThrow(conditionOrModuleSpecifier)).to.throw();
            else
                expect(sourceFile.getImportDeclarationOrThrow(conditionOrModuleSpecifier).getText()).to.equal(expected);
        }

        it("should get the import declaration", () => {
            doTest("import myImport from 'test'; import {next} from './test';", i => i.getDefaultImport() != null, "import myImport from 'test';");
        });

        it("should get the import declaration when providing module specifier text", () => {
            doTest("import myImport from 'test'; import {next} from './test';", "./test", "import {next} from './test';");
        });

        it("should throw when not exists", () => {
            doTest("import myImport from 'test';", "asdfasdf", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportDeclarations), () => {
        function doTest(startCode: string, index: number, structures: ExportDeclarationStructure[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { namedExports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedExports: ["name"] },
                {}
            ], [
                `export * from "./test";`,
                `export { name1, name, name as alias } from "./test";`,
                `export { name };`,
                `export { };`
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

        function doNamespaceTest(startCode: string, index: number, structures: ExportDeclarationStructure[], expectedCode: string) {
            const { sourceFile, project } = getInfoFromText(startCode);
            const result = sourceFile.getNamespaces()[0].insertExportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert into namespace", () => {
            doNamespaceTest(`declare module N {\n}`, 0, [{ moduleSpecifier: "./test" }], `declare module N {\n    export * from "./test";\n}`);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: ExportDeclarationStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, { moduleSpecifier: "./file2" },
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportDeclaration), () => {
        function doTest(startCode: string, structure: ExportDeclarationStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclaration(structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" },
                `export class MyClass {}\n\nexport * from "./file";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportDeclarations), () => {
        function doTest(startCode: string, structures: ExportDeclarationStructure[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `export class MyClass {}\n\nexport * from "./file1";\nexport * from "./file2";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclarations), () => {
        it("should get in a source file", () => {
            const { sourceFile } = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportDeclarations().length).to.equal(2);
            expect(sourceFile.getExportDeclarations()[0]).to.be.instanceOf(ExportDeclaration);
        });

        it("should get in a namespace", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("declare namespace N { export * from 'test'; }");
            expect(firstChild.getExportDeclarations().length).to.equal(1);
            expect(firstChild.getExportDeclarations()[0]).to.be.instanceOf(ExportDeclaration);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclaration), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ExportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const result = sourceFile.getExportDeclaration(conditionOrModuleSpecifier);
            if (expected == null)
                expect(result).to.be.undefined;
            else
                expect(result!.getText()).to.equal(expected);
        }

        it("should get when exists", () => {
            doTest("export * from 'test'; export {next} from './test';", e => e.isNamespaceExport(), "export * from 'test';");
        });

        it("should get when exists by module specifier", () => {
            doTest("export * from 'test'; export {next} from './test';", "./test", "export {next} from './test';");
        });

        it("should return undefined when not exists", () => {
            doTest("export * from 'test'; export {next} from './test';", "not-exists", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclarationOrThrow), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ExportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expected == null)
                expect(() => sourceFile.getExportDeclarationOrThrow(conditionOrModuleSpecifier)).to.throw();
            else
                expect(sourceFile.getExportDeclarationOrThrow(conditionOrModuleSpecifier).getText()).to.equal(expected);
        }

        it("should get when exists", () => {
            doTest("export * from 'test'; export {next} from './test';", e => e.isNamespaceExport(), "export * from 'test';");
        });

        it("should get when exists by module specifier", () => {
            doTest("export * from 'test'; export {next} from './test';", "./test", "export {next} from './test';");
        });

        it("should throw when not exists", () => {
            doTest("export * from 'test'; export {next} from './test';", "not-exists", undefined);
        });
    });

    describe(nameof<SourceFile>(n => n.set), () => {
        function doTest(startingCode: string, structure: ModuledNodeStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startingCode);
            sourceFile.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = "import t from 'test'; export * from 'test';";
            doTest(code, {}, code);
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<ModuledNodeStructure> = {
                imports: [{ moduleSpecifier: "module" }],
                exports: [{ moduleSpecifier: "export-module" }]
            };
            doTest("import t from 'test'; export { test };", structure, `import "module";\n\nexport * from "export-module";\n`);
        });

        it("should remove when specifying empty arrays", () => {
            const structure: MakeRequired<ModuledNodeStructure> = {
                imports: [],
                exports: []
            };
            doTest("import t from 'test'; export { test };", structure, "");
        });
    });
});
