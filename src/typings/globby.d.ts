declare module "globby" {
    namespace Globby {
        export interface GlobbyOptions {
            cwd?: string;
            absolute?: boolean;
        }
        export function sync(patterns: string[], options?: GlobbyOptions): string[];
    }
    export = Globby;
}
