import { FileUtils, TransactionalFileSystem } from "../fileSystem";
import { ts, CompilerOptions } from "../typescript";
import { Memoize } from "../decorators";
import { getTsParseConfigHost, TsParseConfigHostResult } from "./getTsParseConfigHost";

export class TsConfigResolver {
    private readonly host: TsParseConfigHostResult;
    private readonly tsConfigFilePath: string;
    private readonly tsConfigDirPath: string;

    constructor(private readonly fileSystem: TransactionalFileSystem, tsConfigFilePath: string, private readonly encoding: string) {
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
        const files = new Set<string>();
        const { tsConfigDirPath, fileSystem } = this;
        const directories = new Set<string>();

        compilerOptions = compilerOptions || this.getCompilerOptions();

        const rootDirs = getRootDirs(compilerOptions);
        const configFileContent = this.parseJsonConfigFileContent();

        for (let dirPath of configFileContent.directories) {
            dirPath = fileSystem.getStandardizedAbsolutePath(dirPath);
            if (dirInProject(dirPath) && fileSystem.directoryExistsSync(dirPath))
                directories.add(dirPath);
        }

        for (let filePath of configFileContent.fileNames) {
            filePath = fileSystem.getStandardizedAbsolutePath(filePath);
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

        function dirInProject(dirPath: string) {
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
