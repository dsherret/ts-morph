/**
 * Result of refreshing a source file from the file system.
 */
export enum FileSystemRefreshResult {
    /** The source file did not change. */
    NoChange,
    /** The source file was updated from the file system. */
    Updated,
    /** The source file was deleted. */
    Deleted
}
