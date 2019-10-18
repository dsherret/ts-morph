import { ts } from "../typescript";

/** Host for implementing custom module and/or type reference directive resolution. */
export interface ResolutionHost {
    resolveModuleNames?: ts.LanguageServiceHost["resolveModuleNames"];
    getResolvedModuleWithFailedLookupLocationsFromCache?: ts.LanguageServiceHost["getResolvedModuleWithFailedLookupLocationsFromCache"];
    resolveTypeReferenceDirectives?: ts.LanguageServiceHost["resolveTypeReferenceDirectives"];
}

/**
 * Factory used to create a resolution host.
 * @remarks The compiler options are retrieved via a function in order to get the project's current compiler options.
 */
export type ResolutionHostFactory = (moduleResolutionHost: ts.ModuleResolutionHost, getCompilerOptions: () => ts.CompilerOptions) => ResolutionHost;
