import type { Path, SourceFile } from "../ast/index";
import type { SnapshotChanges } from "./proto";
/**
 * A cached source file entry, identified by content hash.
 */
export interface CachedSourceFile {
    /** The cached source file object */
    file: SourceFile;
    /** The content hash from the server */
    contentHash: string;
    /** The parse options key that was used to create this file */
    parseOptionsKey: string;
    /** Set of snapshot/project or direct-lease ref keys that reference this entry */
    refs: Set<string>;
}
/**
 * Client-side cache for source files keyed by (path, fileName, scriptKind, parseOptionsKey, contentHash).
 *
 * Supports multiple versions of the same file at the same path (e.g., from
 * different snapshots with different file contents). Each version is identified
 * by its script kind, content hash, and parse options key.
 *
 * Entries are ref-counted by (snapshot, project) pairs and direct source-file
 * leases. Releasing an owner evicts entries with no remaining references.
 *
 * When a new snapshot is created, unchanged cache entries from the previous
 * snapshot are retained per-project. Only files within changed or removed
 * projects are invalidated.
 */
export declare class SourceFileCache {
    /** Map from path to all cached versions of that file */
    private cache;
    /** Map from snapshotId to (projectId → Set of paths fetched through that project) */
    private snapshotProjectPaths;
    /** Map from direct lease ID to its retained path */
    private leasePaths;
    /**
     * Get a cached source file already retained for the given (snapshot, project) pair.
     * This does not require a content hash or parse options key — it returns the entry
     * if one exists with a matching ref. Used to skip the server request entirely when
     * retainForSnapshot has already carried over the ref.
     *
     * A given (snapshot, project) pair always parses a file the same way, so there is
     * at most one matching entry per ref.
     */
    getRetained(path: Path, snapshotId: number, projectId: string): SourceFile | undefined;
    /**
     * Store a source file in the cache and retain it for the given (snapshot, project) pair.
     * Returns the cached file — which may be an existing entry if the hash matches.
     */
    set(path: Path, file: SourceFile, parseOptionsKey: string, contentHash: string, snapshotId: number, projectId: string): SourceFile;
    /**
     * Store a source file in the cache and retain it for a direct lease.
     * Returns the cached file so leased and program-owned files share identity.
     */
    setForLease(path: Path, file: SourceFile, parseOptionsKey: string, contentHash: string, leaseId: number): SourceFile;
    /**
     * Retains the entry already cached for a path whose parse options and content hash
     * match, for the given (snapshot, project) pair, and answers with its tree.
     *
     * What it buys is that the tree does not have to be fetched to be compared with: the
     * server is asked for those two values rather than the whole source file, and the
     * judgement is the same one {@link set} would have made on arrival. Returns undefined
     * when nothing cached matches, which is when the caller has to go and fetch one.
     */
    retainMatching(path: Path, parseOptionsKey: string, contentHash: string, snapshotId: number, projectId: string): SourceFile | undefined;
    private setWithRef;
    /**
     * Retain cache entries from a previous snapshot for a new snapshot.
     * For each project in the previous snapshot:
     *   - Removed projects: skip (don't retain any refs).
     *   - Changed projects: retain refs for files not listed in changedFiles/deletedFiles.
     *   - Unchanged projects: retain all refs.
     */
    retainForSnapshot(newSnapshotId: number, previousSnapshotId: number, changes: SnapshotChanges | undefined): void;
    /**
     * Release all entries retained by the given snapshot across all projects.
     * Only visits paths that the snapshot actually referenced.
     * Entries with no remaining refs are evicted.
     */
    releaseSnapshot(snapshotId: number): void;
    releaseLease(leaseId: number): void;
    /**
     * Drops `ref` from every cached version of `path` except `keep`.
     *
     * One ref resolves a path to one file: an owner that moves to a new version has to
     * stop pointing at the old one, or {@link getRetained} can answer with whichever of
     * the two it happens to find first. The array is left in place, empty if need be,
     * because the caller is about to add to it.
     */
    private dropOtherRefs;
    private releaseRef;
    private trackPath;
    /**
     * Clear all entries from the cache.
     */
    clear(): void;
    /**
     * Get the number of unique paths in the cache.
     */
    get size(): number;
    /**
     * Check if a path is in the cache.
     */
    has(path: Path): boolean;
}
