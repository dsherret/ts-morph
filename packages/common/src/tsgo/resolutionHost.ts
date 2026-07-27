/**
 * Custom module resolution.
 *
 * The compiler asks the host where a specifier points before resolving it
 * itself, and believes the answer. That is how a project can resolve by rules
 * the compiler does not implement — Deno's, an import map's, a monorepo's.
 *
 * Breaking change against the `typescript` package's `ResolutionHost`: a host
 * answers one specifier at a time rather than an array of them, because that is
 * how the compiler asks; there is no `getResolvedModuleWithFailedLookupLocations-
 * FromCache`, since the compiler owns the cache; and type reference directives
 * are not covered — they resolve down a separate path in the compiler that has
 * no hook yet.
 */
import type { CompilerOptions } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/compilerOptions.js";
import type { ModuleNameResolver, ResolvedModuleName } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/options.js";

export type { ResolvedModuleName };

/** What a host is told about a specifier it is asked to resolve. */
export interface ModuleResolutionRequest {
  /** The specifier as written, e.g. `./mod.ts` or `lodash`. */
  moduleName: string;
  /** The file the specifier was written in. */
  containingFile: string;
}

/**
 * How a host answers.
 *
 * Returning nothing declines the question and leaves the specifier to the
 * compiler, so a host that only handles some specifiers says nothing about the
 * rest.
 */
export type ModuleResolutionAnswer =
  /** Resolve to this file. */
  | { resolvedFileName: string }
  /** Resolve to nothing, and do not let the compiler try. */
  | { resolvedFileName: null }
  /** Resolve this specifier instead, using the compiler's own rules. */
  | { moduleName: string }
  | undefined;

/** Resolves module specifiers in place of the compiler. */
export interface ResolutionHost {
  resolveModuleName?(request: ModuleResolutionRequest): ModuleResolutionAnswer;
}

/**
 * Creates a resolution host for a project.
 *
 * The compiler options are given as a function because a project's options can
 * change after it is created, and a host that reads them wants the current ones.
 */
export type ResolutionHostFactory = (getCompilerOptions: () => CompilerOptions) => ResolutionHost;

/**
 * Ready-made resolution hosts.
 *
 * `deno` is for Deno-style code, which writes the extension node omits. It
 * rewrites rather than resolves: dropping `.ts` says where to look, and the
 * compiler still decides how.
 */
export const ResolutionHosts = {
  deno: (): ResolutionHost => ({
    resolveModuleName: ({ moduleName }) => {
      if (!moduleName.toLowerCase().endsWith(".ts"))
        return undefined;
      const stripped = moduleName.slice(0, -".ts".length);
      // a bare ".ts" strips to nothing, and an empty rewrite is indistinguishable
      // from no rewrite on the wire, so leave it to the compiler to reject
      return stripped === "" ? undefined : { moduleName: stripped };
    },
  }),
} satisfies Record<string, ResolutionHostFactory>;

/**
 * Adapts a {@link ResolutionHost} to the resolver the tsgo client takes.
 *
 * Returns undefined when the host resolves nothing, so a project that was given
 * a host with no `resolveModuleName` does not pay a callback per specifier.
 */
export function toModuleNameResolver(host: ResolutionHost | undefined): ModuleNameResolver | undefined {
  const resolve = host?.resolveModuleName;
  if (resolve == null)
    return undefined;

  return request => {
    const answer = resolve.call(host, { moduleName: request.moduleName, containingFile: request.containingFile });
    if (answer == null)
      return undefined;
    if ("moduleName" in answer)
      return { moduleName: answer.moduleName };
    return { resolved: answer.resolvedFileName == null ? null : { resolvedFileName: answer.resolvedFileName } };
  };
}
