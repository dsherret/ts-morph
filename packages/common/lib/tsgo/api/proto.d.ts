import type { CheckFlags } from "../enums/checkFlags.enum";
import type { CompletionItemKind } from "../enums/completionItemKind.enum";
import type { DiagnosticCategory } from "../enums/diagnosticCategory.enum";
import type { ModuleKind } from "../enums/moduleKind.enum";
import type { __String, Path } from "../ast/index";
import type { CompilerOptions } from "./compilerOptions";
export type { CompilerOptions } from "./compilerOptions";
/**
 * A document identifier that can be either a file name (path string) or a document URI object.
 *
 * @example
 * // Using a file name
 * project.program.getSourceFile("/path/to/file.ts");
 *
 * // Using a URI
 * project.program.getSourceFile({ uri: "file:///path/to/file.ts" });
 */
export type DocumentIdentifier = string | {
    uri: string;
};
/**
 * A position within a document, combining a document identifier with an offset.
 */
export interface DocumentPosition {
    /** The document containing the position */
    document: DocumentIdentifier;
    /** The character offset within the document */
    position: number;
}
export interface TextEdit {
    pos: number;
    end: number;
    newText: string;
}
/** Edits grouped by the file they apply to. */
export interface FileTextEdits {
    fileName: string;
    edits: TextEdit[];
}
/** A quick fix: a description plus the edits that apply it. */
export interface CodeFixAction {
    description: string;
    changes: FileTextEdits[];
}
/**
 * The result of applying one fix id across a whole file: a description plus the
 * edits that apply it everywhere it is needed.
 */
export interface CombinedCodeActions {
    description: string;
    changes: FileTextEdits[];
}
/** A span of a file, in character offsets. */
export interface FileSpan {
    fileName: string;
    pos: number;
    end: number;
}
/** Formatter settings. Unset fields fall back to the server's defaults. */
export interface FormattingOptions {
    tabSize?: number;
    insertSpaces?: boolean;
    trimTrailingWhitespace?: boolean;
    /** The indentation step. Defaults to `tabSize`. */
    indentSize?: number;
    /** How new lines are indented: 0 none, 1 block, 2 smart. */
    indentStyle?: number;
    /** The line ending inserted text is written with. */
    newLineCharacter?: string;
}
/**
 * Which import transformations {@link Project.organizeImports} applies.
 * - `"all"` sorts, combines, and removes unused imports.
 * - `"sortAndCombine"` sorts and combines, keeping unused imports.
 * - `"removeUnused"` only removes unused imports.
 */
export type OrganizeImportsMode = "all" | "sortAndCombine" | "removeUnused";
/**
 * The quotes a code fix writes a new string literal with.
 * - `"auto"` infers them from the string literals already in the file.
 */
export type QuotePreference = "auto" | "double" | "single";
export interface ImportSymbolActionRequest {
    kind: "importSymbol";
    symbol: number;
    isValidTypeOnlyUseSite?: boolean;
}
export type ImportAdderActionRequest = ImportSymbolActionRequest;
/**
 * Resolves a DocumentIdentifier to a file name.
 * If the identifier contains a URI, it is converted to a file name.
 */
export declare function resolveFileName(identifier: DocumentIdentifier): string;
/**
 * Resolves a DocumentIdentifier to a document URI.
 * If the identifier contains a file name, it is converted to a URI.
 */
export declare function resolveDocumentURI(identifier: DocumentIdentifier): string;
/**
 * Response from the initialize method.
 */
export interface InitializeResponse {
    /** Whether the host file system is case-sensitive */
    useCaseSensitiveFileNames: boolean;
    /** The server's current working directory */
    currentDirectory: string;
    /**
     * The compiler's own version, e.g. "7.1.0-dev". Not the version of any npm
     * package wrapping it.
     */
    version: string;
}
export interface TypeAcquisition {
    enable?: boolean;
    include?: string[];
    exclude?: string[];
    disableFilenameBasedTypeAcquisition?: boolean;
}
export interface ProjectReference {
    /** A normalized path on disk */
    path: string;
    /** The path as the user originally wrote it */
    originalPath?: string;
    /** True if it is intended that this reference form a circularity */
    circular?: boolean;
}
/**
 * A config as a project reports it: everything a `ParsedCommandLine` holds except
 * the root file list, which a project's description leaves off — see
 * `ProjectResponse`.
 */
export interface ProjectConfig {
    options: CompilerOptions;
    projectReferences?: ProjectReference[];
    typeAcquisition?: TypeAcquisition;
    compileOnSave?: boolean;
    /** Diagnostics produced while parsing the config file. */
    errors?: ProtoDiagnostic[];
}
export interface ParsedCommandLine extends ProjectConfig {
    fileNames: string[];
}
/**
 * A diagnostic as it appears on the wire. Structurally the same as the
 * `Diagnostic` the sync and async APIs expose, declared here so the protocol
 * types do not depend on either of them.
 */
export interface ProtoDiagnostic {
    readonly fileName?: string;
    readonly pos: number;
    readonly end: number;
    readonly code: number;
    readonly category: DiagnosticCategory;
    readonly text: string;
    readonly reportsUnnecessary?: boolean;
    readonly reportsDeprecated?: boolean;
    readonly messageChain?: readonly ProtoDiagnostic[];
    readonly relatedInformation?: readonly ProtoDiagnostic[];
}
export interface LSPUpdateSnapshotParams {
    /**
     * @deprecated Use {@link openProjects} instead.
     * Path to a tsconfig.json file to open in the new snapshot.
     */
    openProject?: string;
    /**
     * tsconfig.json files to open/load in the new snapshot. Opens are ref-counted
     * and persist across snapshots until closed via {@link closeProjects}.
     */
    openProjects?: DocumentIdentifier[];
    /**
     * tsconfig.json files to release in the new snapshot. A project is only unloaded
     * once every API client that opened it closes it.
     */
    closeProjects?: DocumentIdentifier[];
    /**
     * Files to keep open for the API client, mirroring LSP's `textDocument/didOpen`.
     * For each file, ancestor directories are searched for a tsconfig that contains it;
     * if one is found, that configured project is loaded and becomes the file's default
     * project. Otherwise the file is loaded into the inferred project (e.g. a d.ts in
     * node_modules that is not part of any project's import graph). Opens persist across
     * subsequent snapshots until the file is closed via {@link closeFiles}.
     * After calling updateSnapshot with openFiles, getDefaultProjectForFile returns the
     * resolved configured or inferred project.
     */
    openFiles?: DocumentIdentifier[];
    /**
     * Files to release in the new snapshot. A file is only fully closed once every
     * API client that opened it closes it.
     */
    closeFiles?: DocumentIdentifier[];
}
export interface FileChangeSummary {
    changed?: DocumentIdentifier[];
    created?: DocumentIdentifier[];
    deleted?: DocumentIdentifier[];
}
export type FileChanges = FileChangeSummary | {
    invalidateAll: true;
};
/**
 * Root files a client names for a project itself, rather than through its config.
 *
 * They are appended to whatever the project's config resolved, in the order they are
 * added, and persist across snapshots until the project is closed. Nothing about them
 * passes through the config's include globs, so a file named here is in the project
 * whatever else shares its stem.
 */
export interface ProjectRootFileChanges {
    /** The project, named by the config file it was opened with. */
    project: DocumentIdentifier;
    /** Root files to append, in the order they should be appended. */
    added?: string[];
    /** Root files to drop. */
    removed?: string[];
}
/**
 * Parameters for updateSnapshot.
 */
export interface UpdateSnapshotParams extends LSPUpdateSnapshotParams {
    fileChanges?: FileChanges;
    /**
     * Root files to add to or drop from projects, applied in the same snapshot as
     * {@link fileChanges} so a file's contents and its membership arrive together.
     */
    rootFileChanges?: ProjectRootFileChanges[];
}
/**
 * Parameters for updateTemporarySnapshot. Unlike {@link UpdateSnapshotParams}, this
 * only overrides a single file's content: it does not open or close projects/files
 * and does not advance the session's latest snapshot. The resulting snapshot is only
 * for the caller's own queries and must be released when done.
 */
export interface UpdateTemporarySnapshotParams {
    /** The current client snapshot on which to layer the temporary update. */
    snapshot: number;
    /** The file whose content is temporarily overridden. */
    file: DocumentIdentifier;
    /** The temporary content for the file. */
    newText: string;
}
/**
 * Builds the wire request for updateSnapshot, applying the deprecated `openProject`
 * compatibility shim: a single `openProject` is folded into `openProjects` and is
 * never sent on the wire.
 */
export declare function toUpdateSnapshotRequest(params?: UpdateSnapshotParams): UpdateSnapshotParams;
/**
 * Changes to source files within a single project.
 */
export interface ProjectFileChanges {
    /** Source file paths whose content changed */
    changedFiles?: string[];
    /** Source file paths removed from the project's program */
    deletedFiles?: string[];
}
/**
 * Changes between two consecutive snapshots, reported per-project.
 */
export interface SnapshotChanges {
    /** Project handles mapped to their file changes. Projects not listed are unchanged. */
    changedProjects?: Record<string, ProjectFileChanges>;
    /** Project handles that were removed from the snapshot */
    removedProjects?: string[];
}
/**
 * Response from updateSnapshot.
 */
export interface UpdateSnapshotResponse {
    /** Handle for the newly created snapshot */
    snapshot: number;
    /** List of projects in the snapshot */
    projects: ProjectResponse[];
    /** Changes from the previous snapshot (absent for the first snapshot) */
    changes?: SnapshotChanges;
}
export interface ProjectResponse {
    id: Path;
    configFileName: string;
    /**
     * The project's config, without its root file list: the list is as long as the
     * project and a snapshot describes every project it holds, so carrying it here
     * would make every edit cost time proportional to the size of the project. It
     * is fetched with `getProjectRootFiles` when something asks for it.
     */
    parsedCommandLine: ProjectConfig;
    /** @deprecated Use `parsedCommandLine.options`. */
    compilerOptions: CompilerOptions;
}
export interface SourceFileResponse {
    /** Base64-encoded binary AST data */
    data: string;
}
export interface SourceFileMetadata {
    isDefaultLibrary: boolean;
    isFromExternalLibrary: boolean;
    packageJsonType: string;
    packageJsonDirectory: string;
    impliedNodeFormat: ModuleKind;
}
export interface SymbolResponse {
    id: number;
    /**
     * The project the symbol was first observed in. Used as the default project for
     * follow-up lookups that need a project context (e.g. members/exports), since symbols
     * are shared snapshot-wide and such lookups can vary by project.
     */
    project: Path;
    name: __String;
    flags: number;
    checkFlags: CheckFlags;
    declarations?: string[];
    valueDeclaration?: string;
    parent?: number;
    exportSymbol?: number;
}
/**
 * One exported name together with the declarations of the symbol it is exported on.
 *
 * The declarations are the symbol's own: an export specifier or an import is reported
 * as itself, not as whatever it names.
 */
export interface ExportedSymbolResponse {
    name: __String;
    declarations?: string[];
}
export interface TypeResponse {
    id: number;
    flags: number;
    objectFlags?: number;
    /** Literal value. BigInt literals are encoded as a decimal string (e.g. "-123") since JSON cannot represent bigint. Absent values are serialized as null. */
    value?: string | number | boolean | null;
    freshType?: number;
    regularType?: number;
    target?: number;
    typeParameters?: number[];
    outerTypeParameters?: number[];
    localTypeParameters?: number[];
    elementFlags?: number[];
    fixedLength?: number;
    readonly?: boolean;
    objectType?: number;
    indexType?: number;
    checkType?: number;
    extendsType?: number;
    baseType?: number;
    substConstraint?: number;
    texts?: string[];
    intrinsicName?: string;
    isThisType?: boolean;
    aliasTypeArguments?: number[];
    aliasSymbol?: number;
    symbol?: number;
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
export interface TypePredicateResponse {
    kind: number;
    parameterIndex: number;
    parameterName?: string;
    type?: TypeResponse;
}
export interface IndexInfoResponse {
    keyType: TypeResponse;
    valueType: TypeResponse;
    isReadonly?: boolean;
    declaration?: string;
}
export interface ProfileParams {
    dir: string;
}
export interface ProfileResult {
    file: string;
}
export interface CompletionEntryLabelDetailsResponse {
    detail?: string;
    description?: string;
}
export interface CompletionEntryResponse {
    name: string;
    kind?: CompletionItemKind;
    sortText?: string;
    insertText?: string;
    filterText?: string;
    detail?: string;
    labelDetails?: CompletionEntryLabelDetailsResponse;
    symbol?: SymbolResponse;
}
export interface CompletionInfoResponse {
    isIncomplete: boolean;
    entries: CompletionEntryResponse[];
}
