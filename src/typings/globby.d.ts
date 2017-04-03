declare module "globby" {
    namespace Globby {
        export function sync(patterns: string[]): string[];
    }
    export = Globby;
}
