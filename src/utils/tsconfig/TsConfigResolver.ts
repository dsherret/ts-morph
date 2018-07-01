import { Diagnostic } from "../../compiler";
import { FileSystemWrapper } from "../../fileSystem";
import { CompilerOptions, ts } from "../../typescript";
import { ArrayUtils, createHashSet, FileUtils, Memoize } from "../../utils";
import { getTsParseConfigHost, TsParseConfigHostResult } from "./getTsParseConfigHost";

export class TsConfigResolver {
    private readonly host: TsParseConfigHostResult;
    private readonly tsConfigFilePath: string;
    private readonly tsConfigDirPath: string;

    constructor(private readonly fileSystem: FileSystemWrapper, tsConfigFilePath: string, private readonly encoding: string) {
        this.host = getTsParseConfigHost(fileSystem, { encoding });
        this.tsConfigFilePath = fileSystem.getStandardizedAbsolutePath(tsConfigFilePath);
        this.tsConfigDirPath = FileUtils.getDirPath(this.tsConfigFilePath);
    }

    @Memoize
    getCompilerOptions() {
        return this.parseJsonConfigFileContent(this.tsConfigDirPath).options;
    }

    @Memoize
    getErrors() {
        return (this.parseJsonConfigFileContent(this.tsConfigDirPath).errors || []).map(e => new Diagnostic(undefined, e));
    }

    @Memoize
    getPaths(compilerOptions?: CompilerOptions) {
        const files = createHashSet<string>();
        const tsConfigDirPath = this.tsConfigDirPath;
        const directories = createHashSet<string>();

        compilerOptions = compilerOptions || this.getCompilerOptions();

        for (const rootDir of getRootDirs(compilerOptions)) {
            const result = this.parseJsonConfigFileContent(this.fileSystem.getStandardizedAbsolutePath(rootDir, this.tsConfigDirPath));
            for (const filePath of result.fileNames) {
                const absoluteFilePath = this.fileSystem.getStandardizedAbsolutePath(filePath);
                if (this.fileSystem.fileExistsSync(absoluteFilePath)) {
                    files.add(absoluteFilePath);
                }
            }
            for (const dirPath of result.directories) {
                const absoluteDirPath = this.fileSystem.getStandardizedAbsolutePath(dirPath);
                if (this.fileSystem.directoryExistsSync(absoluteDirPath)) {
                    directories.add(absoluteDirPath);
                }
            }
        }

        return {
            filePaths: ArrayUtils.from(files.values()),
            directoryPaths: ArrayUtils.from(directories.values())
        };

        function getRootDirs(options: CompilerOptions) {
            const result: string[] = [];
            if (typeof options.rootDir === "string")
                result.push(options.rootDir);
            if (options.rootDirs != null)
                result.push(...options.rootDirs);
            // use the tsconfig directory if no rootDir or rootDirs is specified
            if (result.length === 0)
                result.push(tsConfigDirPath);
            return result;
        }
    }

    @Memoize
    private parseJsonConfigFileContent(dirPath: string) {
        this.host.clearDirectories();
        // do not provide a tsconfig.json filepath to this because it will start searching in incorrect directories
        const result = ts.parseJsonConfigFileContent(this.getTsConfigFileJson(), this.host, dirPath, undefined, undefined);
        delete result.options.configFilePath;
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
