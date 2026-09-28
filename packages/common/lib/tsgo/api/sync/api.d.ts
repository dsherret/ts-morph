/// <reference lib="esnext.disposable" />
import type { APIRequest as ProtocolRequest, APIResponse as ProtocolResponse } from "../proto";
import { CheckFlags } from "../../enums/checkFlags.enum";
import { CompletionItemKind } from "../../enums/completionItemKind.enum";
import { DiagnosticCategory } from "../../enums/diagnosticCategory.enum";
import { ElementFlags } from "../../enums/elementFlags.enum";
import { EmitOnly } from "../../enums/emitOnly.enum";
import { IndexKind } from "../../enums/indexKind.enum";
import { JsxEmit } from "../../enums/jsxEmit.enum";
import { ModuleKind } from "../../enums/moduleKind.enum";
import { ModuleResolutionKind } from "../../enums/moduleResolutionKind.enum";
import { NodeBuilderFlags } from "../../enums/nodeBuilderFlags.enum";
import { ObjectFlags } from "../../enums/objectFlags.enum";
import { ScriptKind } from "../../enums/scriptKind.enum";
import { SignatureFlags } from "../../enums/signatureFlags.enum";
import { SignatureKind } from "../../enums/signatureKind.enum";
import { SymbolFlags } from "../../enums/symbolFlags.enum";
import { TypeFlags } from "../../enums/typeFlags.enum";
import { TypeFormatFlags } from "../../enums/typeFormatFlags.enum";
import { TypePredicateKind } from "../../enums/typePredicateKind.enum";
import { type __String, type CallLikeExpression, type Declaration, type Expression, type FileReference, type Identifier, ModifierFlags, type NamedTupleMember, type Node, type ParameterDeclaration, type Path, type SourceFile, type StringLiteralLikeNode, type SyntaxKind, type TypeNode } from "../../ast/index";
import type { APIOptions, LSPConnectionOptions } from "../options";
import type { BuildResponse, CleanBuildResponse, CompilerOptions, ConfiguredProjectId, CreateBuildOrchestratorResponse, CreateProgramOptions as ProtocolCreateProgramOptions, CreateSnapshotParams as ProtocolCreateSnapshotParams, CreateSnapshotProgramParams as ProtocolCreateSnapshotProgramParams, CreateSnapshotResponse, CreateSourceFileOptions, Diagnostic, DocumentIdentifier, DocumentPosition, FileNotifications, InferredProjectId, LanguageServerSnapshotChanges as ProtocolLanguageServerSnapshotChanges, ModuleResolutionEntry, ModuleResolutionSpec, PackageId, ParsedCommandLine, ProjectConfig, ProjectId, ProjectReference, ProjectResponse, ReadConfigFileResponse, ReconfigureSnapshotProgramParams as ProtocolReconfigureSnapshotProgramParams, ResolutionMode, ResolvedModule, ResolvedTypeReferenceDirective, ResolveModuleNameResult, SignaturePropertyMethod, SignatureResponse, SourceFileIdentity, SourceFileMetadata, StaticModuleResolution, SymbolPropertyMethod, SymbolResponse, SymbolsPropertyMethod, SyntheticProjectId, TextEdit, TypeAcquisition, TypePropertyMethod, TypeResponse, TypesPropertyMethod } from "../proto";
import type { CodeFixAction, CombinedCodeActions, FileSpan, FileTextEdits, FormattingOptions, OrganizeImportsMode, QuotePreference } from "../proto";
import type { RenameOptions } from "./types";
import { SourceFileCache } from "../sourceFileCache";
import type { RequestTiming, TimingAccumulators, TimingInfo } from "../timing";
import { Client, type ClientSocketOptions, type ClientSpawnOptions } from "./client";
import type { AssertsIdentifierTypePredicate, AssertsThisTypePredicate, BigIntLiteralType, BooleanLiteralType, CompletionEntry, CompletionInfo, CompletionOptions, ConditionalType, EmitOutput, EmitOutputFile, EmitResult, FormatDiagnosticsHost, FreshableType, GenericType, GetImportEditsForSymbolsOptions, IdentifierTypePredicate, ImportAdderAction as APIImportAdderAction, IndexedAccessType, IndexInfo, IndexType, InterfaceType, IntersectionType, IntrinsicType, JSDocTagInfo, LiteralType, MappedType, NumberLiteralType, ObjectType, StringLiteralType, StringMappingType, StructuredType, SubstitutionType, TemplateLiteralType, ThisTypePredicate, TupleType, TupleTypeReference, Type, TypeParameter, TypePredicate, TypePredicateBase, TypeReference, UnionOrIntersectionType, UnionType } from "./types";
export { formatDiagnostics, formatDiagnosticsWithColorAndContext } from "../diagnosticFormatter";
export { documentURIToFileName, fileNameToDocumentURI } from "../path";
export { CheckFlags, CompletionItemKind, DiagnosticCategory, ElementFlags, EmitOnly, IndexKind, JsxEmit, ModifierFlags, ModuleKind, ModuleResolutionKind, NodeBuilderFlags, ObjectFlags, ScriptKind, SignatureFlags, SignatureKind, SymbolFlags, TypeFlags, TypeFormatFlags, TypePredicateKind };
export type { APIImportAdderAction as ImportAdderAction, APIOptions, AssertsIdentifierTypePredicate, AssertsThisTypePredicate, BigIntLiteralType, BooleanLiteralType, ClientSocketOptions, ClientSpawnOptions, CompilerOptions, CompletionEntry, CompletionInfo, CompletionOptions, ConditionalType, ConfiguredProjectId, CreateSourceFileOptions, Diagnostic, DocumentIdentifier, DocumentPosition, EmitOutput, EmitOutputFile, EmitResult, FileNotifications, FormatDiagnosticsHost, FreshableType, GenericType, GetImportEditsForSymbolsOptions, IdentifierTypePredicate, IndexedAccessType, IndexInfo, IndexType, InferredProjectId, InterfaceType, IntersectionType, IntrinsicType, JSDocTagInfo, LiteralType, LSPConnectionOptions, MappedType, ModuleResolutionEntry, ModuleResolutionSpec, NumberLiteralType, ObjectType, PackageId, ParsedCommandLine, ProjectConfig, ProjectId, ProjectReference, ReadConfigFileResponse, RenameOptions, RequestTiming, ResolutionMode, ResolvedModule, ResolvedTypeReferenceDirective, ResolveModuleNameResult, SourceFileIdentity, SourceFileMetadata, StaticModuleResolution, StringLiteralType, StringMappingType, StructuredType, SubstitutionType, SyntheticProjectId, TemplateLiteralType, TextEdit, ThisTypePredicate, TimingAccumulators, TimingInfo, TupleType, TupleTypeReference, Type, TypeAcquisition, TypeParameter, TypePredicate, TypePredicateBase, TypeReference, UnionOrIntersectionType, UnionType, };
export interface ModuleResolverOptions {
    moduleResolutions?: ModuleResolutionSpec | undefined;
    resolveModuleName?: ResolveModuleNameCallback | undefined;
}
export interface ResolveModuleNameCallbackOptions {
    snapshot: Snapshot | InProgressSnapshot | undefined;
}
declare const inProgressSnapshotBrand: unique symbol;
export type InProgressSnapshot = number & {
    readonly [inProgressSnapshotBrand]: never;
};
export type ResolveModuleNameCallback = (moduleName: string, containingDirectory: string, resolutionMode: ResolutionMode | undefined, options: ResolveModuleNameCallbackOptions) => StaticModuleResolution | undefined;
export type CreateProgramOptions = Omit<ProtocolCreateProgramOptions, "moduleResolver"> & {
    moduleResolver?: ModuleResolver | undefined;
};
export type CreateSnapshotProgramParams = Omit<ProtocolCreateSnapshotProgramParams, "options"> & {
    options?: CreateProgramOptions | undefined;
};
export type ReconfigureSnapshotProgramParams = Omit<ProtocolReconfigureSnapshotProgramParams, "options"> & {
    options?: CreateProgramOptions | undefined;
};
export type CreateSnapshotParams = Omit<ProtocolCreateSnapshotParams, "createPrograms" | "reconfigurePrograms"> & {
    createPrograms?: readonly CreateSnapshotProgramParams[] | undefined;
    reconfigurePrograms?: readonly ReconfigureSnapshotProgramParams[] | undefined;
};
export type LanguageServerSnapshotChanges = Omit<ProtocolLanguageServerSnapshotChanges, "createPrograms" | "reconfigurePrograms"> & {
    createPrograms?: readonly CreateSnapshotProgramParams[] | undefined;
    reconfigurePrograms?: readonly ReconfigureSnapshotProgramParams[] | undefined;
};
export interface TranspileOptions {
    compilerOptions?: CompilerOptions | undefined;
    fileName?: string | undefined;
    reportDiagnostics?: boolean | undefined;
}
export interface TranspileOutput {
    outputText: string;
    diagnostics?: readonly Diagnostic[] | undefined;
    sourceMapText?: string | undefined;
}
export { all, type AllAPIRequestGenerator, type AnyAPIRequestGenerator, type APIRequestGenerator, defer, type DeferredAPIRequestGenerator, type ExecutedGeneratorsResults } from "./generatorSupport";
import { type AnyAPIRequestGenerator, type ExecutedGeneratorsResults } from "./generatorSupport";
export declare class API<FromLSP extends boolean = false> implements FormatDiagnosticsHost {
    private client;
    private sourceFileCache;
    private parseDecoder;
    private toPath;
    private currentDirectory;
    private readonly decoder;
    private getCanonicalFileNameWorker;
    private initialized;
    private initializing;
    private activeSnapshots;
    private activeBuildOrchestrators;
    private activeSourceFileLeases;
    readonly printer: Printer;
    private latestSnapshot;
    private compilerVersion;
    readonly internal: InternalAPI;
    /** The compiler's own version, e.g. `7.1.0-dev`. */
    get version(): string;
    constructor(options?: APIOptions | LSPConnectionOptions);
    /**
     * Create an API instance from an existing LSP connection's API session.
     * Use this when connecting to an API pipe provided by an LSP server via custom/initializeAPISession.
     */
    static get fromLSPConnection(): {
        (options: LSPConnectionOptions): API<true>;
        gen(options: LSPConnectionOptions): Generator<ProtocolRequest, API<true>, ProtocolResponse["result"]>;
    };
    batch<T extends readonly AnyAPIRequestGenerator[]>(...requestGenerators: T): ExecutedGeneratorsResults<T>;
    private get ensureInitialized();
    private get initializeWorker();
    getCurrentDirectory(): string;
    getCanonicalFileName(fileName: string): string;
    getNewLine(): string;
    get createBuildOrchestrator(): {
        (rootNames: readonly string[], buildOrchestratorOptions: BuildOrchestratorOptions): BuildOrchestrator;
        gen(rootNames: readonly string[], buildOrchestratorOptions: BuildOrchestratorOptions): Generator<ProtocolRequest, BuildOrchestrator, ProtocolResponse["result"]>;
    };
    get parseConfigFile(): {
        (file: DocumentIdentifier): ParsedCommandLine;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, ParsedCommandLine, ProtocolResponse["result"]>;
    };
    get parseCommandLine(): {
        (commandLine: readonly string[]): ParsedCommandLine;
        gen(commandLine: readonly string[]): Generator<ProtocolRequest, ParsedCommandLine, ProtocolResponse["result"]>;
    };
    get readConfigFile(): {
        (file: DocumentIdentifier): ReadConfigFileResponse;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, ReadConfigFileResponse, ProtocolResponse["result"]>;
    };
    get parseJsonConfigFileContent(): {
        (json: any, options: {
            configDirectory: string;
            configFileName?: never;
        } | {
            configFileName: DocumentIdentifier;
            configDirectory?: never;
        }): ParsedCommandLine;
        gen(json: any, options: {
            configDirectory: string;
            configFileName?: never;
        } | {
            configFileName: DocumentIdentifier;
            configDirectory?: never;
        }): Generator<ProtocolRequest, ParsedCommandLine, ProtocolResponse["result"]>;
    };
    /**
     * Create and retain a source file independently of a program.
     * Dispose the returned lease when the source file no longer needs to remain available remotely.
     */
    get createSourceFile(): {
        (fileName: string, sourceText: string, options?: CreateSourceFileOptions): RetainedSourceFile;
        gen(fileName: string, sourceText: string, options?: CreateSourceFileOptions): Generator<ProtocolRequest, RetainedSourceFile, ProtocolResponse["result"]>;
    };
    /**
     * Read, create, and retain a source file independently of a program.
     * Dispose the returned lease when the source file no longer needs to remain available remotely.
     */
    get createSourceFileFromFile(): {
        (file: DocumentIdentifier, options?: CreateSourceFileOptions): RetainedSourceFile;
        gen(file: DocumentIdentifier, options?: CreateSourceFileOptions): Generator<ProtocolRequest, RetainedSourceFile, ProtocolResponse["result"]>;
    };
    private retainSourceFileResponse;
    get transpileModule(): {
        (input: string, options?: TranspileOptions): TranspileOutput;
        gen(input: string, options?: TranspileOptions): Generator<ProtocolRequest, TranspileOutput, ProtocolResponse["result"]>;
    };
    get transpileModuleFromFile(): {
        (file: DocumentIdentifier, options?: TranspileOptions): TranspileOutput;
        gen(file: DocumentIdentifier, options?: TranspileOptions): Generator<ProtocolRequest, TranspileOutput, ProtocolResponse["result"]>;
    };
    get transpileDeclaration(): {
        (input: string, options?: TranspileOptions): TranspileOutput;
        gen(input: string, options?: TranspileOptions): Generator<ProtocolRequest, TranspileOutput, ProtocolResponse["result"]>;
    };
    get transpileDeclarationFromFile(): {
        (file: DocumentIdentifier, options?: TranspileOptions): TranspileOutput;
        gen(file: DocumentIdentifier, options?: TranspileOptions): Generator<ProtocolRequest, TranspileOutput, ProtocolResponse["result"]>;
    };
    get createSnapshot(): {
        <const CreatePrograms extends CreateSnapshotParams["createPrograms"] = undefined, const OpenFiles extends CreateSnapshotParams["openFiles"] = undefined>(params: SnapshotOperationParams<CreateSnapshotParams, CreatePrograms, OpenFiles>): SnapshotForOperationResults<CreatePrograms, OpenFiles>;
        (): Snapshot;
        gen<const CreatePrograms extends CreateSnapshotParams["createPrograms"] = undefined, const OpenFiles extends CreateSnapshotParams["openFiles"] = undefined>(params: SnapshotOperationParams<CreateSnapshotParams, CreatePrograms, OpenFiles>): Generator<ProtocolRequest, SnapshotForOperationResults<CreatePrograms, OpenFiles>, ProtocolResponse["result"]>;
        gen(): Generator<ProtocolRequest, Snapshot, ProtocolResponse["result"]>;
    };
    private get updateSnapshot();
    private prepareCreateSnapshotParams;
    private prepareLanguageServerSnapshotChanges;
    private createSnapshotUpdater;
    /**
     * Returns the language server's current canonical snapshot after atomically
     * adopting any supplied API-driven changes. Only available on LSP-connected APIs.
     */
    get getCurrentLanguageServerSnapshot(): {
        <const CreatePrograms extends LanguageServerSnapshotChanges["createPrograms"] = undefined, const OpenFiles extends LanguageServerSnapshotChanges["openFiles"] = undefined>(...args: FromLSP extends true ? [changes: SnapshotOperationParams<LanguageServerSnapshotChanges, CreatePrograms, OpenFiles>, baseSnapshot?: Snapshot] : [changes: never, baseSnapshot?: never]): SnapshotForOperationResults<CreatePrograms, OpenFiles>;
        (...args: FromLSP extends true ? [changes?: LanguageServerSnapshotChanges, baseSnapshot?: Snapshot] : [changes: never, baseSnapshot?: never]): Snapshot;
        gen<const CreatePrograms extends LanguageServerSnapshotChanges["createPrograms"] = undefined, const OpenFiles extends LanguageServerSnapshotChanges["openFiles"] = undefined>(...args: FromLSP extends true ? [changes: SnapshotOperationParams<LanguageServerSnapshotChanges, CreatePrograms, OpenFiles>, baseSnapshot?: Snapshot] : [changes: never, baseSnapshot?: never]): Generator<ProtocolRequest, SnapshotForOperationResults<CreatePrograms, OpenFiles>, ProtocolResponse["result"]>;
        gen(...args: FromLSP extends true ? [changes?: LanguageServerSnapshotChanges, baseSnapshot?: Snapshot] : [changes: never, baseSnapshot?: never]): Generator<ProtocolRequest, Snapshot, ProtocolResponse["result"]>;
    };
    [globalThis.Symbol.dispose](): void;
    get close(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    get createModuleResolver(): {
        (compilerOptions: CompilerOptions, options?: ModuleResolverOptions): ModuleResolver;
        gen(compilerOptions: CompilerOptions, options?: ModuleResolverOptions): Generator<ProtocolRequest, ModuleResolver, ProtocolResponse["result"]>;
    };
    clearSourceFileCache(): void;
    get runWithTemporaryFileUpdate(): {
        (baseSnapshot: Snapshot, file: DocumentIdentifier, newText: string, cb: (newSnapshot: Snapshot) => void): void;
        gen(baseSnapshot: Snapshot, file: DocumentIdentifier, newText: string, cb: (newSnapshot: Snapshot) => void | Generator<ProtocolRequest, void, ProtocolResponse["result"]>): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    /**
     * Returns a snapshot of collected timing information for requests made
     * through this API instance: client-measured round-trip latency and bytes
     * transferred, folded together with the server's own per-request processing
     * time and an estimated transport overhead (round-trip minus server time).
     *
     * Fetching the snapshot issues a lightweight request to the server to
     * retrieve its timing collection. Collection must be enabled via the
     * `collectTiming` option; when it is not, the returned snapshot has
     * `enabled: false` and zeroed totals.
     */
    get getTimingInfo(): {
        (): TimingInfo;
        gen(): Generator<ProtocolRequest, TimingInfo, ProtocolResponse["result"]>;
    };
    /** Clears all accumulated timing totals and recent-request history, on both the client and the server. */
    get resetTimingInfo(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    /** Creates a program from current filesystem state. */
    get createProgram(): {
        (rootFiles: readonly DocumentIdentifier[], compilerOptions: CompilerOptions, createProgramOptions?: CreateProgramOptions): Program;
        gen(rootFiles: readonly DocumentIdentifier[], compilerOptions: CompilerOptions, createProgramOptions?: CreateProgramOptions): Generator<ProtocolRequest, Program, ProtocolResponse["result"]>;
    };
}
type EnsureInitialized = (() => void) & {
    gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
};
/** An independently retained source file and its disposable remote-lifetime lease. */
export declare class RetainedSourceFile {
    readonly sourceFile: SourceFile;
    private readonly lease;
    private readonly client;
    private readonly onDispose;
    private disposed;
    private disposePromise;
    constructor(sourceFile: SourceFile, lease: number, client: Client, onDispose: () => void);
    [globalThis.Symbol.dispose](): void;
    get dispose(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    private get disposeWorker();
}
export declare class InternalAPI {
    private client;
    private ensureInitialized;
    /** @internal */
    constructor(client: Client, ensureInitialized: EnsureInitialized);
    get startCPUProfile(): {
        (dir: string): void;
        gen(dir: string): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    get stopCPUProfile(): {
        (): string;
        gen(): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get saveHeapProfile(): {
        (dir: string): string;
        gen(dir: string): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
}
type SnapshotUpdater = ((params: CreateSnapshotParams) => Snapshot) & {
    gen(params: CreateSnapshotParams): Generator<ProtocolRequest, Snapshot, ProtocolResponse["result"]>;
};
export interface SnapshotOperation {
    readonly createdPrograms?: readonly Program<SyntheticProjectId>[] | undefined;
    readonly openedFiles?: readonly SnapshotOpenedFileOperation[] | undefined;
}
export interface SnapshotOpenedFileOperation {
    readonly project: Project;
}
/** Replaces every element of a tuple while preserving its length and index structure. */
type MapTupleTo<Tuple extends readonly unknown[], Result> = {
    readonly [Index in keyof Tuple]: Result;
};
/**
 * Keeps `Tuple` as an inference target while contextually typing each element from
 * `Elements`. The mapped intersection supplies nested completions and excess-property
 * checks without widening an inferred tuple to an array.
 */
type ContextualizeTuple<Tuple extends readonly unknown[] | undefined, Elements extends readonly unknown[] | undefined> = Tuple & {
    readonly [Index in keyof Tuple]: NonNullable<Elements>[number];
};
/** Substitutes the operation arrays with contextually typed, tuple-preserving versions. */
type SnapshotOperationParams<Params extends {
    createPrograms?: readonly unknown[] | undefined;
    openFiles?: readonly unknown[] | undefined;
}, CreatePrograms extends Params["createPrograms"], OpenFiles extends Params["openFiles"]> = Omit<Params, "createPrograms" | "openFiles"> & {
    createPrograms?: ContextualizeTuple<CreatePrograms, Params["createPrograms"]> | undefined;
    openFiles?: ContextualizeTuple<OpenFiles, Params["openFiles"]> | undefined;
};
/**
 * Refines a snapshot's operation results to required tuples when the corresponding
 * operation arrays were supplied, preserving their lengths for indexed access.
 */
type SnapshotForOperationResults<CreatePrograms extends readonly unknown[] | undefined, OpenFiles extends readonly unknown[] | undefined> = Snapshot & {
    readonly operation: SnapshotOperation & (CreatePrograms extends readonly unknown[] ? {
        readonly createdPrograms: MapTupleTo<CreatePrograms, Program<SyntheticProjectId>>;
    } : unknown) & (OpenFiles extends readonly unknown[] ? {
        readonly openedFiles: MapTupleTo<OpenFiles, SnapshotOpenedFileOperation>;
    } : unknown);
};
/** Derives the refined snapshot result type from a complete operation parameter type. */
export type SnapshotForOperation<Params extends CreateSnapshotParams> = SnapshotForOperationResults<Params extends {
    createPrograms: infer CreatePrograms extends readonly unknown[];
} ? CreatePrograms : undefined, Params extends {
    openFiles: infer OpenFiles extends readonly unknown[];
} ? OpenFiles : undefined>;
export declare class Snapshot {
    readonly id: number;
    readonly operation: SnapshotOperation;
    private projectMap;
    private toPath;
    private client;
    private disposed;
    private disposePromise;
    private onDispose;
    private snapshotRegistry;
    private projectDataMap;
    private updateSnapshot;
    readonly internal: SnapshotInternalAPI;
    constructor(data: CreateSnapshotResponse, client: Client, sourceFileCache: SourceFileCache, toPath: (fileName: string) => Path, formatDiagnosticsHost: FormatDiagnosticsHost, onDispose: () => void, updateSnapshot: SnapshotUpdater, baseSnapshot?: Snapshot);
    getProjects(): readonly Project[];
    getConfiguredProject(configFileName: string): Project<ConfiguredProjectId> | undefined;
    getProject<Id extends ProjectId>(projectId: Id): Project<Id> | undefined;
    getProgram<Id extends ProjectId>(projectId: Id): Program<Id> | undefined;
    get update(): {
        <const CreatePrograms extends CreateSnapshotParams["createPrograms"] = undefined, const OpenFiles extends CreateSnapshotParams["openFiles"] = undefined>(params: SnapshotOperationParams<CreateSnapshotParams, CreatePrograms, OpenFiles>): SnapshotForOperationResults<CreatePrograms, OpenFiles>;
        (params: CreateSnapshotParams): Snapshot;
        gen<const CreatePrograms extends CreateSnapshotParams["createPrograms"] = undefined, const OpenFiles extends CreateSnapshotParams["openFiles"] = undefined>(params: SnapshotOperationParams<CreateSnapshotParams, CreatePrograms, OpenFiles>): Generator<ProtocolRequest, SnapshotForOperationResults<CreatePrograms, OpenFiles>, ProtocolResponse["result"]>;
        gen(params: CreateSnapshotParams): Generator<ProtocolRequest, Snapshot, ProtocolResponse["result"]>;
    };
    /**
     * Gets the default project for a given file from the configured projects and
     * inferred project already loaded in the snapshot. Synthetic projects are not
     * considered. Files that have been opened with `openFiles` are guaranteed to
     * have a result.
     */
    get getDefaultProjectForFile(): {
        (file: DocumentIdentifier): Project | undefined;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, Project | undefined, ProtocolResponse["result"]>;
    };
    [globalThis.Symbol.dispose](): void;
    get dispose(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    private get disposeWorker();
    isDisposed(): boolean;
    private ensureNotDisposed;
    private requireProject;
}
export declare class ModuleResolver {
    readonly id: number;
    private readonly client;
    private readonly disposeCallback;
    private disposed;
    constructor(id: number, client: Client, disposeCallback: (() => void) | undefined);
    get resolveModuleName(): {
        (moduleName: string, containingDirectory: DocumentIdentifier, resolutionMode?: ResolutionMode, options?: {
            snapshot?: Snapshot | InProgressSnapshot | undefined;
        }): ResolveModuleNameResult;
        gen(moduleName: string, containingDirectory: DocumentIdentifier, resolutionMode?: ResolutionMode, options?: {
            snapshot?: Snapshot | InProgressSnapshot | undefined;
        }): Generator<ProtocolRequest, ResolveModuleNameResult, ProtocolResponse["result"]>;
    };
    [globalThis.Symbol.dispose](): void;
    get dispose(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    /** @internal */
    ensureNotDisposed(): void;
}
declare class SnapshotObjectRegistry {
    private readonly symbols;
    private readonly client;
    private readonly snapshotId;
    private readonly resolveProject;
    constructor(client: Client, snapshotId: number, resolveProject: (projectId: ProjectId) => Project | undefined);
    /** Resolve a project ID to its Project within this snapshot. */
    getProject(projectId: ProjectId): Project | undefined;
    getOrCreateSymbol(data: SymbolResponse): Symbol;
    getSymbol(id: number): Symbol | undefined;
    clear(): void;
    get fetchSymbol(): {
        (source: Symbol | Signature | Type, method: SymbolPropertyMethod, handle: number | undefined, projectId: ProjectId): Symbol;
        gen(source: Symbol | Signature | Type, method: SymbolPropertyMethod, handle: number | undefined, projectId: ProjectId): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    get fetchSymbols(): {
        (source: Symbol | Signature | Type, method: SymbolsPropertyMethod, handles: readonly number[] | undefined, projectId: ProjectId): readonly Symbol[];
        gen(source: Symbol | Signature | Type, method: SymbolsPropertyMethod, handles: readonly number[] | undefined, projectId: ProjectId): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
}
declare class ProjectObjectRegistry {
    private client;
    private snapshotId;
    private project;
    private snapshotRegistry;
    private types;
    private signatures;
    constructor(client: Client, snapshotId: number, project: Project, snapshotRegistry: SnapshotObjectRegistry);
    getOrCreateSymbol(data: SymbolResponse): Symbol;
    getSymbol(id: number): Symbol | undefined;
    getOrCreateType(data: TypeResponse): TypeObject;
    getType(id: number): TypeObject | undefined;
    createNodeHandle<T extends Node>(handle: string): NodeHandle<T>;
    getOrCreateSignature(data: SignatureResponse): Signature;
    getSignature(id: number): Signature | undefined;
    clear(): void;
    get fetchOptionalType(): {
        <T extends Type>(source: Symbol | Signature | Type, method: TypePropertyMethod, handle: number | false | undefined): T | undefined;
        gen<T extends Type>(source: Symbol | Signature | Type, method: TypePropertyMethod, handle: number | false | undefined): Generator<ProtocolRequest, T | undefined, ProtocolResponse["result"]>;
    };
    get fetchType(): {
        <T extends Type>(source: Symbol | Signature | Type, method: TypePropertyMethod, handle: number | false | undefined): T;
        gen<T extends Type>(source: Symbol | Signature | Type, method: TypePropertyMethod, handle: number | false | undefined): Generator<ProtocolRequest, T, ProtocolResponse["result"]>;
    };
    get fetchSymbol(): {
        (source: Symbol | Signature | Type, method: SymbolPropertyMethod, handle: number | undefined): Symbol;
        gen(source: Symbol | Signature | Type, method: SymbolPropertyMethod, handle: number | undefined): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    get fetchSignature(): {
        (source: Symbol | Signature | Type, method: SignaturePropertyMethod, handle: number | undefined): Signature;
        gen(source: Symbol | Signature | Type, method: SignaturePropertyMethod, handle: number | undefined): Generator<ProtocolRequest, Signature, ProtocolResponse["result"]>;
    };
    get fetchTypes(): {
        (source: Symbol | Signature | Type, method: TypesPropertyMethod, handles?: readonly number[]): readonly Type[];
        gen(source: Symbol | Signature | Type, method: TypesPropertyMethod, handles?: readonly number[]): Generator<ProtocolRequest, readonly Type[], ProtocolResponse["result"]>;
    };
    get fetchSymbols(): {
        (source: Symbol | Signature | Type, method: SymbolsPropertyMethod, handles?: readonly number[]): readonly Symbol[];
        gen(source: Symbol | Signature | Type, method: SymbolsPropertyMethod, handles?: readonly number[]): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get fetchBaseTypes(): {
        (source: Type): readonly Type[];
        gen(source: Type): Generator<ProtocolRequest, readonly Type[], ProtocolResponse["result"]>;
    };
    get fetchPropertiesOfType(): {
        (source: Type): readonly Symbol[];
        gen(source: Type): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get fetchApparentPropertiesOfType(): {
        (source: Type): readonly Symbol[];
        gen(source: Type): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get fetchPropertyOfType(): {
        (source: Type, name: string): Symbol | undefined;
        gen(source: Type, name: string): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get fetchSignaturesOfType(): {
        (source: Type, kind: SignatureKind): readonly Signature[];
        gen(source: Type, kind: SignatureKind): Generator<ProtocolRequest, readonly Signature[], ProtocolResponse["result"]>;
    };
    get fetchIndexInfosOfType(): {
        (source: Type): readonly IndexInfo[];
        gen(source: Type): Generator<ProtocolRequest, readonly IndexInfo[], ProtocolResponse["result"]>;
    };
    get fetchTypeParameterAtPosition(): {
        (source: Signature, pos: number): Type;
        gen(source: Signature, pos: number): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
}
export declare class Project<Id extends ProjectId = ProjectId> {
    readonly id: Id;
    readonly configFileName: string;
    readonly currentDirectory: string;
    readonly dirty: boolean;
    /** The project's config, without its root file list — see `getRootFileNames`. */
    readonly parsedCommandLine: ProjectConfig;
    /** @deprecated Use `parsedCommandLine.options`. */
    readonly compilerOptions: CompilerOptions;
    readonly program: Program<Id>;
    readonly checker: Checker;
    readonly languageService: LanguageService;
    private client;
    private snapshotId;
    private rootFileNames;
    constructor(data: ProjectResponse, snapshotId: number, client: Client, sourceFileCache: SourceFileCache, toPath: (fileName: string) => Path, formatDiagnosticsHost: FormatDiagnosticsHost, snapshotRegistry: SnapshotObjectRegistry);
    /**
     * The project's root file names, as its config resolved them.
     *
     * These are fetched the first time they are asked for rather than sent with
     * the project, because the list is as long as the project and a snapshot
     * describes every project it holds: carrying it would make every edit cost
     * time proportional to the size of the project, for a list most callers never
     * read.
     */
    get getRootFileNames(): {
        (): readonly string[];
        gen(): Generator<ProtocolRequest, readonly string[], ProtocolResponse["result"]>;
    };
    /** @deprecated Use `languageService.getImportAdderEdits`. */
    get getImportAdderEdits(): {
        (file: DocumentIdentifier, actions: readonly APIImportAdderAction[]): readonly TextEdit[];
        gen(file: DocumentIdentifier, actions: readonly APIImportAdderAction[]): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    /** @deprecated Use `languageService.getImportEditsForSymbols`. */
    get getImportEditsForSymbols(): {
        (file: DocumentIdentifier, symbols: readonly Symbol[], options?: GetImportEditsForSymbolsOptions): readonly TextEdit[];
        gen(file: DocumentIdentifier, symbols: readonly Symbol[], options?: GetImportEditsForSymbolsOptions): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    /** Returns the edits that format an entire file. */
    get formatDocument(): {
        (file: DocumentIdentifier, options?: FormattingOptions): readonly TextEdit[];
        gen(file: DocumentIdentifier, options?: FormattingOptions): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    /** Returns the edits that format the `[pos, end)` span of a file. */
    get formatDocumentRange(): {
        (file: DocumentIdentifier, pos: number, end: number, options?: FormattingOptions): readonly TextEdit[];
        gen(file: DocumentIdentifier, pos: number, end: number, options?: FormattingOptions): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    /**
     * Returns the edits that sort, combine, and/or remove unused imports in a
     * file. Defaults to all three; see {@link OrganizeImportsMode}.
     */
    get organizeImports(): {
        (file: DocumentIdentifier, mode?: OrganizeImportsMode): readonly TextEdit[];
        gen(file: DocumentIdentifier, mode?: OrganizeImportsMode): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    /**
     * Returns the edits that rename the symbol at `position`, grouped by file.
     * An empty result means the element cannot be renamed.
     *
     * `useAliasesForRename` overrides the providePrefixAndSuffixTextForRename
     * user preference: when false, a shorthand property assignment, binding
     * element, or import/export specifier is renamed outright instead of being
     * given the old name as an alias.
     */
    get rename(): {
        (file: DocumentIdentifier, position: number, newName: string, options?: RenameOptions): readonly FileTextEdits[];
        gen(file: DocumentIdentifier, position: number, newName: string, options?: RenameOptions): Generator<ProtocolRequest, readonly FileTextEdits[], ProtocolResponse["result"]>;
    };
    /** Returns the locations that define the symbol at `position`. */
    get getDefinition(): {
        (file: DocumentIdentifier, position: number): readonly FileSpan[];
        gen(file: DocumentIdentifier, position: number): Generator<ProtocolRequest, readonly FileSpan[], ProtocolResponse["result"]>;
    };
    /** Returns the locations that implement the symbol at `position`. */
    get getImplementations(): {
        (file: DocumentIdentifier, position: number): readonly FileSpan[];
        gen(file: DocumentIdentifier, position: number): Generator<ProtocolRequest, readonly FileSpan[], ProtocolResponse["result"]>;
    };
    /**
     * Returns the quick fixes available for the `[pos, end)` span. When
     * `errorCodes` is given, only fixes addressing those diagnostics are returned.
     * `quotePreference` decides the quotes a fix writes a new string literal with.
     */
    get getCodeFixes(): {
        (file: DocumentIdentifier, pos: number, end: number, errorCodes?: readonly number[], quotePreference?: QuotePreference): readonly CodeFixAction[];
        gen(file: DocumentIdentifier, pos: number, end: number, errorCodes?: readonly number[], quotePreference?: QuotePreference): Generator<ProtocolRequest, readonly CodeFixAction[], ProtocolResponse["result"]>;
    };
    /**
     * Returns the edits that apply `fixId` everywhere it is needed in the file,
     * i.e. the "fix all" form of a quick fix. Throws when no provider owns the
     * fix id.
     */
    get getCombinedCodeFix(): {
        (file: DocumentIdentifier, fixId: string, options?: FormattingOptions, quotePreference?: QuotePreference): CombinedCodeActions;
        gen(file: DocumentIdentifier, fixId: string, options?: FormattingOptions, quotePreference?: QuotePreference): Generator<ProtocolRequest, CombinedCodeActions, ProtocolResponse["result"]>;
    };
    dispose(): void;
}
export declare class LanguageService {
    private snapshotId;
    private project;
    private client;
    private objectRegistry;
    constructor(snapshotId: number, project: Project, client: Client, objectRegistry: ProjectObjectRegistry);
    get getImportAdderEdits(): {
        (file: DocumentIdentifier, actions: readonly APIImportAdderAction[]): readonly TextEdit[];
        gen(file: DocumentIdentifier, actions: readonly APIImportAdderAction[]): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    get getImportEditsForSymbols(): {
        (file: DocumentIdentifier, symbols: readonly Symbol[], options?: GetImportEditsForSymbolsOptions): readonly TextEdit[];
        gen(file: DocumentIdentifier, symbols: readonly Symbol[], options?: GetImportEditsForSymbolsOptions): Generator<ProtocolRequest, readonly TextEdit[], ProtocolResponse["result"]>;
    };
    get getReferencedSymbolsForNode(): {
        (node: Node, position: number): ReferencedSymbolEntry[];
        gen(node: Node, position: number): Generator<ProtocolRequest, ReferencedSymbolEntry[], ProtocolResponse["result"]>;
    };
    get getSignatureUsage(): {
        (signatureDecl: Node): SignatureUsage[];
        gen(signatureDecl: Node): Generator<ProtocolRequest, SignatureUsage[], ProtocolResponse["result"]>;
    };
    get getCompletionsAtPosition(): {
        (document: string, position: number, options?: CompletionOptions): CompletionInfo | undefined;
        gen(document: string, position: number, options?: CompletionOptions): Generator<ProtocolRequest, CompletionInfo | undefined, ProtocolResponse["result"]>;
    };
}
export declare class Program<Id extends ProjectId = ProjectId> implements FormatDiagnosticsHost {
    /** @internal */
    readonly snapshotId: number;
    readonly id: Id;
    private readonly project;
    private readonly client;
    private readonly sourceFileCache;
    private readonly toPath;
    private readonly formatDiagnosticsHost;
    private readonly decoder;
    private readonly sourceFileMetadataCache;
    private ownedSnapshot;
    private disposePromise;
    constructor(snapshotId: number, project: Project<Id>, client: Client, sourceFileCache: SourceFileCache, toPath: (fileName: string) => Path, formatDiagnosticsHost: FormatDiagnosticsHost);
    getCurrentDirectory(): string;
    getCanonicalFileName(fileName: string): string;
    getNewLine(): string;
    /** @internal */
    setOwnedSnapshot(snapshot: Snapshot): void;
    [globalThis.Symbol.dispose](): void;
    get dispose(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    private get disposeWorker();
    getCompilerOptions(): CompilerOptions;
    get getSourceFile(): {
        (file: DocumentIdentifier): SourceFile | undefined;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, SourceFile | undefined, ProtocolResponse["result"]>;
    };
    get getResolvedModule(): {
        (file: DocumentIdentifier, moduleName: string, mode: ModuleKind): ResolvedModule | undefined;
        gen(file: DocumentIdentifier, moduleName: string, mode: ModuleKind): Generator<ProtocolRequest, ResolvedModule | undefined, ProtocolResponse["result"]>;
    };
    get getModeForUsageLocation(): {
        (file: DocumentIdentifier, usage: StringLiteralLikeNode): ModuleKind;
        gen(file: DocumentIdentifier, usage: StringLiteralLikeNode): Generator<ProtocolRequest, ModuleKind, ProtocolResponse["result"]>;
    };
    get getModeForResolutionAtIndex(): {
        (file: DocumentIdentifier, index: number): ModuleKind;
        gen(file: DocumentIdentifier, index: number): Generator<ProtocolRequest, ModuleKind, ProtocolResponse["result"]>;
    };
    get getResolvedModuleFromModuleSpecifier(): {
        (moduleSpecifier: StringLiteralLikeNode, sourceFile?: DocumentIdentifier): ResolvedModule | undefined;
        gen(moduleSpecifier: StringLiteralLikeNode, sourceFile?: DocumentIdentifier): Generator<ProtocolRequest, ResolvedModule | undefined, ProtocolResponse["result"]>;
    };
    get getResolvedTypeReferenceDirective(): {
        (file: DocumentIdentifier, typeDirectiveName: string, mode: ModuleKind): ResolvedTypeReferenceDirective | undefined;
        gen(file: DocumentIdentifier, typeDirectiveName: string, mode: ModuleKind): Generator<ProtocolRequest, ResolvedTypeReferenceDirective | undefined, ProtocolResponse["result"]>;
    };
    get getResolvedTypeReferenceDirectiveFromTypeReferenceDirective(): {
        (typeReferenceDirective: FileReference, sourceFile: DocumentIdentifier): ResolvedTypeReferenceDirective | undefined;
        gen(typeReferenceDirective: FileReference, sourceFile: DocumentIdentifier): Generator<ProtocolRequest, ResolvedTypeReferenceDirective | undefined, ProtocolResponse["result"]>;
    };
    get getSourceFileNames(): {
        (): readonly string[];
        gen(): Generator<ProtocolRequest, readonly string[], ProtocolResponse["result"]>;
    };
    /**
     * Every source file in the program.
     *
     * Each one is fetched and decoded on the way out, so a caller that only needs
     * the names should ask for {@link getSourceFileNames} instead.
     */
    get getSourceFiles(): {
        (): readonly SourceFile[];
        gen(): Generator<ProtocolRequest, readonly SourceFile[], ProtocolResponse["result"]>;
    };
    /** The checker for this program, which the project owns. */
    getTypeChecker(): Checker;
    /**
     * Returns program-stored metadata for the given source file, or `undefined` if the file
     * is not part of the program. Metadata is fetched lazily per file and cached on this
     * `Program` instance.
     */
    get getSourceFileMetadata(): {
        (file: DocumentIdentifier): SourceFileMetadata | undefined;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, SourceFileMetadata | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Returns program-stored metadata for the source file at the given path, or `undefined`
     * if the file is not part of the program. Like {@link getSourceFileMetadata}, but skips
     * the file name to path conversion. Metadata is fetched lazily per file and cached on
     * this `Program` instance.
     */
    get getSourceFileMetadataByPath(): {
        (path: Path): SourceFileMetadata | undefined;
        gen(path: Path): Generator<ProtocolRequest, SourceFileMetadata | undefined, ProtocolResponse["result"]>;
    };
    private get fetchSourceFileMetadata();
    /**
     * Returns whether the given source file was loaded as part of an external library
     * (e.g. a dependency resolved from `node_modules`). The underlying program metadata is
     * fetched lazily per file and cached on this `Program` instance.
     */
    get isSourceFileFromExternalLibrary(): {
        (file: SourceFile): boolean;
        gen(file: SourceFile): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * Returns whether the given source file is a default library file (e.g. `lib.d.ts`).
     * The underlying program metadata is fetched lazily per file and cached on this
     * `Program` instance.
     */
    get isSourceFileDefaultLibrary(): {
        (file: SourceFile): boolean;
        gen(file: SourceFile): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * Get all config source file names associated with this program's project config.
     * Includes the root config file and any extended config files.
     */
    get getConfigFileNames(): {
        (): readonly string[];
        gen(): Generator<ProtocolRequest, readonly string[], ProtocolResponse["result"]>;
    };
    /**
     * Get a config source file by file name/URI.
     * This can return the project's root tsconfig file or one of its extended config files.
     */
    get getConfigSourceFile(): {
        (file: DocumentIdentifier): SourceFile | undefined;
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, SourceFile | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get syntactic (parse) diagnostics for specific files or all files.
     * @param file - Optional file(s) to get diagnostics for. If omitted, returns diagnostics for all files.
     */
    get getSyntacticDiagnostics(): {
        (file?: DocumentIdentifier | readonly DocumentIdentifier[]): readonly Diagnostic[];
        gen(file?: DocumentIdentifier | readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get binder diagnostics for specific files or all files.
     * @param file - Optional file(s) to get diagnostics for. If omitted, returns diagnostics for all files.
     */
    get getBindDiagnostics(): {
        (file?: DocumentIdentifier | readonly DocumentIdentifier[]): readonly Diagnostic[];
        gen(file?: DocumentIdentifier | readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get semantic (type-check) diagnostics for specific files or all files.
     * @param file - Optional file(s) to get diagnostics for. If omitted, returns diagnostics for all files.
     */
    get getSemanticDiagnostics(): {
        (file?: DocumentIdentifier | readonly DocumentIdentifier[]): readonly Diagnostic[];
        gen(file?: DocumentIdentifier | readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get suggestion diagnostics for specific files or all files.
     * @param file - Optional file(s) to get diagnostics for. If omitted, returns diagnostics for all files.
     */
    get getSuggestionDiagnostics(): {
        (file?: DocumentIdentifier | readonly DocumentIdentifier[]): readonly Diagnostic[];
        gen(file?: DocumentIdentifier | readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get declaration emit diagnostics for specific files or all files.
     * @param file - Optional file(s) to get diagnostics for. If omitted, returns diagnostics for all files.
     */
    get getDeclarationDiagnostics(): {
        (file?: DocumentIdentifier | readonly DocumentIdentifier[]): readonly Diagnostic[];
        gen(file?: DocumentIdentifier | readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get program-wide diagnostics for the project, including compiler options diagnostics.
     */
    get getProgramDiagnostics(): {
        (): readonly Diagnostic[];
        gen(): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get global (non-file-specific) semantic diagnostics for the project.
     */
    get getGlobalDiagnostics(): {
        (): readonly Diagnostic[];
        gen(): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Get config file parsing diagnostics for the project.
     */
    get getConfigFileParsingDiagnostics(): {
        (): readonly Diagnostic[];
        gen(): Generator<ProtocolRequest, readonly Diagnostic[], ProtocolResponse["result"]>;
    };
    /**
     * Emits files to the configured filesystem. Layer and host filesystems are
     * written through; full filesystems remain immutable and return emitted
     * files in {@link EmitResult.fileSystem}.
     */
    get emit(): {
        (emitOnly?: EmitOnly): EmitResult;
        gen(emitOnly?: EmitOnly): Generator<ProtocolRequest, EmitResult, ProtocolResponse["result"]>;
    };
    /**
     * Emits files and returns their contents without writing to the filesystem.
     */
    get emitToString(): {
        (emitOnly?: EmitOnly): EmitOutput;
        gen(emitOnly?: EmitOnly): Generator<ProtocolRequest, EmitOutput, ProtocolResponse["result"]>;
    };
    /**
     * Gets JavaScript output for selected files regardless of project `noEmit`, `emitDeclarationOnly`, and `noEmitOnError` settings.
     */
    get getJavaScriptEmit(): {
        (files: readonly DocumentIdentifier[]): EmitOutput;
        gen(files: readonly DocumentIdentifier[]): Generator<ProtocolRequest, EmitOutput, ProtocolResponse["result"]>;
    };
    /**
     * Gets declaration output for selected files regardless of project `noEmit`, `declaration`, `emitDeclarationOnly`, and `noEmitOnError` settings.
     */
    get getDeclarationEmit(): {
        (files: readonly DocumentIdentifier[]): EmitOutput;
        gen(files: readonly DocumentIdentifier[]): Generator<ProtocolRequest, EmitOutput, ProtocolResponse["result"]>;
    };
    getProject(): Project<Id>;
}
export interface BuildOrchestratorOptions {
    cwd?: string | undefined;
    dry?: boolean;
    force?: boolean;
    verbose?: boolean;
    stopBuildOnErrors?: boolean;
    overrideCompilerOptions?: OverrideCompilerOptions;
}
export interface OverrideCompilerOptions {
    incremental?: boolean;
    assumeChangesOnlyAffectDirectDependencies?: boolean;
    declaration?: boolean;
    declarationMap?: boolean;
    emitDeclarationOnly?: boolean;
    sourceMap?: boolean;
    inlineSourceMap?: boolean;
    traceResolution?: boolean;
}
export declare class BuildOrchestrator {
    private client;
    private id;
    private disposed;
    private disposePromise;
    private onDispose;
    constructor(client: Client, orchestratorResponse: CreateBuildOrchestratorResponse, onDispose: () => void);
    [globalThis.Symbol.dispose](): void;
    get dispose(): {
        (): void;
        gen(): Generator<ProtocolRequest, void, ProtocolResponse["result"]>;
    };
    private get disposeWorker();
    get build(): {
        (project?: string): BuildResponse;
        gen(project?: string): Generator<ProtocolRequest, BuildResponse, ProtocolResponse["result"]>;
    };
    get buildReferences(): {
        (project: string): BuildResponse;
        gen(project: string): Generator<ProtocolRequest, BuildResponse, ProtocolResponse["result"]>;
    };
    get clean(): {
        (project?: string): CleanBuildResponse;
        gen(project?: string): Generator<ProtocolRequest, CleanBuildResponse, ProtocolResponse["result"]>;
    };
    get cleanReferences(): {
        (project?: string): CleanBuildResponse;
        gen(project?: string): Generator<ProtocolRequest, CleanBuildResponse, ProtocolResponse["result"]>;
    };
    isDisposed(): boolean;
    private ensureNotDisposed;
}
export declare class Checker {
    private snapshotId;
    private project;
    private client;
    private objectRegistry;
    private wellKnownSymbols;
    private wellKnownSignatures;
    constructor(snapshotId: number, project: Project, client: Client, objectRegistry: ProjectObjectRegistry);
    get getSymbolOfDeclaration(): {
        (node: Node): Symbol | undefined;
        gen(node: Node): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get symbolToString(): {
        (symbol: Symbol, enclosingDeclaration?: Node): string;
        gen(symbol: Symbol, enclosingDeclaration?: Node): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get getAmbientModules(): {
        (): readonly Symbol[];
        gen(): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getExportedSymbolsOfFiles(): {
        (files: readonly DocumentIdentifier[]): readonly (readonly ExportedSymbol[])[];
        gen(files: readonly DocumentIdentifier[]): Generator<ProtocolRequest, readonly (readonly ExportedSymbol[])[], ProtocolResponse["result"]>;
    };
    dispose(): void;
    get getSymbolAtLocation(): {
        (node: Node): Symbol | undefined;
        (nodes: readonly Node[]): (Symbol | undefined)[];
        gen(node: Node): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
        gen(nodes: readonly Node[]): Generator<ProtocolRequest, (Symbol | undefined)[], ProtocolResponse["result"]>;
    };
    get getSymbolAtPosition(): {
        (file: DocumentIdentifier, position: number): Symbol | undefined;
        (file: DocumentIdentifier, positions: readonly number[]): (Symbol | undefined)[];
        gen(file: DocumentIdentifier, position: number): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
        gen(file: DocumentIdentifier, positions: readonly number[]): Generator<ProtocolRequest, (Symbol | undefined)[], ProtocolResponse["result"]>;
    };
    get getSymbolOfSourceFile(): {
        (file: DocumentIdentifier): Symbol | undefined;
        (files: readonly DocumentIdentifier[]): (Symbol | undefined)[];
        gen(file: DocumentIdentifier): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
        gen(files: readonly DocumentIdentifier[]): Generator<ProtocolRequest, (Symbol | undefined)[], ProtocolResponse["result"]>;
    };
    /**
     * Get the type of a symbol. Always returns a type; for symbols whose type
     * cannot be determined the checker yields the error type (use
     * {@link Type.isErrorType} to detect it).
     */
    get getTypeOfSymbol(): {
        (symbol: Symbol): Type;
        (symbols: readonly Symbol[]): Type[];
        gen(symbol: Symbol): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
        gen(symbols: readonly Symbol[]): Generator<ProtocolRequest, Type[], ProtocolResponse["result"]>;
    };
    /**
     * Get the declared type of a symbol. Always returns a type; for symbols whose
     * declared type cannot be determined the checker yields the error type (use
     * {@link Type.isErrorType} to detect it).
     */
    get getDeclaredTypeOfSymbol(): {
        (symbol: Symbol): Type;
        gen(symbol: Symbol): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /**
     * Get the type of a symbol, excluding the missing type when
     * `exactOptionalPropertyTypes: true` is set; for symbols whose
     * type cannot be determined the checker yields the error type
     * (use {@link Type.isErrorType} to detect it).
     */
    get getNonMissingTypeOfSymbol(): {
        (symbol: Symbol): Type;
        gen(symbol: Symbol): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getReferencesToSymbolInFile(): {
        (file: DocumentIdentifier, symbol: Symbol): NodeHandle[];
        gen(file: DocumentIdentifier, symbol: Symbol): Generator<ProtocolRequest, NodeHandle[], ProtocolResponse["result"]>;
    };
    /** @deprecated Use `project.languageService.getReferencedSymbolsForNode`. */
    get getReferencedSymbolsForNode(): {
        (node: Node, position: number): ReferencedSymbolEntry[];
        gen(node: Node, position: number): Generator<ProtocolRequest, ReferencedSymbolEntry[], ProtocolResponse["result"]>;
    };
    /** @deprecated Use `project.languageService.getSignatureUsage`. */
    get getSignatureUsage(): {
        (signatureDecl: Node): SignatureUsage[];
        gen(signatureDecl: Node): Generator<ProtocolRequest, SignatureUsage[], ProtocolResponse["result"]>;
    };
    /** @deprecated Use `project.languageService.getCompletionsAtPosition`. */
    get getCompletionsAtPosition(): {
        (document: string, position: number, options?: CompletionOptions): CompletionInfo | undefined;
        gen(document: string, position: number, options?: CompletionOptions): Generator<ProtocolRequest, CompletionInfo | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the type at a node location. Always returns a type; for nodes whose
     * type cannot be determined the checker yields the error type (use
     * {@link Type.isErrorType} to detect it).
     */
    get getTypeAtLocation(): {
        (node: Node): Type;
        (nodes: readonly Node[]): Type[];
        gen(node: Node): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
        gen(nodes: readonly Node[]): Generator<ProtocolRequest, Type[], ProtocolResponse["result"]>;
    };
    get getSignaturesOfType(): {
        (type: Type, kind: SignatureKind): readonly Signature[];
        gen(type: Type, kind: SignatureKind): Generator<ProtocolRequest, readonly Signature[], ProtocolResponse["result"]>;
    };
    /**
     * Get the resolved signature of a call-like expression. Always returns a
     * signature; when a call cannot be resolved the checker yields the unknown
     * signature (use {@link Checker.isUnknownSignature} to detect it).
     */
    get getResolvedSignature(): {
        (node: Node): Signature;
        gen(node: Node): Generator<ProtocolRequest, Signature, ProtocolResponse["result"]>;
    };
    get getTypeAtPosition(): {
        (file: DocumentIdentifier, position: number): Type | undefined;
        (file: DocumentIdentifier, positions: readonly number[]): (Type | undefined)[];
        gen(file: DocumentIdentifier, position: number): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
        gen(file: DocumentIdentifier, positions: readonly number[]): Generator<ProtocolRequest, (Type | undefined)[], ProtocolResponse["result"]>;
    };
    get resolveName(): {
        (name: string, meaning: SymbolFlags, location?: Node | DocumentPosition, excludeGlobals?: boolean): Symbol | undefined;
        gen(name: string, meaning: SymbolFlags, location?: Node | DocumentPosition, excludeGlobals?: boolean): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Returns all symbols with the given meaning that are visible at `location`.
     */
    get getSymbolsInScope(): {
        (location: Node | DocumentPosition, meaning: SymbolFlags): readonly Symbol[];
        gen(location: Node | DocumentPosition, meaning: SymbolFlags): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getResolvedSymbol(): {
        (node: Identifier): Symbol | undefined;
        gen(node: Identifier): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getContextualType(): {
        (node: Expression): Type | undefined;
        gen(node: Expression): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getContextualTypeForArgumentAtIndex(): {
        (node: CallLikeExpression, argIndex: number): Type | undefined;
        gen(node: CallLikeExpression, argIndex: number): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    /** Get the base type of a literal type (e.g. `number` for `42`). Always returns a type. */
    get getBaseTypeOfLiteralType(): {
        (type: Type): Type;
        gen(type: Type): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /** Get the type with `null` and `undefined` removed. Always returns a type. */
    get getNonNullableType(): {
        (type: Type): Type;
        gen(type: Type): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /**
     * Get the type for a type node. Always returns a type; for type nodes whose
     * type cannot be determined the checker yields the error type (use
     * {@link Type.isErrorType} to detect it).
     */
    get getTypeFromTypeNode(): {
        (node: TypeNode): Type;
        gen(node: TypeNode): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /** Get the widened type. Always returns a type. */
    get getWidenedType(): {
        (type: Type): Type;
        gen(type: Type): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /**
     * Get the type of the parameter at the given index in a signature. Always
     * returns a type; an out-of-range index yields the `any` type.
     */
    get getParameterType(): {
        (signature: Signature, index: number): Type;
        gen(signature: Signature, index: number): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get isArrayLikeType(): {
        (type: Type): boolean;
        gen(type: Type): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get isTypeAssignableTo(): {
        (source: Type, target: Type): boolean;
        gen(source: Type, target: Type): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get getShorthandAssignmentValueSymbol(): {
        (node: Node): Symbol | undefined;
        gen(node: Node): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the type of a symbol as narrowed at a specific location. Always returns
     * a type; for symbols whose type cannot be determined the checker yields the
     * error type (use {@link Type.isErrorType} to detect it).
     */
    get getTypeOfSymbolAtLocation(): {
        (symbol: Symbol, location: Node): Type;
        gen(symbol: Symbol, location: Node): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    private get getIntrinsicType();
    get getAnyType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getStringType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getNumberType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getBooleanType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getVoidType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getUndefinedType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getNullType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getNeverType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getUnknownType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getBigIntType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getESSymbolType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getNonPrimitiveType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get typeToTypeNode(): {
        (type: Type, enclosingDeclaration?: Node, flags?: number): TypeNode | undefined;
        gen(type: Type, enclosingDeclaration?: Node, flags?: number): Generator<ProtocolRequest, TypeNode | undefined, ProtocolResponse["result"]>;
    };
    get signatureToSignatureDeclaration(): {
        (signature: Signature, kind: SyntaxKind, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): Node | undefined;
        gen(signature: Signature, kind: SyntaxKind, enclosingDeclaration?: Node, flags?: NodeBuilderFlags): Generator<ProtocolRequest, Node | undefined, ProtocolResponse["result"]>;
    };
    get typeToString(): {
        (type: Type, enclosingDeclaration?: Node, flags?: TypeFormatFlags): string;
        gen(type: Type, enclosingDeclaration?: Node, flags?: TypeFormatFlags): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get isContextSensitive(): {
        (node: Node): boolean;
        gen(node: Node): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get isArrayType(): {
        (type: Type): boolean;
        gen(type: Type): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get isTupleType(): {
        (type: Type): boolean;
        gen(type: Type): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get isTupleTypeTarget(): {
        (type: Type): boolean;
        gen(type: Type): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * The following symbols are considered read-only:
     * - Properties with a `readonly` modifier
     * - Variables declared with `const`
     * - Get accessors without matching set accessors
     * - Enum members
     * - `Object.defineProperty` assignments with `writable: false` or no setter
     * - Unions and intersections of the above
     */
    get isReadonlySymbol(): {
        (symbol: Symbol): boolean;
        gen(symbol: Symbol): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /** Get the return type of a signature. Always returns a type. */
    get getReturnTypeOfSignature(): {
        (signature: Signature): Type;
        gen(signature: Signature): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /**
     * Get the rest type of a signature. Always returns a type; a signature with
     * no rest parameter yields the `any` type.
     */
    get getRestTypeOfSignature(): {
        (signature: Signature): Type;
        gen(signature: Signature): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getTypePredicateOfSignature(): {
        (signature: Signature): TypePredicate | undefined;
        gen(signature: Signature): Generator<ProtocolRequest, TypePredicate | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the base types of a class or interface type. A type with no base types
     * yields an empty array.
     */
    get getBaseTypes(): {
        (type: InterfaceType): readonly Type[];
        gen(type: InterfaceType): Generator<ProtocolRequest, readonly Type[], ProtocolResponse["result"]>;
    };
    /** Get the apparent type of a type. Always returns a type. */
    get getApparentType(): {
        (type: Type): Type;
        gen(type: Type): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /** Get the reduced type of a type. Always returns a type. */
    get getReducedType(): {
        (type: Type): Type;
        gen(type: Type): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getPropertiesOfType(): {
        (type: Type): readonly Symbol[];
        gen(type: Type): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getIndexInfosOfType(): {
        (type: Type): readonly IndexInfo[];
        gen(type: Type): Generator<ProtocolRequest, readonly IndexInfo[], ProtocolResponse["result"]>;
    };
    get getIndexInfoOfType(): {
        (type: Type, kind: IndexKind): IndexInfo | undefined;
        gen(type: Type, kind: IndexKind): Generator<ProtocolRequest, IndexInfo | undefined, ProtocolResponse["result"]>;
    };
    get getIndexTypeOfType(): {
        (type: Type, kind: IndexKind): Type | undefined;
        gen(type: Type, kind: IndexKind): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getTypeOfPropertyOfType(): {
        (type: Type, propertyName: string): Type | undefined;
        gen(type: Type, propertyName: string): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the constraint of a type parameter (the `T` in `<U extends T>`), or
     * undefined if it has none.
     */
    get getConstraintOfTypeParameter(): {
        (type: TypeParameter): Type | undefined;
        gen(type: TypeParameter): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getDefaultFromTypeParameter(): {
        (type: TypeParameter): Type | undefined;
        gen(type: TypeParameter): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getBaseConstraintOfType(): {
        (type: Type): Type | undefined;
        gen(type: Type): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getPropertyOfType(): {
        (type: Type, name: string): Symbol | undefined;
        gen(type: Type, name: string): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getConstantValue(): {
        (node: Node): string | number | undefined;
        gen(node: Node): Generator<ProtocolRequest, string | number | undefined, ProtocolResponse["result"]>;
    };
    /** Get the signature of a function-like declaration. Always returns a signature. */
    get getSignatureFromDeclaration(): {
        (node: Node): Signature;
        gen(node: Node): Generator<ProtocolRequest, Signature, ProtocolResponse["result"]>;
    };
    get getExportSpecifierLocalTargetSymbol(): {
        (node: Node): Symbol | undefined;
        gen(node: Node): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Follow all aliases to get the original symbol. Always returns a symbol; for
     * an unresolved alias the checker yields the unknown symbol (use
     * {@link Checker.isUnknownSymbol} to detect it).
     */
    get getAliasedSymbol(): {
        (symbol: Symbol): Symbol;
        gen(symbol: Symbol): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    /**
     * Get the fully qualified name of a symbol, walking up its parent chain
     * (e.g. `"/path/to/module".Namespace.Name`).
     */
    get getFullyQualifiedName(): {
        (symbol: Symbol): string;
        gen(symbol: Symbol): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get getImmediateAliasedSymbol(): {
        (symbol: Symbol): Symbol | undefined;
        gen(symbol: Symbol): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the target symbol if instantiated, or the provided symbol otherwise.
     */
    get getTargetSymbol(): {
        (symbol: Symbol): Symbol;
        gen(symbol: Symbol): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    get getExportSymbolOfSymbol(): {
        (symbol: Symbol): Symbol;
        gen(symbol: Symbol): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    /**
     * Fetch (once, then cache) the handle ids of the per-checker singleton
     * symbols (unknown, undefined, arguments). These ids are stable for the life
     * of the project's checker, so identity checks against them are local after
     * the first call.
     */
    private get getWellKnownSymbols();
    /**
     * Returns `true` if the symbol is the checker's "unknown" symbol (e.g. the
     * result of {@link Checker.getAliasedSymbol} on an unresolved alias).
     */
    get isUnknownSymbol(): {
        (symbol: Symbol): boolean;
        gen(symbol: Symbol): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * Returns `true` if the symbol is the checker's "undefined" symbol.
     */
    get isUndefinedSymbol(): {
        (symbol: Symbol): boolean;
        gen(symbol: Symbol): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * Returns `true` if the symbol is the checker's "arguments" symbol.
     */
    get isArgumentsSymbol(): {
        (symbol: Symbol): boolean;
        gen(symbol: Symbol): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    /**
     * Fetch (once, then cache) the handle id of the per-checker unknown
     * signature. This id is stable for the life of the project's checker, so
     * identity checks against it are local after the first call.
     */
    private get getWellKnownSignatures();
    /**
     * Returns `true` if the signature is the checker's "unknown" signature (e.g.
     * the result of {@link Checker.getResolvedSignature} on a call that cannot be
     * resolved).
     */
    get isUnknownSignature(): {
        (signature: Signature): boolean;
        gen(signature: Signature): Generator<ProtocolRequest, boolean, ProtocolResponse["result"]>;
    };
    get getExportsOfModule(): {
        (symbol: Symbol): readonly Symbol[];
        gen(symbol: Symbol): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getMemberInModuleExports(): {
        (symbol: Symbol, name: string): Symbol | undefined;
        gen(symbol: Symbol, name: string): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getJsDocTagsOfSymbol(): {
        (symbol: Symbol): readonly JSDocTagInfo[];
        gen(symbol: Symbol): Generator<ProtocolRequest, readonly JSDocTagInfo[], ProtocolResponse["result"]>;
    };
    get getDocumentationCommentOfSymbol(): {
        (symbol: Symbol): string;
        gen(symbol: Symbol): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get getJsDocTagsOfSignature(): {
        (signature: Signature): readonly JSDocTagInfo[];
        gen(signature: Signature): Generator<ProtocolRequest, readonly JSDocTagInfo[], ProtocolResponse["result"]>;
    };
    get getDocumentationCommentOfSignature(): {
        (signature: Signature): string;
        gen(signature: Signature): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    /**
     * Returns the symbols the binder placed in the node's own local scope, in declaration
     * order. Nodes that do not hold locals return an empty array.
     */
    get getLocals(): {
        (node: Node): readonly Symbol[];
        gen(node: Node): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    /**
     * Returns the type a value of the given type resolves to when awaited, or undefined
     * when the type cannot be awaited.
     */
    get getAwaitedType(): {
        (type: Type): Type | undefined;
        gen(type: Type): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get the type arguments of a type reference (e.g. the `string` in `Array<string>`).
     */
    get getTypeArguments(): {
        (type: TypeReference): readonly Type[];
        gen(type: TypeReference): Generator<ProtocolRequest, readonly Type[], ProtocolResponse["result"]>;
    };
}
export interface PrintNodeOptions {
    /**
     * Text of the file the node was parsed from. The printer reads comments and
     * original token text out of it, so a node printed without it prints without
     * its comments.
     */
    sourceText?: string | undefined;
    /** Names the script kind `sourceText` is parsed as. */
    fileName?: string | undefined;
    preserveSourceNewlines?: boolean | undefined;
    neverAsciiEscape?: boolean | undefined;
    terminateUnterminatedLiterals?: boolean | undefined;
    /** Whether the printer leaves the node's comments out. */
    removeComments?: boolean | undefined;
    /**
     * The line break the printer writes, as a `NewLineKind`: 1 for CRLF, 2 for LF.
     * Defaults to LF. Only the breaks the printer emits are affected, so a line
     * break inside a template literal keeps whatever the source gave it.
     */
    newLine?: number | undefined;
}
export declare class Printer {
    private client;
    constructor(client: Client);
    get printNode(): {
        (node: Node, options?: PrintNodeOptions): string;
        gen(node: Node, options?: PrintNodeOptions): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
    get printFile(): {
        (sourceFile: SourceFile, options?: PrintNodeOptions): string;
        gen(sourceFile: SourceFile, options?: PrintNodeOptions): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
}
export declare class SnapshotInternalAPI {
    private snapshotId;
    private client;
    constructor(snapshotId: number, client: Client);
    /**
     * Format a synthesized node with the correct indentation for insertion at a
     * specific position in an existing source file.
     *
     * @param node The synthesized AST node to format.
     * @param file The target file where the node will be inserted.
     * @param position The UTF-16 code-unit offset in the target file for insertion.
     * @returns The formatted text of the node, indented for the insertion position.
     */
    get formatNodeForInsertion(): {
        (node: Node, file: DocumentIdentifier, position: number): string;
        gen(node: Node, file: DocumentIdentifier, position: number): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
}
export declare class NodeHandle<out T extends Node = Node> {
    /**
     * The project this handle was produced in, used as the default for {@link resolve}.
     * Node handles are only meaningful within a project's program, so the producing project
     * is remembered so callers don't have to pass it explicitly.
     */
    private readonly canonicalProject;
    readonly index: number;
    readonly kind: SyntaxKind;
    readonly path: Path;
    constructor(handle: string, canonicalProject: Project);
    /**
     * Resolve this handle to the actual AST node by fetching the source file from a project
     * and looking up the node by index. If no project is passed, the project that produced
     * the handle is used.
     */
    get resolve(): {
        (project?: Project): T | undefined;
        gen(project?: Project): Generator<ProtocolRequest, T | undefined, ProtocolResponse["result"]>;
    };
}
/** A symbol definition paired with all of its reference nodes. */
export interface ReferencedSymbolEntry {
    /** The node handle for the symbol's definition. */
    definition: NodeHandle;
    /** The resolved symbol for the definition, if available. */
    symbol?: Symbol | undefined;
    /** The node handles for each reference to the symbol. */
    references: NodeHandle[];
    /**
     * The classified pieces of the definition's display text, e.g. `function`,
     * ` `, `myFunction`, `(`, `)`, `:`, ` `, `void`. Empty when the definition
     * resolved to no symbol.
     */
    displayParts: DisplayPart[];
    /**
     * For the reference at the same position in {@link references}, whether it
     * writes the symbol rather than reads it.
     */
    writeAccess: boolean[];
}
/** One classified piece of a symbol's display text. */
export interface DisplayPart {
    text: string;
    kind: string;
}
/** A single usage of a signature, pairing the reference name with its call expression (if any). */
export interface SignatureUsage {
    /** The node handle for the name reference. */
    name: NodeHandle;
    /** The node handle for the call expression, if the reference is invoked. */
    call?: NodeHandle | undefined;
}
export declare class Symbol {
    private objectRegistry;
    /**
     * The project this symbol was first observed in, used as the default project for
     * lookups that need a project context (members/exports/parent). Symbols are shared
     * snapshot-wide, so these lookups can otherwise be ambiguous about which project to use.
     */
    private readonly canonicalProject;
    readonly id: number;
    /** The escaped (`__String`) name, used as the key in member/export tables. */
    readonly escapedName: __String;
    /** The display name (escaped underscores removed). */
    readonly name: string;
    readonly flags: SymbolFlags;
    readonly checkFlags: CheckFlags;
    readonly declarations: readonly NodeHandle<Declaration>[];
    readonly valueDeclaration: NodeHandle<Declaration> | undefined;
    private readonly parent;
    private readonly exportSymbol;
    private membersCache;
    private exportsCache;
    private globalExportsCache;
    constructor(data: SymbolResponse, objectRegistry: SnapshotObjectRegistry);
    get getParent(): {
        (): Symbol | undefined;
        gen(): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    /**
     * Get this symbol's members keyed by escaped name. The result is cached on
     * the symbol, so repeated calls do not round-trip to the server.
     */
    get getMembers(): {
        (): ReadonlyMap<__String, Symbol>;
        gen(): Generator<ProtocolRequest, ReadonlyMap<__String, Symbol>, ProtocolResponse["result"]>;
    };
    /**
     * Get this symbol's exports keyed by escaped name. The result is cached on
     * the symbol, so repeated calls do not round-trip to the server.
     */
    get getExports(): {
        (): ReadonlyMap<__String, Symbol>;
        gen(): Generator<ProtocolRequest, ReadonlyMap<__String, Symbol>, ProtocolResponse["result"]>;
    };
    /**
     * Get the UMD global exports this module symbol declares with `export as namespace X`,
     * keyed by escaped name. The result is cached on the symbol.
     */
    get getGlobalExports(): {
        (): ReadonlyMap<__String, Symbol>;
        gen(): Generator<ProtocolRequest, ReadonlyMap<__String, Symbol>, ProtocolResponse["result"]>;
    };
    private get fetchSymbolTable();
    get getExportSymbol(): {
        (): Symbol;
        gen(): Generator<ProtocolRequest, Symbol, ProtocolResponse["result"]>;
    };
    get getJsDocTags(): {
        (checker: Checker): readonly JSDocTagInfo[];
        gen(checker: Checker): Generator<ProtocolRequest, readonly JSDocTagInfo[], ProtocolResponse["result"]>;
    };
    get getDocumentationComment(): {
        (checker: Checker): string;
        gen(checker: Checker): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
}
declare class TypeObject implements Type {
    private objectRegistry;
    readonly id: number;
    readonly flags: TypeFlags;
    readonly objectFlags: ObjectFlags;
    readonly symbol: number;
    readonly value: string | number | boolean | bigint;
    readonly intrinsicName: string;
    readonly isThisType: boolean;
    readonly freshType: number;
    readonly regularType: number;
    readonly target: number;
    private readonly tupleType;
    readonly typeParameters: readonly number[];
    readonly outerTypeParameters: readonly number[];
    readonly localTypeParameters: readonly number[];
    readonly thisType: number;
    readonly aliasTypeArguments: readonly number[];
    readonly aliasSymbol: number;
    readonly elementFlags: readonly ElementFlags[];
    readonly fixedLength: number;
    readonly readonly: boolean;
    readonly labeledElementDeclarations?: readonly (NodeHandle<NamedTupleMember | ParameterDeclaration> | undefined)[];
    readonly texts: readonly string[];
    readonly objectType: number;
    readonly indexType: number;
    readonly checkType: number;
    readonly extendsType: number;
    readonly baseType: number;
    readonly substConstraint: number;
    readonly typeParameter: number;
    readonly constraintType: number;
    readonly nameType: number;
    readonly templateType: number;
    private trueType;
    private falseType;
    private constraint;
    private default;
    private nonNullableType;
    private apparentType;
    private reducedType;
    private properties;
    private apparentProperties;
    private callSignatures;
    private constructSignatures;
    private indexInfos;
    private baseTypes;
    private types;
    private stringIndexType;
    private numberIndexType;
    constructor(data: TypeResponse, objectRegistry: ProjectObjectRegistry);
    get getSymbol(): {
        (): Symbol | undefined;
        gen(): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getProperties(): {
        (): readonly Symbol[];
        gen(): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getProperty(): {
        (propertyName: string): Symbol | undefined;
        gen(propertyName: string): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getApparentProperties(): {
        (): readonly Symbol[];
        gen(): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getCallSignatures(): {
        (): readonly Signature[];
        gen(): Generator<ProtocolRequest, readonly Signature[], ProtocolResponse["result"]>;
    };
    get getConstructSignatures(): {
        (): readonly Signature[];
        gen(): Generator<ProtocolRequest, readonly Signature[], ProtocolResponse["result"]>;
    };
    get getNonNullableType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getStringIndexType(): {
        (): Type | undefined;
        gen(): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    private get getStringIndexTypeWorker();
    get getNumberIndexType(): {
        (): Type | undefined;
        gen(): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    private get getNumberIndexTypeWorker();
    get getApparentType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getReducedType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getIndexInfos(): {
        (): readonly IndexInfo[];
        gen(): Generator<ProtocolRequest, readonly IndexInfo[], ProtocolResponse["result"]>;
    };
    get getAliasSymbol(): {
        (): Symbol | undefined;
        gen(): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getTarget(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getFreshType(): {
        (): FreshableType | undefined;
        gen(): Generator<ProtocolRequest, FreshableType | undefined, ProtocolResponse["result"]>;
    };
    get getRegularType(): {
        (): FreshableType | undefined;
        gen(): Generator<ProtocolRequest, FreshableType | undefined, ProtocolResponse["result"]>;
    };
    get getTypes(): {
        (): readonly Type[] | undefined;
        gen(): Generator<ProtocolRequest, readonly Type[] | undefined, ProtocolResponse["result"]>;
    };
    get getTypeParameters(): {
        (): readonly TypeParameter[];
        gen(): Generator<ProtocolRequest, readonly TypeParameter[], ProtocolResponse["result"]>;
    };
    get getOuterTypeParameters(): {
        (): readonly TypeParameter[];
        gen(): Generator<ProtocolRequest, readonly TypeParameter[], ProtocolResponse["result"]>;
    };
    get getLocalTypeParameters(): {
        (): readonly TypeParameter[];
        gen(): Generator<ProtocolRequest, readonly TypeParameter[], ProtocolResponse["result"]>;
    };
    get getThisType(): {
        (): TypeParameter | undefined;
        gen(): Generator<ProtocolRequest, TypeParameter | undefined, ProtocolResponse["result"]>;
    };
    get getAliasTypeArguments(): {
        (): readonly Type[];
        gen(): Generator<ProtocolRequest, readonly Type[], ProtocolResponse["result"]>;
    };
    get getTypeParameter(): {
        (): TypeParameter;
        gen(): Generator<ProtocolRequest, TypeParameter, ProtocolResponse["result"]>;
    };
    get getConstraintType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getNameType(): {
        (): Type | undefined;
        gen(): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getTemplateType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getObjectType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getIndexType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getCheckType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getExtendsType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getBaseType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getConstraint(): {
        (): Type | undefined;
        gen(): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getDefault(): {
        (): Type | undefined;
        gen(): Generator<ProtocolRequest, Type | undefined, ProtocolResponse["result"]>;
    };
    get getTrueType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getFalseType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    /**
     * Get the base types of this type. Returns `undefined` for any type that is
     * not a class or interface.
     */
    get getBaseTypes(): {
        (): readonly Type[] | undefined;
        gen(): Generator<ProtocolRequest, readonly Type[] | undefined, ProtocolResponse["result"]>;
    };
    isClassOrInterface(): this is InterfaceType;
    isUnionType(): this is UnionType;
    isIntersectionType(): this is IntersectionType;
    isObjectType(): this is ObjectType;
    isIntrinsicType(): this is IntrinsicType;
    isErrorType(): boolean;
    isLiteralType(): this is LiteralType;
    isStringLiteralType(): this is StringLiteralType;
    isNumberLiteralType(): this is NumberLiteralType;
    isBigIntLiteralType(): this is BigIntLiteralType;
    isBooleanLiteralType(): this is BooleanLiteralType;
    isTypeReference(): this is TypeReference;
    isTupleType(): this is TupleTypeReference;
    isTupleTypeTarget(): this is TupleType;
    isIndexType(): this is IndexType;
    isIndexedAccessType(): this is IndexedAccessType;
    isConditionalType(): this is ConditionalType;
    isSubstitutionType(): this is SubstitutionType;
    isTemplateLiteralType(): this is TemplateLiteralType;
    isStringMappingType(): this is StringMappingType;
    isTypeParameter(): this is TypeParameter;
    isMappedType(): this is MappedType;
}
export declare function isUnionType(type: Type): type is UnionType;
export declare function isIntersectionType(type: Type): type is IntersectionType;
export declare function isObjectType(type: Type): type is ObjectType;
export declare function isClassOrInterfaceType(type: Type): type is InterfaceType;
export declare function isIntrinsicType(type: Type): type is IntrinsicType;
/**
 * Whether this is the error type — the placeholder the checker produces when a
 * type cannot be determined (e.g. an unresolved reference). It is an intrinsic
 * type named `"error"` (this covers both the singleton error type and the
 * per-alias error types manufactured for unresolved type alias references).
 */
export declare function isErrorType(type: Type): boolean;
export declare function isLiteralType(type: Type): type is LiteralType;
export declare function isStringLiteralType(type: Type): type is StringLiteralType;
export declare function isNumberLiteralType(type: Type): type is NumberLiteralType;
export declare function isBigIntLiteralType(type: Type): type is BigIntLiteralType;
export declare function isBooleanLiteralType(type: Type): type is BooleanLiteralType;
export declare function isTypeReference(type: Type): type is TypeReference;
export declare function isTupleType(type: Type): type is TupleTypeReference;
export declare function isTupleTypeTarget(type: Type): type is TupleType;
export declare function isIndexType(type: Type): type is IndexType;
export declare function isIndexedAccessType(type: Type): type is IndexedAccessType;
export declare function isConditionalType(type: Type): type is ConditionalType;
export declare function isSubstitutionType(type: Type): type is SubstitutionType;
export declare function isTemplateLiteralType(type: Type): type is TemplateLiteralType;
export declare function isStringMappingType(type: Type): type is StringMappingType;
export declare function isTypeParameter(type: Type): type is TypeParameter;
export declare class Signature {
    private flags;
    private objectRegistry;
    readonly id: number;
    readonly declaration?: NodeHandle<Declaration> | undefined;
    readonly typeParameters?: readonly number[] | undefined;
    readonly parameters: readonly number[];
    readonly thisParameter?: number | undefined;
    readonly target?: number | undefined;
    private returnType;
    constructor(data: SignatureResponse, project: Project, objectRegistry: ProjectObjectRegistry);
    get getTypeParameters(): {
        (): readonly TypeParameter[];
        gen(): Generator<ProtocolRequest, readonly TypeParameter[], ProtocolResponse["result"]>;
    };
    get getParameters(): {
        (): readonly Symbol[];
        gen(): Generator<ProtocolRequest, readonly Symbol[], ProtocolResponse["result"]>;
    };
    get getThisParameter(): {
        (): Symbol | undefined;
        gen(): Generator<ProtocolRequest, Symbol | undefined, ProtocolResponse["result"]>;
    };
    get getTarget(): {
        (): Signature | undefined;
        gen(): Generator<ProtocolRequest, Signature | undefined, ProtocolResponse["result"]>;
    };
    get getReturnType(): {
        (): Type;
        gen(): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get getTypeParameterAtPosition(): {
        (pos: number): Type;
        gen(pos: number): Generator<ProtocolRequest, Type, ProtocolResponse["result"]>;
    };
    get hasRestParameter(): boolean;
    get isConstruct(): boolean;
    get isAbstract(): boolean;
    get getJsDocTags(): {
        (checker: Checker): readonly JSDocTagInfo[];
        gen(checker: Checker): Generator<ProtocolRequest, readonly JSDocTagInfo[], ProtocolResponse["result"]>;
    };
    get getDocumentationComment(): {
        (checker: Checker): string;
        gen(checker: Checker): Generator<ProtocolRequest, string, ProtocolResponse["result"]>;
    };
}
export interface ExportedSymbol {
    readonly name: string;
    readonly escapedName: __String;
    readonly declarations: readonly NodeHandle[];
}
