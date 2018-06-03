/**
 * Code Manipulation - Create compiler node to wrapper mappings
 * ------------------------------------------------------------
 * This creates the compilerNodeToWrapperMappings.ts file.
 * ------------------------------------------------------------
 */
import { ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, MethodSignature, MethodSignatureStructure, JSDocStructure,
    ParameterDeclarationStructure, SourceFile, InterfaceDeclaration, TypeGuards, SyntaxKind } from "ts-simple-ast";
import { hasDescendantBaseType } from "./common";
import { TsSimpleAstInspector } from "./inspectors";

// this can go away once conditional types are well supported (maybe a few versions after)

export function createCompilerNodeToWrapperMappings(inspector: TsSimpleAstInspector) {
    const project = inspector.getProject();
    const kindToNodeMappingsFile = project.getSourceFileOrThrow("compilerNodeToWrapperMappings.ts");
    const wrappedNodes = inspector.getWrappedNodes();
    kindToNodeMappingsFile.removeText();

    // add imports
    kindToNodeMappingsFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/compiler/index.ts"))
    });
    kindToNodeMappingsFile.addImportDeclaration({
        namedImports: ["ts"],
        moduleSpecifier: kindToNodeMappingsFile.getRelativePathAsModuleSpecifierTo(project.getSourceFileOrThrow("src/typescript/index.ts"))
    });

    // create the type
    kindToNodeMappingsFile.addTypeAlias({
        isExported: true,
        name: "CompilerNodeToWrapperMappings",
        typeParameters: [{ name: "T", constraint: "ts.Node" }],
        type: writer => {
            let isFirst = true;
            for (const wrapper of wrappedNodes) {
                const nodes = wrapper.getAssociatedTsNodes();
                if (nodes.length === 0 || wrapper.hasParent())
                    continue;
                if (isFirst)
                    isFirst = false;
                else
                    writer.newLine().indent();
                writer.write(`[T] extends [ts.${nodes[0].getName()}] ? compiler.${wrapper.getName()} :`);
            }
            writer.write(" compiler.Node<T>");
        }
    });

    kindToNodeMappingsFile.insertText(0, writer =>
        writer.writeLine("// DO NOT EDIT - Automatically maintained by createCompilerNodeToWrapperMappings.ts"));
}
