import {
  CompilerOptionsContainer,
  DocumentRegistry,
  FileUtils,
  ScriptKind,
  StandardizedFilePath,
  StringUtils,
  TransactionalFileSystem,
  ts,
  TsSourceFileContainer,
} from "@ts-morph/common";

export class SourceFileCache implements TsSourceFileContainer {
  private readonly sourceFilesByFilePath = new Map<StandardizedFilePath, ts.SourceFile>();
  private projectVersion = 0;

  readonly documentRegistry: DocumentRegistry;

  constructor(
    private readonly fileSystemWrapper: TransactionalFileSystem,
    private readonly compilerOptions: CompilerOptionsContainer,
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

  getProjectVersion() {
    return this.projectVersion;
  }

  getSourceFileVersion(sourceFile: ts.SourceFile) {
    return this.documentRegistry.getSourceFileVersion(sourceFile);
  }

  getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath) {
    return this.sourceFilesByFilePath.get(filePath);
  }

  async addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath, options: { scriptKind: ScriptKind | undefined }): Promise<ts.SourceFile | undefined> {
    let sourceFile = this.sourceFilesByFilePath.get(filePath);
    if (sourceFile == null) {
      const fileText = await this.fileSystemWrapper.readFileIfExists(filePath, this.compilerOptions.getEncoding());
      if (fileText != null) {
        sourceFile = this.createSourceFileFromText(
          filePath,
          fileText,
          options,
        );
      }
    }

    return sourceFile;
  }

  addOrGetSourceFileFromFilePathSync(filePath: StandardizedFilePath, options: { scriptKind: ScriptKind | undefined }): ts.SourceFile | undefined {
    let sourceFile = this.sourceFilesByFilePath.get(filePath);
    if (sourceFile == null) {
      const fileText = this.fileSystemWrapper.readFileIfExistsSync(filePath, this.compilerOptions.getEncoding());
      if (fileText != null) {
        sourceFile = this.createSourceFileFromText(
          filePath,
          fileText,
          options,
        );
      }
    }

    return sourceFile;
  }

  createSourceFileFromText(
    filePath: StandardizedFilePath,
    text: string,
    options: { scriptKind: ScriptKind | undefined },
  ): ts.SourceFile {
    filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const hasBom = StringUtils.hasBom(text);
    if (hasBom)
      text = StringUtils.stripBom(text);
    const sourceFile = this.documentRegistry.createOrUpdateSourceFile(
      filePath,
      this.compilerOptions.get(),
      ts.ScriptSnapshot.fromString(text),
      options.scriptKind,
    );
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
      (sourceFile as any)["scriptKind"] as ts.ScriptKind,
    );

    const dirPath = FileUtils.getDirPath(standardizedFilePath);
    if (!this.fileSystemWrapper.directoryExistsSync(dirPath))
      this.fileSystemWrapper.queueMkdir(dirPath);

    this.sourceFilesByFilePath.set(standardizedFilePath, sourceFile);
    this.projectVersion++;
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
