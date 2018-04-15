import Project, { Diagnostic, SourceFile, ScriptTarget } from "ts-simple-ast";
import { MarkDownFile, CodeBlock } from "./markdown";

const errorCodes = {
    CannotRedeclareVariable: 2451,
    CannotFindModule: 2307,
    DuplicateIdentifier: 2300,
    AwaitOnlyAllowedInAsyncFunc: 1308,
    NoMultipleExportAssignments: 2309,
    ImportDeclarationConflictsWithLocalDeclaration: 2440,
    ExportAssignmentCannotBeUsedTargetingESModules: 1203
};
const errorCodesToIgnore = [errorCodes.CannotRedeclareVariable, errorCodes.CannotFindModule, errorCodes.DuplicateIdentifier,
    errorCodes.AwaitOnlyAllowedInAsyncFunc, errorCodes.NoMultipleExportAssignments, errorCodes.ImportDeclarationConflictsWithLocalDeclaration,
    errorCodes.ExportAssignmentCannotBeUsedTargetingESModules];
const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    addFilesFromTsConfig: false
});
const docsDir = project.addExistingDirectory("./docs");
const fileSystem = project.getFileSystem();
const templatesDir = docsDir.addExistingDirectory("_script-templates");
project.addExistingSourceFiles("./docs/_script-templates/**/*.ts");
const mainTemplate = templatesDir.getSourceFileOrThrow("main.ts");
const tempSourceFile = docsDir.createSourceFile("tempFile.ts");
addAnyInitializers(mainTemplate);

const markDownFiles = fileSystem.glob(["./docs/**/*.md", "./README.md"]).map(filePath => new MarkDownFile(filePath, fileSystem.readFileSync(filePath)));

console.log("Checking documentation for compile errors...");
const errors: { diagnostic: Diagnostic, codeBlock: CodeBlock; }[] = [];

// collect diagnostics
for (const markDownFile of markDownFiles) {
    const codeBlocks = markDownFile.getCodeBlocks();

    for (const codeBlock of codeBlocks) {
        if (codeBlock.inline || codeBlock.codeType !== "ts" && codeBlock.codeType !== "typescript")
            continue;

        tempSourceFile.removeText();
        tempSourceFile.insertText(0, "let any = undefined as any;\n" + mainTemplate.getText() + getInitializedSetupText(codeBlock.getSetupText()) + codeBlock.text);
        const ignoredErrorCodes = codeBlock.getIgnoredErrorCodes();
        const codeBlockDiagnostics = tempSourceFile.getDiagnostics()
            .filter(d => [...errorCodesToIgnore, ...ignoredErrorCodes].indexOf(d.getCode()) === -1);
        errors.push(...codeBlockDiagnostics.map(diagnostic => ({ diagnostic, codeBlock })));
    }
}

// output results
if (errors.length > 0) {
    for (const error of errors) {
        const messageText = error.diagnostic.getMessageText();
        console.error(`[${error.codeBlock.markdownFile.getFilePath()}:${error.codeBlock.getLineNumber()}]: ` +
            (typeof messageText === "string" ? messageText : messageText.getMessageText()) + ` (${error.diagnostic.getCode()})`);
    }

    process.exit(1);
}

function getInitializedSetupText(text: string) {
    if (text.length === 0)
        return "";

    const setupTextFile = docsDir.createSourceFile("tempSetupTextFile.ts");
    setupTextFile.insertText(0, text);
    addAnyInitializers(setupTextFile);
    text = setupTextFile.getFullText();
    setupTextFile.delete();
    return text;
}

function addAnyInitializers(file: SourceFile) {
    // prevents errors about using an unassigned variable
    for (const dec of file.getVariableDeclarations()) {
        if (dec.getInitializer() == null)
            dec.setInitializer("any");
    }
}
