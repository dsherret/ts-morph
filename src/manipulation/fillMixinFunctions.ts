import * as compiler from "./../compiler";
import * as structures from "./../structures";

export function fillAbstractableNodeFromStructure(sourceFile: compiler.SourceFile, node: compiler.AbstractableNode, structure: structures.AbstractableStructure) {
    if (structure.isAbstract != null)
        node.setIsAbstract(structure.isAbstract, sourceFile);
}

export function fillAmbientableNodeFromStructure(sourceFile: compiler.SourceFile, node: compiler.AmbientableNode, structure: structures.AmbientableStructure) {
    if (structure.hasDeclareKeyword != null)
        node.toggleDeclareKeyword(structure.hasDeclareKeyword, sourceFile);
}

export function fillAsyncableNodeFromStructure(sourceFile: compiler.SourceFile, node: compiler.AsyncableNode, structure: structures.AsyncableStructure) {
    if (structure.isAsync != null)
        node.setIsAsync(structure.isAsync, sourceFile);
}

export function fillExportableNodeFromStructure(sourceFile: compiler.SourceFile, node: compiler.ExportableNode, structure: structures.ExportableStructure) {
    if (structure.isExported != null)
        node.setIsExported(structure.isExported, sourceFile);
    if (structure.isDefaultExport != null)
        node.setIsDefaultExport(structure.isDefaultExport, sourceFile);
}

export function fillGeneratorableNodeFromStructure(sourceFile: compiler.SourceFile, node: compiler.GeneratorableNode, structure: structures.GeneratorableStructure) {
    if (structure.isGenerator != null)
        node.setIsGenerator(structure.isGenerator, sourceFile);
}
