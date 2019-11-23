import { FileUtils, TransactionalFileSystem, StandardizedFilePath } from "../fileSystem";
import { ts, CompilerOptions } from "../typescript";
import { Memoize } from "../decorators";
import { getTsParseConfigHost, TsParseConfigHostResult } from "./getTsParseConfigHost";

export class TsConfigResolver {
    private readonly host: TsParseConfigHostResult;
    private readonly tsConfigFilePath: StandardizedFilePath;
    private readonly tsConfigDirPath: StandardizedFilePath;

    constructor(private readonly fileSystem: TransactionalFileSystem, tsConfigFilePath: StandardizedFilePath, private readonly encoding: string) {
        this.host = getTsParseConfigHost(fileSystem, { encoding });
        this.tsConfigFilePath = fileSystem.getStandardizedAbsolutePath(tsConfigFilePath);
        this.tsConfigDirPath = FileUtils.getDirPath(this.tsConfigFilePath);
    }

    @Memoize
    getCompilerOptions() {
        return this.parseJsonConfigFileContent().options;
    }

    @Memoize
    getErrors() {
        return this.parseJsonConfigFileContent().errors || [];
    }

    @Memoize
    getPaths(compilerOptions?: CompilerOptions) {
        const files = new Set<StandardizedFilePath>();
        const { tsConfigDirPath, fileSystem } = this;
        const directories = new Set<StandardizedFilePath>();

        compilerOptions = compilerOptions || this.getCompilerOptions();

        const rootDirs = getRootDirs(compilerOptions);
        const configFileContent = this.parseJsonConfigFileContent();

        for (let dirName of configFileContent.directories) {
            const dirPath = fileSystem.getStandardizedAbsolutePath(dirName);
            if (dirInProject(dirPath) && fileSystem.directoryExistsSync(dirPath))
                directories.add(dirPath);
        }

        for (let fileName of configFileContent.fileNames) {
            const filePath = fileSystem.getStandardizedAbsolutePath(fileName);
            const parentDirPath = FileUtils.getDirPath(filePath);
            if (dirInProject(parentDirPath) && fileSystem.fileExistsSync(filePath)) {
                files.add(filePath);
                directories.add(parentDirPath);
            }
        }

        for (const rootDir of rootDirs)
            directories.add(rootDir);

        return {
            filePaths: Array.from(files.values()),
            directoryPaths: Array.from(directories.values())
        };

        function dirInProject(dirPath: StandardizedFilePath) {
            // fast check
            if (directories.has(dirPath))
                return true;

            // otherwise, check the strings
            if (rootDirs.length > 0)
                return rootDirs.some(rootDir => FileUtils.pathStartsWith(dirPath, rootDir));
            return FileUtils.pathStartsWith(dirPath, tsConfigDirPath);
        }

        function getRootDirs(options: CompilerOptions) {
            const result: string[] = [];
            if (typeof options.rootDir === "string")
                result.push(options.rootDir);
            if (options.rootDirs != null)
                result.push(...options.rootDirs);
            return result.map(rootDir => fileSystem.getStandardizedAbsolutePath(rootDir, tsConfigDirPath));
        }
    }

    @Memoize
    private parseJsonConfigFileContent() {
        this.host.clearDirectories();
        const result = ts.parseJsonConfigFileContent(this.getTsConfigFileJson(), this.host, this.tsConfigDirPath, undefined, this.tsConfigFilePath);
        return { ...result, directories: this.host.getDirectories() };
    }

    @Memoize
    private getTsConfigFileJson() {
        const text = this.fileSystem.readFileSync(this.tsConfigFilePath, this.encoding);
        const parseResult = ts.parseConfigFileTextToJson(this.tsConfigFilePath, text);
        if (parseResult.error != null)
            throw new Error(parseResult.error.messageText.toString());
        return parseResult.config;
    }
}
