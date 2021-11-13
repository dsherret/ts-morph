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

const denoResolutionHostFactory: ResolutionHostFactory = (moduleResolutionHost, getCompilerOptions) => {
  return {
    resolveModuleNames: (moduleNames, containingFile) => {
      const compilerOptions = getCompilerOptions();
      const resolvedModules: ts.ResolvedModule[] = [];

      for (const moduleName of moduleNames.map(removeTsExtension)) {
        const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
        if (result.resolvedModule)
          resolvedModules.push(result.resolvedModule);
      }

      return resolvedModules;
    },
  };

  function removeTsExtension(moduleName: string) {
    if (moduleName.slice(-3).toLowerCase() === ".ts")
      return moduleName.slice(0, -3);
    return moduleName;
  }
};

/** Collection of reusable resolution hosts. */
export const ResolutionHosts = {
  deno: denoResolutionHostFactory,
};
