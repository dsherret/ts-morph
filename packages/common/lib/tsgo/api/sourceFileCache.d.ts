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
    /** How many (snapshot, project) pairs resolved a path to this entry */
    refCount: number;
}
/**
 * Client-side cache for source files keyed by (path, parseOptionsKey, contentHash).
 *
 * Supports multiple versions of the same file at the same path (e.g., from
 * different snapshots with different file contents). Each version is identified
 * by its content hash and parse options key.
 *
 * What each (snapshot, project) pair resolved a path to is held in a scope of its
 * own, and an entry lives as long as some scope points at it. When a snapshot is
 * disposed, its scopes are dropped and entries nothing else points at are evicted.
 *
 * A new snapshot inherits the scopes of the one before it, minus the files the
 * server reported changed. That inheritance is recorded rather than carried out —
 * see {@link retainForSnapshot} — because the usual next thing to happen is that the
 * previous snapshot is released, and then the scope can be handed over whole rather
 * than copied a file at a time.
 */
export declare class SourceFileCache {
    /** Map from path to all cached versions of that file */
    private cache;
    /** Map from snapshotId to (projectId → what that pair resolved each path to) */
    private scopes;
    /** The one retain whose scopes have not been settled yet, if any */
    private pending;
    /**
     * Get a cached source file already retained for the given (snapshot, project) pair.
     * This does not require a content hash or parse options key — it returns the entry
     * if the pair resolved this path to one. Used to skip the server request entirely
     * when retainForSnapshot has already carried the entry over.
     */
    getRetained(path: Path, snapshotId: number, projectId: string): SourceFile | undefined;
    /**
     * Store a source file in the cache and retain it for the given (snapshot, project) pair.
     * Returns the cached file — which may be an existing entry if the hash matches.
     */
    set(path: Path, file: SourceFile, parseOptionsKey: string, contentHash: string, snapshotId: number, projectId: string): SourceFile;
    /**
     * Offers a source file the client parsed itself as the cache's copy for a path,
     * without retaining it for any (snapshot, project) pair.
     *
     * This is how a tree from `API#parseSourceFile` becomes the *same object* the
     * program later answers with. It has to be the same object: a caller that holds a
     * node from one tree and a node from another for the same path holds two nodes that
     * are equal in every way except identity, and identity is what a client keying its
     * own bookkeeping off nodes has to rely on.
     *
     * Offered rather than retained because nothing here knows the program took the file
     * at that text — the client wrote it, the compiler has not been asked yet, and its
     * parse options are the ones the *previous* snapshot would have given it. So the
     * fetch still happens, and it is the server's own hash and parse options key that
     * decide: {@link set} hands back this entry when they match what came over the wire,
     * and ignores it when they do not. A wrong offer costs nothing but the entry.
     *
     * At most one un-retained offer is kept per path — a later one replaces it — so an
     * editing loop that never reads a file back through a program does not accumulate a
     * version per edit.
     */
    offer(path: Path, file: SourceFile, parseOptionsKey: string, contentHash: string): void;
    /**
     * Retain cache entries from a previous snapshot for a new snapshot.
     * For each project in the previous snapshot:
     *   - Removed projects: retain nothing.
     *   - Changed projects: retain everything but the files in changedFiles/deletedFiles.
     *   - Unchanged projects: retain everything.
     *
     * Only the changes are read here. Which of the two ways that inheritance is
     * settled — handed over or copied — depends on what becomes of the previous
     * snapshot next, so this records it and {@link releaseSnapshot} settles it.
     */
    retainForSnapshot(newSnapshotId: number, previousSnapshotId: number, changes: SnapshotChanges | undefined): void;
    /**
     * Release everything the given snapshot retained across all projects.
     * Entries with no remaining references are evicted.
     */
    releaseSnapshot(snapshotId: number): void;
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
    /**
     * Gives the previous snapshot's scopes to the new one outright, which is what the
     * inheritance comes to when nothing else can read them: the new snapshot is the
     * only one left that answers from them, and the paths it may not answer from are
     * exactly the ones the server reported changed.
     */
    private handOverPending;
    /**
     * Copies what the new snapshot stood to inherit, which is what the inheritance
     * comes to when both snapshots are going to go on being read.
     */
    private flushPending;
    private releaseEntry;
    /** What a (snapshot, project) pair resolved each path it asked for to, created if new. */
    private scopeFor;
}
