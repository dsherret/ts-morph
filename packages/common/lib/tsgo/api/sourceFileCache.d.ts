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
    /** Set of (snapshot, project) ref keys that reference this entry */
    refs: Set<string>;
}
/**
 * Client-side cache for source files keyed by (path, parseOptionsKey, contentHash).
 *
 * Supports multiple versions of the same file at the same path (e.g., from
 * different snapshots with different file contents). Each version is identified
 * by its content hash and parse options key.
 *
 * Entries are ref-counted by (snapshot, project) pairs. When a snapshot is
 * disposed, all refs for that snapshot across all projects are released,
 * and entries with no remaining references are evicted.
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
//# sourceMappingURL=sourceFileCache.d.ts.map