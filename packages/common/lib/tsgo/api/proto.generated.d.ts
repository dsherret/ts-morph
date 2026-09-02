import type { JsxEmit } from "../enums/jsxEmit.enum";
import type { ModuleDetectionKind } from "../enums/moduleDetectionKind.enum";
import type { ModuleKind } from "../enums/moduleKind.enum";
import type { ModuleResolutionKind } from "../enums/moduleResolutionKind.enum";
import type { NewLineKind } from "../enums/newLineKind.enum";
import type { ScriptTarget } from "../enums/scriptTarget.enum";
export type APIMethod<TParams, TResult> = {
    params: TParams;
    result: TResult;
};
export interface APIMethodInfo {
    release: APIMethod<ReleaseParams, void>;
    initialize: APIMethod<null, InitializeResponse>;
    updateSnapshot: APIMethod<UpdateSnapshotParams, UpdateSnapshotResponse>;
    updateTemporarySnapshot: APIMethod<UpdateTemporarySnapshotParams, UpdateSnapshotResponse>;
    parseCommandLine: APIMethod<ParseCommandLineParams, ConfigFileResponse>;
    readConfigFile: APIMethod<ReadConfigFileParams, ReadConfigFileResponse>;
    parseJsonConfigFileContent: APIMethod<ParseJsonConfigFileContentParams, ConfigFileResponse>;
    parseConfigFile: APIMethod<ParseConfigFileParams, ConfigFileResponse>;
    transpileModule: APIMethod<TranspileParams, TranspileOutputResponse>;
    transpileModuleFromFile: APIMethod<TranspileFromFileParams, TranspileOutputResponse>;
    transpileDeclaration: APIMethod<TranspileParams, TranspileOutputResponse>;
    transpileDeclarationFromFile: APIMethod<TranspileFromFileParams, TranspileOutputResponse>;
    getDefaultProjectForFile: APIMethod<GetDefaultProjectForFileParams, ProjectResponse | null>;
    getSymbolAtPosition: APIMethod<GetSymbolAtPositionParams, SymbolResponse | null>;
    getSymbolsAtPositions: APIMethod<GetSymbolsAtPositionsParams, SymbolResponse[]>;
    getSymbolAtLocation: APIMethod<GetSymbolAtLocationParams, SymbolResponse | null>;
    getSymbolsAtLocations: APIMethod<GetSymbolsAtLocationsParams, SymbolResponse[]>;
    getSymbolOfSourceFile: APIMethod<GetSymbolOfSourceFileParams, SymbolResponse | null>;
    getSymbolsOfSourceFiles: APIMethod<GetSymbolsOfSourceFilesParams, SymbolResponse[]>;
    getTypeOfSymbol: APIMethod<GetTypeOfSymbolParams, TypeResponse>;
    getTypesOfSymbols: APIMethod<GetTypesOfSymbolsParams, TypeResponse[]>;
    getDeclaredTypeOfSymbol: APIMethod<GetTypeOfSymbolParams, TypeResponse>;
    getSourceFile: APIMethod<GetSourceFileParams, SourceFileResponse | null>;
    getSourceFileIdentity: APIMethod<GetSourceFileParams, SourceFileIdentity | null>;
    getSourceFileNames: APIMethod<GetSourceFileNamesParams, string[]>;
    getSourceFileMetadata: APIMethod<GetSourceFileParams, SourceFileMetadata | null>;
    getConfigFileNames: APIMethod<GetProjectDiagnosticsParams, string[] | null>;
    getProjectRootFiles: APIMethod<GetProjectDiagnosticsParams, string[] | null>;
    getConfigSourceFile: APIMethod<GetSourceFileParams, SourceFileResponse | null>;
    resolveName: APIMethod<ResolveNameParams, SymbolResponse | null>;
    getSymbolsInScope: APIMethod<GetSymbolsInScopeParams, SymbolResponse[]>;
    getSignaturesOfType: APIMethod<GetSignaturesOfTypeParams, SignatureResponse[]>;
    getResolvedSignature: APIMethod<GetResolvedSignatureParams, SignatureResponse>;
    getTypeAtLocation: APIMethod<GetTypeAtLocationParams, TypeResponse>;
    getTypeAtLocations: APIMethod<GetTypeAtLocationsParams, TypeResponse[]>;
    getTypeAtPosition: APIMethod<GetTypeAtPositionParams, TypeResponse | null>;
    getTypesAtPositions: APIMethod<GetTypesAtPositionsParams, TypeResponse[]>;
    getParentOfSymbol: APIMethod<GetSymbolPropertyParams, SymbolResponse | null>;
    getMembersOfSymbol: APIMethod<GetSymbolPropertyParams, SymbolResponse[] | null>;
    getExportsOfSymbol: APIMethod<GetSymbolPropertyParams, SymbolResponse[] | null>;
    getExportSymbolOfSymbol: APIMethod<GetSymbolPropertyParams, SymbolResponse | null>;
    getGlobalExportsOfSymbol: APIMethod<GetSymbolPropertyParams, SymbolResponse[] | null>;
    getSymbolOfType: APIMethod<GetTypePropertyParams, SymbolResponse | null>;
    getTargetOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getFreshTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse | null>;
    getRegularTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse | null>;
    getTypesOfType: APIMethod<GetTypePropertyParams, TypeResponse[] | null>;
    getTypeParametersOfType: APIMethod<GetTypePropertyParams, TypeResponse[] | null>;
    getOuterTypeParametersOfType: APIMethod<GetTypePropertyParams, TypeResponse[] | null>;
    getLocalTypeParametersOfType: APIMethod<GetTypePropertyParams, TypeResponse[] | null>;
    getAliasTypeArgumentsOfType: APIMethod<GetTypePropertyParams, TypeResponse[] | null>;
    getAliasSymbolOfType: APIMethod<GetTypePropertyParams, SymbolResponse | null>;
    getObjectTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getIndexTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getCheckTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getExtendsTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getBaseTypeOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getConstraintOfType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getTypeParametersOfSignature: APIMethod<GetSignaturePropertyParams, TypeResponse[] | null>;
    getParametersOfSignature: APIMethod<GetSignaturePropertyParams, SymbolResponse[] | null>;
    getThisParameterOfSignature: APIMethod<GetSignaturePropertyParams, SymbolResponse | null>;
    getTargetOfSignature: APIMethod<GetSignaturePropertyParams, SignatureResponse | null>;
    getContextualType: APIMethod<GetContextualTypeParams, TypeResponse | null>;
    getBaseTypeOfLiteralType: APIMethod<GetBaseTypeOfLiteralTypeParams, TypeResponse>;
    getNonNullableType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getTypeFromTypeNode: APIMethod<GetTypeFromTypeNodeParams, TypeResponse>;
    getWidenedType: APIMethod<GetWidenedTypeParams, TypeResponse>;
    getParameterType: APIMethod<GetParameterTypeParams, TypeResponse>;
    getTypeParameterAtPosition: APIMethod<GetParameterTypeParams, TypeResponse>;
    isArrayLikeType: APIMethod<IsArrayLikeTypeParams, boolean>;
    isTypeAssignableTo: APIMethod<IsTypeAssignableToParams, boolean>;
    getShorthandAssignmentValueSymbol: APIMethod<GetTypeAtLocationParams, SymbolResponse | null>;
    getTypeOfSymbolAtLocation: APIMethod<GetTypeOfSymbolAtLocationParams, TypeResponse>;
    typeToTypeNode: APIMethod<TypeToTypeNodeParams, SourceFileResponse | null>;
    signatureToSignatureDeclaration: APIMethod<SignatureToSignatureDeclarationParams, SourceFileResponse | null>;
    typeToString: APIMethod<TypeToTypeNodeParams, unknown>;
    isContextSensitive: APIMethod<GetContextualTypeParams, boolean>;
    getReturnTypeOfSignature: APIMethod<GetSignaturePropertyParams, TypeResponse>;
    getRestTypeOfSignature: APIMethod<CheckerSignatureParams, TypeResponse>;
    getTypePredicateOfSignature: APIMethod<CheckerSignatureParams, TypePredicateResponse | null>;
    getBaseTypes: APIMethod<CheckerTypeParams, TypeResponse[] | null>;
    getPropertiesOfType: APIMethod<CheckerTypeParams, SymbolResponse[] | null>;
    getApparentPropertiesOfType: APIMethod<GetTypePropertyParams, SymbolResponse[]>;
    getApparentType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getReducedType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getPropertyOfType: APIMethod<GetPropertyOfTypeParams, SymbolResponse | null>;
    getIndexInfosOfType: APIMethod<CheckerTypeParams, IndexInfoResponse[] | null>;
    getConstraintOfTypeParameter: APIMethod<GetTypePropertyParams, TypeResponse | null>;
    getDefaultFromTypeParameter: APIMethod<GetTypePropertyParams, TypeResponse | null>;
    getBaseConstraintOfType: APIMethod<CheckerTypeParams, TypeResponse | null>;
    getTypeArguments: APIMethod<CheckerTypeParams, TypeResponse[] | null>;
    getImportAdderEdits: APIMethod<GetImportAdderEditsParams, TextEdit[]>;
    getTrueTypeOfConditionalType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getFalseTypeOfConditionalType: APIMethod<GetTypePropertyParams, TypeResponse>;
    getConstantValue: APIMethod<CheckerNodeParams, unknown | null>;
    getSignatureFromDeclaration: APIMethod<CheckerNodeParams, SignatureResponse>;
    getExportSpecifierLocalTargetSymbol: APIMethod<CheckerNodeParams, SymbolResponse | null>;
    getAliasedSymbol: APIMethod<CheckerSymbolParams, SymbolResponse>;
    getImmediateAliasedSymbol: APIMethod<CheckerSymbolParams, SymbolResponse | null>;
    getFullyQualifiedName: APIMethod<CheckerSymbolParams, string>;
    getExportsOfModule: APIMethod<CheckerSymbolParams, SymbolResponse[] | null>;
    getMemberInModuleExports: APIMethod<GetMemberInModuleExportsParams, SymbolResponse | null>;
    getJsDocTags: APIMethod<CheckerSymbolParams, JSDocTagInfo[] | null>;
    getDocumentationComment: APIMethod<CheckerSymbolParams, string>;
    getJsDocTagsOfSignature: APIMethod<CheckerSignatureParams, JSDocTagInfo[] | null>;
    getDocumentationCommentOfSignature: APIMethod<CheckerSignatureParams, string>;
    getLocalsOfNode: APIMethod<CheckerNodeParams, SymbolResponse[] | null>;
    getAwaitedType: APIMethod<CheckerTypeParams, TypeResponse | null>;
    isArrayType: APIMethod<CheckerTypeParams, boolean>;
    isTupleType: APIMethod<CheckerTypeParams, boolean>;
    getReferencesToSymbolInFile: APIMethod<GetReferencesToSymbolInFileParams, string[]>;
    getReferencedSymbolsForNode: APIMethod<GetReferencedSymbolsForNodeParams, ReferencedSymbolEntry[] | null>;
    getSignatureUsages: APIMethod<GetSignatureUsagesParams, SignatureUsageResponse[] | null>;
    getCompletionsAtPosition: APIMethod<GetCompletionsAtPositionParams, CompletionInfoResponse | null>;
    getSyntacticDiagnostics: APIMethod<GetDiagnosticsParams, DiagnosticResponse[] | null>;
    getBindDiagnostics: APIMethod<GetDiagnosticsParams, DiagnosticResponse[] | null>;
    getSemanticDiagnostics: APIMethod<GetDiagnosticsParams, DiagnosticResponse[] | null>;
    getSuggestionDiagnostics: APIMethod<GetDiagnosticsParams, DiagnosticResponse[] | null>;
    getDeclarationDiagnostics: APIMethod<GetDiagnosticsParams, DiagnosticResponse[] | null>;
    getProgramDiagnostics: APIMethod<GetProjectDiagnosticsParams, DiagnosticResponse[] | null>;
    getGlobalDiagnostics: APIMethod<GetProjectDiagnosticsParams, DiagnosticResponse[] | null>;
    getConfigFileParsingDiagnostics: APIMethod<GetProjectDiagnosticsParams, DiagnosticResponse[] | null>;
    printNode: APIMethod<PrintNodeParams, string>;
    formatNodeForInsertion: APIMethod<FormatNodeForInsertionParams, string>;
    emit: APIMethod<EmitParams, EmitResponse>;
    emitToString: APIMethod<EmitParams, EmitOutputResponse>;
    getJavaScriptEmit: APIMethod<SelectedFilesEmitParams, EmitOutputResponse>;
    getDeclarationEmit: APIMethod<SelectedFilesEmitParams, EmitOutputResponse>;
    getAnyType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getStringType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getNumberType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getBooleanType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getVoidType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getUndefinedType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getNullType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getNeverType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getUnknownType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getBigIntType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getESSymbolType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getNonPrimitiveType: APIMethod<GetIntrinsicTypeParams, TypeResponse>;
    getWellKnownSymbols: APIMethod<GetIntrinsicTypeParams, WellKnownSymbolsResponse>;
    getWellKnownSignatures: APIMethod<GetIntrinsicTypeParams, WellKnownSignaturesResponse>;
    startCPUProfile: APIMethod<ProfileParams, void>;
    stopCPUProfile: APIMethod<null, ProfileResult>;
    saveHeapProfile: APIMethod<ProfileParams, ProfileResult>;
    getSymbolOfDeclaration: APIMethod<GetSymbolOfDeclarationParams, SymbolResponse>;
    getExportedSymbolsOfFiles: APIMethod<GetExportedSymbolsOfFilesParams, ExportedSymbolResponse[][]>;
    parseSourceFile: APIMethod<ParseSourceFileParams, unknown>;
    symbolToString: APIMethod<SymbolToStringParams, unknown>;
    formatDocument: APIMethod<FormatDocumentParams, TextEdit[]>;
    formatDocumentRange: APIMethod<FormatDocumentRangeParams, TextEdit[]>;
    organizeImports: APIMethod<OrganizeImportsParams, TextEdit[]>;
    rename: APIMethod<RenameParams, FileTextEdits[]>;
    getDefinition: APIMethod<FilePositionParams, FileSpan[]>;
    getImplementations: APIMethod<FilePositionParams, FileSpan[]>;
    getCodeFixes: APIMethod<GetCodeFixesParams, CodeFixAction[]>;
    getCombinedCodeFix: APIMethod<GetCombinedCodeFixParams, CombinedCodeActions>;
    getAmbientModules: APIMethod<GetIntrinsicTypeParams, SymbolResponse[]>;
}
export type DocumentIdentifier = string | {
    uri: string;
};
/** ReleaseParams are the parameters for the release method. */
export interface ReleaseParams {
    snapshot: number;
}
/** InitializeResponse is returned by the initialize method. */
export interface InitializeResponse {
    /** UseCaseSensitiveFileNames indicates whether the host file system is case-sensitive. */
    useCaseSensitiveFileNames: boolean;
    /** CurrentDirectory is the server's current working directory. */
    currentDirectory: string;
    /**
     * Version is the compiler's own version, e.g. "7.1.0-dev". Not the version of
     * any npm package wrapping it.
     */
    version: string;
}
/**
 * UpdateSnapshotParams are the parameters for creating a new snapshot.
 * All fields are optional. With no fields set, the server adopts the latest LSP state.
 */
export interface UpdateSnapshotParams {
    /**
     * OpenProjects lists tsconfig.json files to open/load in the new snapshot.
     * Opens are ref-counted and persist across snapshots until closed.
     */
    openProjects?: readonly DocumentIdentifier[];
    /**
     * CloseProjects lists tsconfig.json files to release in the new snapshot.
     * A project is only unloaded once every API client that opened it closes it.
     */
    closeProjects?: readonly DocumentIdentifier[];
    /** FileChanges describes file system changes since the last snapshot. */
    fileChanges?: APIFileChanges;
    /**
     * OpenFiles lists files to keep open for the API client, mirroring LSP's
     * textDocument/didOpen. For each file, ancestor directories are searched for a
     * tsconfig that contains it; if found, that configured project is loaded and
     * becomes the file's default project. Otherwise the file is loaded into the
     * inferred project (e.g. a node_modules d.ts not in any project's import graph).
     * Opens persist across snapshots until the file is closed.
     */
    openFiles?: readonly DocumentIdentifier[];
    /**
     * CloseFiles lists files to release in the new snapshot. A file is only fully
     * closed once every API client that opened it closes it.
     */
    closeFiles?: readonly DocumentIdentifier[];
    /**
     * RootFileChanges lists root files to add to or drop from projects the client
     * names root files for itself rather than through a config.
     */
    rootFileChanges?: readonly APIProjectRootFileChanges[];
}
/** UpdateSnapshotResponse is returned by updateSnapshot. */
export interface UpdateSnapshotResponse {
    /** Snapshot is the handle for the newly created snapshot. */
    snapshot: number;
    /** Projects is the list of projects in the snapshot. */
    projects: ProjectResponse[];
    /**
     * Changes describes source file differences from the previous snapshot.
     * Nil for the first snapshot in a session.
     */
    changes?: SnapshotChanges;
}
/**
 * UpdateTemporarySnapshotParams are the parameters for creating a temporary
 * snapshot that overrides a single file's content.
 */
export interface UpdateTemporarySnapshotParams {
    /** Snapshot is the current client snapshot on which to layer the temporary update. */
    snapshot: number;
    /** File identifies the file whose content is temporarily overridden. */
    file: DocumentIdentifier;
    /** NewText is the temporary content for the file. */
    newText: string;
}
export interface ParseCommandLineParams {
    commandLine: readonly string[] | null;
}
export interface ConfigFileResponse extends ProjectConfigResponse {
    fileNames: string[];
}
export interface ReadConfigFileParams {
    file: DocumentIdentifier;
}
export interface ReadConfigFileResponse {
    config: unknown;
    error?: DiagnosticResponse;
}
export interface ParseJsonConfigFileContentParams {
    json: unknown;
    configDirectory?: string;
    configFileName?: DocumentIdentifier;
}
export interface ParseConfigFileParams {
    file: DocumentIdentifier;
}
export interface TranspileParams {
    input: string;
    options: TranspileOptions;
}
export interface TranspileOutputResponse {
    outputText: string;
    diagnostics?: DiagnosticResponse[];
    sourceMapText?: string;
}
export interface TranspileFromFileParams {
    fileName: string;
    options: TranspileOptions;
}
export interface GetDefaultProjectForFileParams {
    snapshot: number;
    file: DocumentIdentifier;
}
export interface ProjectResponse {
    id: string;
    configFileName: string;
    currentDirectory: string;
    /**
     * ParsedCommandLine is the project's config, without its root file list — see
     * NewProjectResponse for why, and getProjectRootFiles for the list.
     */
    parsedCommandLine: ProjectConfigResponse;
    /** @deprecated Use parsedCommandLine.options. */
    compilerOptions: CompilerOptions;
}
export interface GetSymbolAtPositionParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    position: number;
}
export interface SymbolResponse {
    id: number;
    /**
     * Project is the project in which the symbol was first observed. It is the
     * default project for follow-up lookups whose results can vary by project.
     */
    project: string;
    name: string;
    flags: number;
    checkFlags: number;
    declarations?: string[];
    valueDeclaration?: string;
    parent?: number;
    exportSymbol?: number;
}
export interface GetSymbolsAtPositionsParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    positions: readonly number[] | null;
}
export interface GetSymbolAtLocationParams {
    snapshot: number;
    project: string;
    location: string;
}
export interface GetSymbolsAtLocationsParams {
    snapshot: number;
    project: string;
    locations: readonly string[] | null;
}
export interface GetSymbolOfSourceFileParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
}
export interface GetSymbolsOfSourceFilesParams {
    snapshot: number;
    project: string;
    files: readonly DocumentIdentifier[] | null;
}
export interface GetTypeOfSymbolParams {
    snapshot: number;
    project: string;
    symbol: number;
}
export interface TypeResponse {
    id: number;
    flags: number;
    objectFlags?: number;
    /**
     * Value is literal type data. BigInt literals are encoded as signed decimal
     * strings because JSON cannot represent bigint; absent values are null.
     */
    value: unknown;
    /** ObjectType / TypeReference / StringMappingType / IndexType target */
    target?: number;
    /** InterfaceType type parameters */
    typeParameters?: number[];
    outerTypeParameters?: number[];
    localTypeParameters?: number[];
    /** TupleType data */
    elementFlags?: number[];
    fixedLength?: number;
    readonly?: boolean;
    /** IndexedAccessType data */
    objectType?: number;
    indexType?: number;
    /** ConditionalType data */
    checkType?: number;
    extendsType?: number;
    /** SubstitutionType data */
    baseType?: number;
    substConstraint?: number;
    /** TemplateLiteralType text segments */
    texts?: string[];
    /** FreshableType data (LiteralType and computed enum types) */
    freshType?: number;
    regularType?: number;
    /** TypeParameter data */
    isThisType?: boolean;
    /** IntrinsicType data */
    intrinsicName?: string;
    /** TypeAlias data */
    aliasTypeArguments?: number[];
    aliasSymbol?: number;
    /** Symbol associated with structured types */
    symbol?: number;
}
export interface GetTypesOfSymbolsParams {
    snapshot: number;
    project: string;
    symbols: readonly number[] | null;
}
export interface GetSourceFileParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
}
/**
 * SourceFileResponse contains the binary-encoded AST data for a source file.
 * The Data field is base64-encoded binary data in the encoder's format.
 */
export interface SourceFileResponse {
    /** Data is the base64-encoded binary AST data in the encoder's format. */
    data: string;
}
/**
 * SourceFileIdentity is which parse of a file a program is holding, without the file.
 *
 * The two fields are the header a source file response leads with — see
 * encoder.SourceFileHash and encoder.ParseOptionsKey — and they are what a client's
 * source file cache decides on. A client already holding a tree for the path asks for
 * this instead of the file, and reuses its own copy when they match.
 */
export interface SourceFileIdentity {
    contentHash: string;
    parseOptionsKey: string;
}
export interface GetSourceFileNamesParams {
    snapshot: number;
    project: string;
}
/** SourceFileMetadata carries program-stored metadata about a single source file. */
export interface SourceFileMetadata {
    isDefaultLibrary: boolean;
    isFromExternalLibrary: boolean;
    packageJsonType: string;
    packageJsonDirectory: string;
    impliedNodeFormat: ModuleKind;
}
/** GetProjectDiagnosticsParams are parameters for project-wide diagnostic methods. */
export interface GetProjectDiagnosticsParams {
    snapshot: number;
    project: string;
}
export interface ResolveNameParams {
    snapshot: number;
    project: string;
    name: string;
    /** Optional: node handle for location context */
    location?: string;
    /** Optional: file for location context (alternative to Location) */
    file?: DocumentIdentifier;
    /** Optional: position in file for location context (with File) */
    position?: number;
    /** SymbolFlags for what kind of symbol to find */
    meaning: number;
    /** Whether to exclude global symbols */
    excludeGlobals?: boolean;
}
/**
 * GetSymbolsInScopeParams are parameters for getSymbolsInScope, which returns
 * all symbols visible at a given location.
 */
export interface GetSymbolsInScopeParams {
    snapshot: number;
    project: string;
    /** Optional: node handle for location context */
    location?: string;
    /** Optional: file for location context (alternative to Location) */
    file?: DocumentIdentifier;
    /** Optional: position in file for location context (with File) */
    position?: number;
    /** SymbolFlags for what kind of symbols to find */
    meaning: number;
}
export interface GetSignaturesOfTypeParams {
    snapshot: number;
    project: string;
    type: number;
    kind: number;
}
export interface SignatureResponse {
    id: number;
    flags: number;
    declaration?: string;
    typeParameters?: number[];
    parameters?: number[];
    thisParameter?: number;
    target?: number;
}
export interface GetResolvedSignatureParams {
    snapshot: number;
    project: string;
    location: string;
}
export interface GetTypeAtLocationParams {
    snapshot: number;
    project: string;
    location: string;
}
export interface GetTypeAtLocationsParams {
    snapshot: number;
    project: string;
    locations: readonly string[] | null;
}
export interface GetTypeAtPositionParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    position: number;
}
export interface GetTypesAtPositionsParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    positions: readonly number[] | null;
}
/** GetSymbolPropertyParams is used for all symbol sub-property endpoints. */
export interface GetSymbolPropertyParams {
    snapshot: number;
    project: string;
    objectId: number;
}
/** GetTypePropertyParams is used for all type sub-property endpoints. */
export interface GetTypePropertyParams {
    snapshot: number;
    project: string;
    objectId: number;
}
/** GetSignaturePropertyParams is used for all signature sub-property endpoints. */
export interface GetSignaturePropertyParams {
    snapshot: number;
    project: string;
    objectId: number;
}
/** GetContextualTypeParams returns the contextual type for a node. */
export interface GetContextualTypeParams {
    snapshot: number;
    project: string;
    location: string;
}
/** GetBaseTypeOfLiteralTypeParams returns the base type of a literal type. */
export interface GetBaseTypeOfLiteralTypeParams {
    snapshot: number;
    project: string;
    type: number;
}
/** GetTypeFromTypeNodeParams are the parameters for the getTypeFromTypeNode method. */
export interface GetTypeFromTypeNodeParams {
    snapshot: number;
    project: string;
    location: string;
}
/** GetWidenedTypeParams are the parameters for the getWidenedType method. */
export interface GetWidenedTypeParams {
    snapshot: number;
    project: string;
    type: number;
}
/** GetParameterTypeParams are the parameters for the getParameterType method. */
export interface GetParameterTypeParams {
    snapshot: number;
    project: string;
    signature: number;
    index: number;
}
/** IsArrayLikeTypeParams checks whether a type is array-like. */
export interface IsArrayLikeTypeParams {
    snapshot: number;
    project: string;
    type: number;
}
/** IsTypeAssignableToParams checks assignability between two types. */
export interface IsTypeAssignableToParams {
    snapshot: number;
    project: string;
    source: number;
    target: number;
}
/** GetTypeOfSymbolAtLocationParams returns the narrowed type of a symbol at a specific location. */
export interface GetTypeOfSymbolAtLocationParams {
    snapshot: number;
    project: string;
    symbol: number;
    location: string;
}
/** TypeToTypeNodeParams are the parameters for the typeToTypeNode method. */
export interface TypeToTypeNodeParams {
    snapshot: number;
    project: string;
    type: number;
    location?: string;
    flags?: number;
}
/** SignatureToSignatureDeclarationParams are the parameters for the signatureToSignatureDeclaration method. */
export interface SignatureToSignatureDeclarationParams {
    snapshot: number;
    project: string;
    signature: number;
    kind: number;
    location?: string;
    flags?: number;
}
/** CheckerSignatureParams are parameters for checker methods that operate on a signature. */
export interface CheckerSignatureParams {
    snapshot: number;
    project: string;
    signature: number;
}
/** TypePredicateResponse is the response for getTypePredicateOfSignature. */
export interface TypePredicateResponse {
    kind: number;
    parameterIndex: number;
    parameterName?: string;
    type?: TypeResponse;
}
/** CheckerTypeParams are parameters for checker methods that operate on a type. */
export interface CheckerTypeParams {
    snapshot: number;
    project: string;
    type: number;
}
/** GetPropertyOfTypeParams are parameters for getPropertyOfType (a named property of a type). */
export interface GetPropertyOfTypeParams {
    snapshot: number;
    project: string;
    type: number;
    name: string;
}
/** IndexInfoResponse represents a single index signature. */
export interface IndexInfoResponse {
    keyType: TypeResponse;
    valueType: TypeResponse;
    isReadonly?: boolean;
    declaration?: string;
}
export interface GetImportAdderEditsParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    actions: readonly ImportAdderAction[] | null;
}
export interface TextEdit {
    pos: number;
    end: number;
    newText: string;
}
/** CheckerNodeParams are parameters for checker methods that operate on a node location. */
export interface CheckerNodeParams {
    snapshot: number;
    project: string;
    location: string;
}
/** CheckerSymbolParams are parameters for checker methods that operate on a symbol. */
export interface CheckerSymbolParams {
    snapshot: number;
    project: string;
    symbol: number;
}
/** GetMemberInModuleExportsParams are parameters for getMemberInModuleExports. */
export interface GetMemberInModuleExportsParams {
    snapshot: number;
    project: string;
    symbol: number;
    name: string;
}
/**
 * JSDocTagInfo is a single JSDoc tag, mirroring Strada's JSDocTagInfo but with the tag text
 * rendered as a plain string rather than SymbolDisplayPart[].
 */
export interface JSDocTagInfo {
    name: string;
    text?: string;
}
/** GetReferencesToSymbolInFileParams are the parameters for the getReferencesToSymbolInFile method. */
export interface GetReferencesToSymbolInFileParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    symbol: number;
}
/** GetReferencedSymbolsForNodeParams are the parameters for the getReferencedSymbolsForNode method. */
export interface GetReferencedSymbolsForNodeParams {
    snapshot: number;
    project: string;
    node: string;
    position: number;
}
/** ReferencedSymbolEntry represents a symbol definition and its references. */
export interface ReferencedSymbolEntry {
    definition: string;
    symbol?: SymbolResponse;
    references: string[];
    /**
     * WriteAccess[i] reports whether References[i] is a write. DisplayParts render
     * the definition. Both are the fork's enrichment of the reference response.
     */
    writeAccess?: boolean[];
    displayParts?: DisplayPart[];
}
/** GetSignatureUsagesParams are the parameters for the getSignatureUsages method. */
export interface GetSignatureUsagesParams {
    snapshot: number;
    project: string;
    signatureDecl: string;
}
/** SignatureUsageResponse represents a single usage of a signature as a name-call pair. */
export interface SignatureUsageResponse {
    name: string;
    call?: string;
}
/** GetCompletionsAtPositionParams are the parameters for the getCompletionsAtPosition method. */
export interface GetCompletionsAtPositionParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    position: number;
    triggerCharacter?: string;
    includeSymbol?: boolean;
}
/** CompletionInfoResponse wraps a list of completion entries. */
export interface CompletionInfoResponse {
    isIncomplete: boolean;
    entries: CompletionEntryResponse[];
}
/** GetDiagnosticsParams are parameters for per-file diagnostic methods. */
export interface GetDiagnosticsParams {
    snapshot: number;
    project: string;
    files?: readonly DocumentIdentifier[];
}
/** DiagnosticResponse is the API response for a single diagnostic. */
export interface DiagnosticResponse {
    /** FileName is the path of the file this diagnostic belongs to, if any. */
    fileName?: string;
    /** Pos is the start position of the diagnostic in the source file. */
    pos: number;
    /** End is the end position of the diagnostic in the source file. */
    end: number;
    /** StartPosition is the zero-based line and UTF-16 character position of Pos. */
    startPosition?: DiagnosticPositionResponse;
    /** EndPosition is the zero-based line and UTF-16 character position of End. */
    endPosition?: DiagnosticPositionResponse;
    /** SourceLines contains the source lines needed to render this diagnostic with context. */
    sourceLines?: DiagnosticSourceLineResponse[];
    /** Code is the diagnostic error code. */
    code: number;
    /** Category is the diagnostic category (error, warning, suggestion, message). */
    category: number;
    /** Source is a custom diagnostic-code prefix. An empty value uses the default "TS". */
    source?: string;
    /** Text is the localized diagnostic message text. */
    text: string;
    /** ReportsUnnecessary indicates this diagnostic highlights unnecessary code. */
    reportsUnnecessary?: boolean;
    /** ReportsDeprecated indicates this diagnostic highlights deprecated code. */
    reportsDeprecated?: boolean;
    /** MessageChain contains chained diagnostic messages, if any. */
    messageChain?: DiagnosticResponse[];
    /** RelatedInformation contains related diagnostic information, if any. */
    relatedInformation?: DiagnosticResponse[];
}
/** PrintNodeParams are the parameters for the printNode method. */
export interface PrintNodeParams {
    /** base64-encoded binary AST data */
    data: string;
    /**
     * SourceText is the text of the file the node was parsed from. Comments and
     * original token text are read out of it, so a node printed without it prints
     * without its comments.
     */
    sourceText?: string;
    /** names the script kind SourceText is parsed as */
    fileName?: string;
    preserveSourceNewlines?: boolean;
    neverAsciiEscape?: boolean;
    terminateUnterminatedLiterals?: boolean;
    removeComments?: boolean;
    /**
     * NewLine is a core.NewLineKind: 0 leaves the printer's default (LF), 1 emits
     * CRLF, 2 emits LF. The printer writes the line breaks, so text a line break
     * is part of — a template literal's, say — is left alone.
     */
    newLine?: number;
    /**
     * SyntheticComments are comments the client attached to nodes rather than ones
     * SourceText contains, addressed by the index the node was encoded at.
     */
    syntheticComments?: readonly NodeSyntheticComments[];
}
/** FormatNodeForInsertionParams are the parameters for the formatNodeForInsertion method. */
export interface FormatNodeForInsertionParams {
    snapshot: number;
    project: string;
    /** target file where the node will be inserted */
    file: DocumentIdentifier;
    /** UTF-16 code-unit offset of the insertion position in the target file */
    position: number;
    /** base64-encoded binary AST data for the synthesized node */
    data: string;
}
export interface EmitParams {
    snapshot: number;
    project: string;
    emitOnly?: number;
}
export interface EmitResponse {
    emitSkipped: boolean;
    diagnostics: DiagnosticResponse[];
    emittedFiles: string[];
}
export interface EmitOutputResponse {
    emitSkipped: boolean;
    diagnostics: DiagnosticResponse[];
    outputFiles: EmitOutputFile[];
}
export interface SelectedFilesEmitParams {
    snapshot: number;
    project: string;
    files: readonly DocumentIdentifier[] | null;
}
/** GetIntrinsicTypeParams is used for intrinsic type getters (anyType, stringType, etc.). */
export interface GetIntrinsicTypeParams {
    snapshot: number;
    project: string;
}
/**
 * WellKnownSymbolsResponse carries the handle ids of the per-checker singleton
 * symbols (unknown, undefined, arguments) so the client can identify them by id
 * without a round-trip on every check.
 */
export interface WellKnownSymbolsResponse {
    unknown: number;
    undefined: number;
    arguments: number;
}
/**
 * WellKnownSignaturesResponse carries the handle id of the per-checker singleton
 * unknown signature (the signature the checker yields when a call cannot be
 * resolved) so the client can identify it by id without a round-trip on every check.
 */
export interface WellKnownSignaturesResponse {
    unknown: number;
}
export interface ProfileParams {
    dir: string;
}
export interface ProfileResult {
    file: string;
}
export interface GetSymbolOfDeclarationParams {
    snapshot: number;
    project: string;
    declaration: string;
}
/**
 * GetExportedSymbolsOfFilesParams asks what a batch of files export. The batch is
 * the point: the answer for one file is a handful of map lookups next to what a
 * request costs, so a caller sweeping a project asks once rather than once a file.
 */
export interface GetExportedSymbolsOfFilesParams {
    snapshot: number;
    project: string;
    files: readonly DocumentIdentifier[] | null;
}
/**
 * ExportedSymbolResponse is one exported name together with the declarations of the
 * symbol it is exported on.
 *
 * The declarations are the symbol's own, not the ones a re-export chain leads to:
 * following an export specifier or an import to what it names is the caller's to do,
 * and it is the caller that knows what it wants from the far end.
 */
export interface ExportedSymbolResponse {
    /** The escaped (`__String`) name the symbol is exported on. */
    name: string;
    declarations?: string[];
}
export interface ParseSourceFileParams {
    file: DocumentIdentifier;
    text: string;
    snapshot?: number;
    project?: string;
}
/** SymbolToStringParams are the parameters for the symbolToString method. */
export interface SymbolToStringParams {
    snapshot: number;
    project: string;
    symbol: number;
    location?: string;
}
/** FormatDocumentParams are the parameters for the formatDocument method. */
export interface FormatDocumentParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    options?: FormattingOptions;
}
/**
 * FormatDocumentRangeParams are the parameters for the formatDocumentRange
 * method. Pos and End are character offsets into the file.
 */
export interface FormatDocumentRangeParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    pos: number;
    end: number;
    options?: FormattingOptions;
}
/** OrganizeImportsParams are the parameters for the organizeImports method. */
export interface OrganizeImportsParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    mode?: "all" | "removeUnused" | "sortAndCombine";
}
/**
 * RenameParams are the parameters for the rename method. Position is a
 * character offset into the file.
 */
export interface RenameParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    position: number;
    newName: string;
    /**
     * UseAliasesForRename overrides the providePrefixAndSuffixTextForRename user
     * preference. When false, a shorthand property assignment, binding element,
     * or import/export specifier is renamed outright rather than being given the
     * old name as an alias. Nil leaves the snapshot's preference in place.
     */
    useAliasesForRename?: boolean;
}
/** FileTextEdits groups edits by the file they apply to. */
export interface FileTextEdits {
    fileName: string;
    edits: TextEdit[] | null;
}
/**
 * FilePositionParams identify a character offset within a file. They are the
 * parameters for the getDefinition and getImplementations methods.
 */
export interface FilePositionParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    position: number;
}
/** FileSpan is a span of a file, in character offsets. */
export interface FileSpan {
    fileName: string;
    pos: number;
    end: number;
}
/**
 * GetCodeFixesParams are the parameters for the getCodeFixes method. Pos and End
 * are character offsets; ErrorCodes, when non-empty, restricts the fixes to
 * those addressing the given diagnostic codes.
 */
export interface GetCodeFixesParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    pos: number;
    end: number;
    errorCodes?: readonly number[];
    /**
     * QuotePreference decides the quotes a fix writes a new string literal with:
     * "single", "double", or "auto" to infer them from the file. Empty leaves the
     * snapshot's preference in place.
     */
    quotePreference?: string;
}
/** CodeFixAction is a quick fix: a description plus the edits that apply it. */
export interface CodeFixAction {
    description: string;
    changes: FileTextEdits[] | null;
}
/**
 * GetCombinedCodeFixParams are the parameters for the getCombinedCodeFix
 * method. FixId names the fix to apply across the whole file; the ids that exist
 * today are "fixMissingImport", "fixMissingTypeAnnotationOnExports" and
 * "fixClassIncorrectlyImplementsInterface".
 */
export interface GetCombinedCodeFixParams {
    snapshot: number;
    project: string;
    file: DocumentIdentifier;
    fixId: string;
    /**
     * Options formats the text the fix inserts. Unset fields fall back to the
     * server's defaults, as they do for formatDocument.
     */
    options?: FormattingOptions;
    /**
     * QuotePreference decides the quotes a fix writes a new string literal with:
     * "single", "double", or "auto" to infer them from the file. Empty leaves the
     * snapshot's preference in place.
     */
    quotePreference?: string;
}
/**
 * CombinedCodeActions is the result of getCombinedCodeFix: a description plus
 * the edits that apply the fix everywhere it is needed.
 */
export interface CombinedCodeActions {
    description: string;
    changes: FileTextEdits[] | null;
}
/**
 * APIFileChanges describes file changes to apply when updating a snapshot.
 * Either InvalidateAll is true (discard all caches) or Changed/Created/Deleted
 * list individual documents.
 */
export interface APIFileChanges {
    invalidateAll?: boolean;
    changed?: DocumentIdentifier[];
    created?: DocumentIdentifier[];
    deleted?: DocumentIdentifier[];
}
/**
 * APIProjectRootFileChanges names root files for a project directly, rather than
 * through the project's config. They are appended to whatever the config resolved, and
 * persist across snapshots until the project is closed.
 */
export interface APIProjectRootFileChanges {
    /** Project is the project, named by the config file it was opened with. */
    project: DocumentIdentifier;
    /** Added lists root files to append, in the order they should be appended. */
    added?: string[];
    /** Removed lists root files to drop. */
    removed?: string[];
}
/**
 * SnapshotChanges describes what changed between the previous latest snapshot
 * and the newly created snapshot. Changes are reported per-project so clients
 * can track cache refs at the (snapshot, project) level.
 */
export interface SnapshotChanges {
    /**
     * ChangedProjects maps project handles to the file changes within that project.
     * Projects not listed here (and not in RemovedProjects) are unchanged.
     */
    changedProjects?: Record<string, ProjectFileChanges | null>;
    /**
     * RemovedProjects lists project handles that were present in the previous
     * snapshot but absent from the new one.
     */
    removedProjects?: string[];
}
/**
 * ProjectConfigResponse is a config as a project reports it: everything a
 * ConfigFileResponse holds except the root file list, which a project's
 * description leaves off — see NewProjectResponse.
 */
export interface ProjectConfigResponse {
    options: CompilerOptions;
    projectReferences?: ProjectReference[];
    typeAcquisition?: TypeAcquisition;
    compileOnSave?: boolean;
    raw?: unknown;
    /** Errors are the diagnostics produced while parsing the config file. */
    errors: DiagnosticResponse[];
}
export interface TranspileOptions {
    compilerOptions?: CompilerOptions;
    fileName?: string;
    reportDiagnostics?: boolean;
}
/** CompilerOptions contains the compiler options exposed by the API. */
export interface CompilerOptions {
    allowJs?: boolean;
    allowArbitraryExtensions?: boolean;
    allowImportingTsExtensions?: boolean;
    allowNonTsExtensions?: boolean;
    allowUmdGlobalAccess?: boolean;
    allowUnreachableCode?: boolean;
    allowUnusedLabels?: boolean;
    assumeChangesOnlyAffectDirectDependencies?: boolean;
    checkJs?: boolean;
    customConditions?: string[];
    composite?: boolean;
    emitDeclarationOnly?: boolean;
    emitBOM?: boolean;
    emitDecoratorMetadata?: boolean;
    declaration?: boolean;
    declarationDir?: string;
    declarationMap?: boolean;
    deduplicatePackages?: boolean;
    disableSizeLimit?: boolean;
    disableSourceOfProjectReferenceRedirect?: boolean;
    disableSolutionSearching?: boolean;
    disableReferencedProjectLoad?: boolean;
    erasableSyntaxOnly?: boolean;
    exactOptionalPropertyTypes?: boolean;
    experimentalDecorators?: boolean;
    forceConsistentCasingInFileNames?: boolean;
    isolatedModules?: boolean;
    isolatedDeclarations?: boolean;
    ignoreConfig?: boolean;
    ignoreDeprecations?: string;
    importHelpers?: boolean;
    inlineSourceMap?: boolean;
    inlineSources?: boolean;
    init?: boolean;
    incremental?: boolean;
    jsx?: JsxEmit;
    jsxFactory?: string;
    jsxFragmentFactory?: string;
    jsxImportSource?: string;
    lib?: string[];
    libReplacement?: boolean;
    locale?: string;
    mapRoot?: string;
    module?: ModuleKind;
    moduleResolution?: ModuleResolutionKind;
    moduleSuffixes?: string[];
    moduleDetection?: ModuleDetectionKind;
    newLine?: NewLineKind;
    noEmit?: boolean;
    noCheck?: boolean;
    noErrorTruncation?: boolean;
    noFallthroughCasesInSwitch?: boolean;
    noImplicitAny?: boolean;
    noImplicitThis?: boolean;
    noImplicitReturns?: boolean;
    noEmitHelpers?: boolean;
    noLib?: boolean;
    noPropertyAccessFromIndexSignature?: boolean;
    noUncheckedIndexedAccess?: boolean;
    noEmitOnError?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
    noResolve?: boolean;
    noImplicitOverride?: boolean;
    noUncheckedSideEffectImports?: boolean;
    outDir?: string;
    paths?: Record<string, string[]>;
    preserveConstEnums?: boolean;
    preserveSymlinks?: boolean;
    project?: string;
    resolveJsonModule?: boolean;
    resolvePackageJsonExports?: boolean;
    resolvePackageJsonImports?: boolean;
    removeComments?: boolean;
    rewriteRelativeImportExtensions?: boolean;
    reactNamespace?: string;
    rootDir?: string;
    rootDirs?: string[];
    skipLibCheck?: boolean;
    stableTypeOrdering?: boolean;
    strict?: boolean;
    strictBindCallApply?: boolean;
    strictBuiltinIteratorReturn?: boolean;
    strictFunctionTypes?: boolean;
    strictNullChecks?: boolean;
    strictPropertyInitialization?: boolean;
    stripInternal?: boolean;
    skipDefaultLibCheck?: boolean;
    sourceMap?: boolean;
    sourceRoot?: string;
    suppressOutputPathCheck?: boolean;
    target?: ScriptTarget;
    traceResolution?: boolean;
    tsBuildInfoFile?: string;
    typeRoots?: string[];
    types?: string[];
    useDefineForClassFields?: boolean;
    useUnknownInCatchVariables?: boolean;
    verbatimModuleSyntax?: boolean;
    maxNodeModuleJsDepth?: number;
    /** Internal fields */
    configFilePath?: string;
}
export interface ImportAdderAction {
    kind: "importSymbol";
    symbol?: number;
    isValidTypeOnlyUseSite?: boolean;
}
export interface DisplayPart {
    text: string;
    kind: string;
}
/** CompletionEntryResponse represents a single completion item. */
export interface CompletionEntryResponse {
    name: string;
    kind?: number;
    sortText?: string;
    insertText?: string;
    filterText?: string;
    detail?: string;
    labelDetails?: CompletionEntryLabelDetailsResponse;
    symbol?: SymbolResponse;
}
export interface DiagnosticPositionResponse {
    line: number;
    character: number;
}
export interface DiagnosticSourceLineResponse {
    line: number;
    text: string;
}
/** NodeSyntheticComments are the comments a client attached to one encoded node. */
export interface NodeSyntheticComments {
    node: number;
    leading?: SyntheticComment[];
    trailing?: SyntheticComment[];
}
export interface EmitOutputFile {
    fileName: string;
    text: string;
    sourceFileName?: string;
    /**
     * WriteByteOrderMark reports that the file is to be written with a UTF-8 byte
     * order mark. Text is reported without it, the way ts.OutputFile did.
     */
    writeByteOrderMark?: boolean;
}
/**
 * FormattingOptions configures the formatter. Unset fields fall back to the
 * server's configured defaults.
 */
export interface FormattingOptions {
    tabSize?: number;
    insertSpaces?: boolean;
    trimTrailingWhitespace?: boolean;
    /**
     * The three below are honoured by the formatter but cannot be expressed in an
     * LSP FormattingOptions, so they are carried separately: IndentSize is the
     * indentation step (defaulting to TabSize), IndentStyle is lsutil.IndentStyle
     * (0 none, 1 block, 2 smart), and NewLineCharacter is the line ending inserted
     * text is written with.
     */
    indentSize?: number;
    indentStyle?: number;
    newLineCharacter?: string;
}
/** ProjectFileChanges describes what source files changed within a single project. */
export interface ProjectFileChanges {
    /** ChangedFiles lists source file paths whose content differs. */
    changedFiles?: string[];
    /** DeletedFiles lists source file paths removed from the project's program. */
    deletedFiles?: string[];
}
export interface ProjectReference {
    /** Path is a normalized path on disk. */
    path: string;
    /** OriginalPath is the path as it was originally written. */
    originalPath: string;
    /** Circular indicates that this reference is intended to form a circularity. */
    circular: boolean;
}
export interface TypeAcquisition {
    enable?: boolean;
    include?: string[];
    exclude?: string[];
    disableFilenameBasedTypeAcquisition?: boolean;
}
/** CompletionEntryLabelDetailsResponse holds additional label display text for a completion entry. */
export interface CompletionEntryLabelDetailsResponse {
    detail?: string;
    description?: string;
}
/** SyntheticComment is a comment carried on a node instead of read from a file. */
export interface SyntheticComment {
    /** Kind is an ast.Kind: SingleLineCommentTrivia or MultiLineCommentTrivia. */
    kind: number;
    text: string;
    hasTrailingNewLine?: boolean;
    hasLeadingNewline?: boolean;
}
