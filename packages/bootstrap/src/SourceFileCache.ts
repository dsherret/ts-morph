import { DocumentRegistry, ScriptKind, ts, StringUtils, TsSourceFileContainer, FileUtils, TransactionalFileSystem, CompilerOptionsContainer,
    StandardizedFilePath } from "@ts-morph/common";

export class SourceFileCache implements TsSourceFileContainer {
    private readonly sourceFilesByFilePath = new Map<StandardizedFilePath, ts.SourceFile>();

    readonly documentRegistry: DocumentRegistry;

    constructor(
        private readonly fileSystemWrapper: TransactionalFileSystem,
        private readonly compilerOptions: CompilerOptionsContainer
    ) {
        this.documentRegistry = new DocumentRegistry(fileSystemWrapper);
    }

    containsSourceFileAtPath(filePath: StandardizedFilePath) {
        return this.sourceFilesByFilePath.has(filePath);
    }

    getSourceFilePaths() {
        return this.sourceFilesByFilePath.keys();
    }

    getSourceFiles() {
        return this.sourceFilesByFilePath.values();
    }

    getSourceFileVersion(sourceFile: ts.SourceFile) {
        return this.documentRegistry.getSourceFileVersion(sourceFile);
    }

    getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath) {
        return this.sourceFilesByFilePath.get(filePath);
    }

    addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath, options: { scriptKind: ScriptKind | undefined; }): ts.SourceFile | undefined {
        let sourceFile = this.sourceFilesByFilePath.get(filePath);
        if (sourceFile == null && this.fileSystemWrapper.fileExistsSync(filePath)) {
            sourceFile = this.createSourceFileFromText(
                filePath,
                this.fileSystemWrapper.readFileSync(filePath, this.compilerOptions.getEncoding()),
                options
            );
        }

        return sourceFile;
    }

    createSourceFileFromText(
        filePath: StandardizedFilePath,
        text: string,
        options: { scriptKind: ScriptKind | undefined; }
    ): ts.SourceFile {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        const hasBom = StringUtils.hasBom(text);
        if (hasBom)
            text = StringUtils.stripBom(text);
        const sourceFile = this.documentRegistry.createOrUpdateSourceFile(filePath, this.compilerOptions.get(), ts.ScriptSnapshot.fromString(text),
            options.scriptKind);
        this.setSourceFile(sourceFile);
        return sourceFile;
    }

    setSourceFile(sourceFile: ts.SourceFile) {
        const standardizedFilePath = this.fileSystemWrapper.getStandardizedAbsolutePath(sourceFile.fileName);
        sourceFile.fileName = standardizedFilePath;

        this.documentRegistry.updateDocument(
            standardizedFilePath,
            this.compilerOptions.get(),
            ts.ScriptSnapshot.fromString(sourceFile.text),
            this.getSourceFileVersion(sourceFile),
            (sourceFile as any)["scriptKind"] as ts.ScriptKind
        );

        this.fileSystemWrapper.queueMkdir(FileUtils.getDirPath(standardizedFilePath));
        this.sourceFilesByFilePath.set(standardizedFilePath, sourceFile);
    }

    removeSourceFile(filePath: StandardizedFilePath) {
        this.sourceFilesByFilePath.delete(filePath);
    }

    containsDirectoryAtPath(dirPath: StandardizedFilePath) {
        return this.fileSystemWrapper.directoryExistsSync(dirPath);
    }

    getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath) {
        return this.fileSystemWrapper.getDirectories(dirPath);
    }
}
