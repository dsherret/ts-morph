import { expect } from "chai";
import { getEmitModuleResolutionKind, ModuleKind, ModuleResolutionKind, ScriptTarget } from "../../typescript";

describe("tsInternal", () => {
  describe("getEmitModuleResolutionKind", () => {
    function doTest(
      moduleResolution: ModuleResolutionKind | undefined,
      module: ModuleKind | undefined,
      target: ScriptTarget | undefined,
      expectedKind: ModuleResolutionKind,
    ) {
      const moduleResolutionText = moduleResolution == null ? "no module resolution" : ModuleResolutionKind[moduleResolution];
      const moduleText = module == null ? "no module" : ModuleKind[module];
      const scriptTargetText = target == null ? "no target" : ScriptTarget[target];
      it(`should have the expected result for ${moduleResolutionText}, ${moduleText}, and ${scriptTargetText}`, () => {
        const compilerOptions = { moduleResolution, module, target };
        expect(ModuleResolutionKind[getEmitModuleResolutionKind(compilerOptions)]).to.equal(ModuleResolutionKind[expectedKind]);
      });
    }

    const getAllModules = () => [undefined, ...Object.keys(ModuleKind).map(key => (ModuleKind as any)[key]).filter(value => typeof value === "number")];
    const getAllTargets = () => [undefined, ...Object.keys(ModuleKind).map(key => (ModuleKind as any)[key]).filter(value => typeof value === "number")];

    for (const module of getAllModules()) {
      for (const target of getAllTargets()) {
        doTest(ModuleResolutionKind.NodeJs, module, target, ModuleResolutionKind.NodeJs);
        doTest(ModuleResolutionKind.Classic, module, target, ModuleResolutionKind.Classic);
      }
    }

    for (const target of getAllTargets()) {
      doTest(undefined, ModuleKind.None, target, ModuleResolutionKind.Classic);
      doTest(undefined, ModuleKind.CommonJS, target, ModuleResolutionKind.Bundler);
      doTest(undefined, ModuleKind.AMD, target, ModuleResolutionKind.Classic);
      doTest(undefined, ModuleKind.UMD, target, ModuleResolutionKind.Classic);
      doTest(undefined, ModuleKind.System, target, ModuleResolutionKind.Classic);
      doTest(undefined, ModuleKind.ES2015, target, ModuleResolutionKind.Bundler);
      doTest(undefined, ModuleKind.ESNext, target, ModuleResolutionKind.Bundler);
    }

    doTest(undefined, undefined, undefined, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES3, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES5, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES2015, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES2016, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES2017, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ES2018, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.ESNext, ModuleResolutionKind.Bundler);
    doTest(undefined, undefined, ScriptTarget.Latest, ModuleResolutionKind.Bundler);
  });
});
