import { KeyValueCache, DocumentRegistry, ScriptKind, ts, StringUtils, TsSourceFileContainer, FileUtils, TransactionalFileSystem,
    CompilerOptionsContainer } from "@ts-morph/common";

export class SourceFileCache implements TsSourceFileContainer {
    private readonly sourceFilesByFilePath = new KeyValueCache<string, ts.SourceFile>();

    readonly documentRegistry: DocumentRegistry;

    constructor(
        private readonly fileSystemWrapper: TransactionalFileSystem,
        private readonly compilerOptions: CompilerOptionsContainer
    ) {
        this.documentRegistry = new DocumentRegistry(fileSystemWrapper);
    }

    containsSourceFileAtPath(filePath: string) {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFilesByFilePath.has(filePath);
    }

    getSourceFilePaths() {
        return Array.from(this.sourceFilesByFilePath.getKeys());
    }

    getSourceFiles() {
        return this.sourceFilesByFilePath.getValuesAsArray();
    }

    getSourceFileVersion(sourceFile: ts.SourceFile) {
        return this.documentRegistry.getSourceFileVersion(sourceFile);
    }

    getSourceFileFromCacheFromFilePath(filePath: string) {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFilesByFilePath.get(filePath);
    }

    addOrGetSourceFileFromFilePath(filePath: string, options: { scriptKind: ScriptKind | undefined; }): ts.SourceFile | undefined {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
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
        filePath: string,
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
        sourceFile.fileName = this.fileSystemWrapper.getStandardizedAbsolutePath(sourceFile.fileName);

        this.documentRegistry.updateDocument(
            sourceFile.fileName,
            this.compilerOptions.get(),
            ts.ScriptSnapshot.fromString(sourceFile.text),
            this.getSourceFileVersion(sourceFile),
            (sourceFile as any)["scriptKind"] as ts.ScriptKind
        );

        this.fileSystemWrapper.queueMkdir(FileUtils.getDirPath(sourceFile.fileName));
        this.sourceFilesByFilePath.set(sourceFile.fileName, sourceFile);
    }

    removeSourceFile(filePath: string) {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        this.sourceFilesByFilePath.removeByKey(filePath);
    }

    containsDirectoryAtPath(dirPath: string) {
        dirPath = this.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this.fileSystemWrapper.directoryExistsSync(dirPath);
    }

    getChildDirectoriesOfDirectory(dirPath: string) {
        return this.fileSystemWrapper.getDirectories(dirPath);
    }
}
