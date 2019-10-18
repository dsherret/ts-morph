// Type definitions for to-absolute-glob 2.0
// Project: https://github.com/jonschlinkert/to-absolute-glob
// Definitions by: Klaus Meinhardt <https://github.com/ajafff>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "@dsherret/to-absolute-glob" {
    function toAbsoluteGlob(pattern: string, options?: toAbsoluteGlob.Options): string;
    namespace toAbsoluteGlob {
        interface Options {
            cwd?: string;
            root?: string;
        }
    }
    export = toAbsoluteGlob;
}
