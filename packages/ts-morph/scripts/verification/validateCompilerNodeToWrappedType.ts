/**
 * Code Verification - Validate CompilerNodeToWrappedType
 * ------------------------------------------------------
 * This code verification validates that the CompilerNodeToWrappedType
 * type alias properly converts the passed in compiler node type to a
 * wrapped node type.
 * ------------------------------------------------------
 */
import { tsMorph } from "../deps.ts";
import { TsMorphInspector } from "../inspectors/mod.ts";
import { Problem } from "./Problem.ts";

/**
 * Wrappers the mapping cannot name, because tsgo's type graph does not
 * distinguish them from another node's.
 *
 * `NodeWithTypeArguments` adds one optional property to `TypeNode`, so the two
 * are mutually assignable and a conditional type has to pick one. It picks
 * `TypeNode`, because that is what an inferred type node actually is —
 * resolving the other way declared 14 members as `NodeWithTypeArguments` that
 * are not. Nothing is typed as `NodeWithTypeArguments` anyway: it is the base of
 * three concrete nodes, each matched by its own kind first.
 *
 * `JSDocUnknownTag` is reachable only under the kind classic TypeScript called
 * `JSDocTag`, which is the catch-all the mapping resolves to.
 */
const unmappableWrappers = new Set(["NodeWithTypeArguments", "JSDocUnknownTag"]);

export function validateCompilerNodeToWrappedType(inspector: TsMorphInspector, addProblem: (problem: Problem) => void) {
  const wrappedNodes = inspector.getWrappedNodes();
  const sourceFile = inspector.getProject().getSourceFileOrThrow("CompilerNodeToWrappedType.ts");
  const initialText = sourceFile.getFullText();

  try {
    const structures: tsMorph.TypeAliasDeclarationStructure[] = [];
    for (let i = 0; i < wrappedNodes.length; i++) {
      const wrapper = wrappedNodes[i];
      const nodes = wrapper.getAssociatedTsNodes();
      if (nodes.length === 0)
        continue;

      structures.push({
        kind: tsMorph.StructureKind.TypeAlias,
        name: `${wrapper.getName()}_test`,
        type: `CompilerNodeToWrappedType<${nodes[0].isTsMorphTsNode() ? "" : "ts."}${nodes[0].getNameForType()}>`,
      });
    }

    const addedNodes = sourceFile.addTypeAliases(structures);
    const diagnostics = sourceFile.getPreEmitDiagnostics();

    if (diagnostics.length > 0) {
      console.log(inspector.getProject().formatDiagnosticsWithColorAndContext(diagnostics));
      throw new Error("Stopping -- Compile errors in validation.");
    }

    for (const addedNode of addedNodes) {
      const typeText = addedNode.getType().getText(addedNode).replace(/\<.*\>$/, "");
      const wrapperName = addedNode.getName().replace("_test", "");
      const nodeText = "compiler." + wrapperName;
      if (typeText !== nodeText && !unmappableWrappers.has(wrapperName)) {
        addProblem({
          filePath: sourceFile.getFilePath(),
          lineNumber: sourceFile.getTypeAliasOrThrow("CompilerNodeToWrappedType").getStartLineNumber(),
          message: `Could not get wrapped type from node "${nodeText.replace("compiler.", "")}". Got "${typeText}".`,
        });
      }
    }
  } finally {
    sourceFile.replaceWithText(initialText);
  }
}
