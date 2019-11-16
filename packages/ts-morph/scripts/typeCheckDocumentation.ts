import { tsMorph } from "@ts-morph/scripts";
import { getProject } from "./common";
import { MarkDownFile, CodeBlock } from "./markdown";

const errorCodes = {
    CannotRedeclareVariable: 2451,
    CannotFindModule: 2307,
    DuplicateIdentifier: 2300,
    AwaitOnlyAllowedInAsyncFunc: 1308,
    NoMultipleExportAssignments: 2309,
    ImportDeclarationConflictsWithLocalDeclaration: 2440,
    ExportAssignmentCannotBeUsedTargetingESModules: 1203,
    FileNotUnderRootDir: 6059
};
const errorCodesToIgnore = [errorCodes.CannotRedeclareVariable, errorCodes.CannotFindModule, errorCodes.DuplicateIdentifier,
    errorCodes.AwaitOnlyAllowedInAsyncFunc, errorCodes.NoMultipleExportAssignments, errorCodes.ImportDeclarationConflictsWithLocalDeclaration,
    errorCodes.ExportAssignmentCannotBeUsedTargetingESModules, errorCodes.FileNotUnderRootDir];
const project = getProject();
const docsDir = project.addDirectoryAtPath("../../docs");
const fileSystem = project.getFileSystem();
const templatesDir = docsDir.addDirectoryAtPath("_script-templates");
project.addSourceFilesAtPaths("../../docs/_script-templates/**/*.ts");
const mainTemplate = templatesDir.getSourceFileOrThrow("main.ts");
addAnyInitializers(mainTemplate);

const markDownFiles = fileSystem.glob(["../../docs/**/*.md", "./README.md"]).map(filePath => new MarkDownFile(filePath, fileSystem.readFileSync(filePath)));

console.log("Checking documentation for compile errors...");
const errors: { diagnostic: tsMorph.Diagnostic; codeBlock: CodeBlock; }[] = [];

// much faster to get all the temporary source files first so the type checker doesn't need to be created after each manipulation
const markDownFilesWithCodeBlocks = markDownFiles
    .map((markDownFile, i) => ({
        markDownFile,
        codeBlocksWithSourceFiles: markDownFile.getCodeBlocks()
            .filter(codeBlock => !codeBlock.inline && (codeBlock.codeType === "ts" || codeBlock.codeType === "typescript"))
            .map((codeBlock, j) => ({
                tempSourceFile: templatesDir.createSourceFile(
                    `tempFile${i}_${j}.ts`,
                    "let any = undefined as any;\n" + mainTemplate.getText() + getInitializedSetupText(codeBlock.getSetupText())
                        + getInitializedFileText(codeBlock.text)
                ),
                codeBlock
            }))
    }));

// collect diagnostics
for (const { markDownFile, codeBlocksWithSourceFiles } of markDownFilesWithCodeBlocks) {
    for (const { codeBlock, tempSourceFile } of codeBlocksWithSourceFiles) {
        const ignoredErrorCodes = codeBlock.getIgnoredErrorCodes();
        const codeBlockDiagnostics = tempSourceFile.getPreEmitDiagnostics()
            .filter(d => [...errorCodesToIgnore, ...ignoredErrorCodes].indexOf(d.getCode()) === -1);
        errors.push(...codeBlockDiagnostics.map(diagnostic => ({ diagnostic, codeBlock })));
    }
}

// output results
if (errors.length > 0) {
    for (const error of errors) {
        const messageText = error.diagnostic.getMessageText();
        console.error(`[${error.codeBlock.markdownFile.getFilePath()}:${error.codeBlock.getLineNumber()}]: `
            + (typeof messageText === "string" ? messageText : messageText.getMessageText()) + ` (${error.diagnostic.getCode()})`);
    }

    process.exit(1);
}

function getInitializedSetupText(text: string) {
    return doActionOnText(text, tempFile => {
        addAnyInitializers(tempFile);
    });
}

function addAnyInitializers(file: tsMorph.SourceFile) {
    // prevents errors about using an unassigned variable
    for (const dec of file.getVariableDeclarations()) {
        if (dec.getInitializer() == null)
            dec.setInitializer("any");
    }
}

function getInitializedFileText(text: string) {
    return doActionOnText(text, tempFile => {
        changeModuleSpecifiers(tempFile);
    });
}

function changeModuleSpecifiers(file: tsMorph.SourceFile) {
    for (const importExport of [...file.getImportDeclarations(), ...file.getExportDeclarations()]) {
        if (importExport.getModuleSpecifierValue() === "ts-morph")
            importExport.setModuleSpecifier("../../src/main");
    }
}

function doActionOnText(text: string, doAction: (sourceFile: tsMorph.SourceFile) => void) {
    const tempFile = docsDir.createSourceFile("tempFile.ts");
    tempFile.insertText(0, text);
    doAction(tempFile);
    text = tempFile.getFullText();
    tempFile.delete();
    return text;
}
