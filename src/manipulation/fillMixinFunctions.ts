import * as compiler from "./../compiler";
import * as structures from "./../structures";

export function fillAbstractableNodeFromStructure(node: compiler.AbstractableNode, structure: structures.AbstractableStructure) {
    if (structure.isAbstract != null)
        node.setIsAbstract(structure.isAbstract);
}

export function fillAmbientableNodeFromStructure(node: compiler.AmbientableNode, structure: structures.AmbientableStructure) {
    if (structure.hasDeclareKeyword != null)
        node.toggleDeclareKeyword(structure.hasDeclareKeyword);
}

export function fillAsyncableNodeFromStructure(node: compiler.AsyncableNode, structure: structures.AsyncableStructure) {
    if (structure.isAsync != null)
        node.setIsAsync(structure.isAsync);
}

export function fillExportableNodeFromStructure(node: compiler.ExportableNode, structure: structures.ExportableStructure) {
    if (structure.isExported != null)
        node.setIsExported(structure.isExported);
    if (structure.isDefaultExport != null)
        node.setIsDefaultExport(structure.isDefaultExport);
}

export function fillGeneratorableNodeFromStructure(node: compiler.GeneratorableNode, structure: structures.GeneratorableStructure) {
    if (structure.isGenerator != null)
        node.setIsGenerator(structure.isGenerator);
}

export function fillInitializerExpressionableNodeFromStructure(
    node: compiler.InitializerExpressionableNode,
    structure: structures.InitializerExpressionableStructure
) {
    if (structure.initializer != null)
        node.setInitializer(structure.initializer);
}

export function fillQuestionTokenableNodeFromStructure(node: compiler.QuestionTokenableNode, structure: structures.QuestionTokenableStructure) {
    if (structure.hasQuestionToken != null)
        node.setIsOptional(structure.hasQuestionToken);
}

export function fillReadonlyableNodeFromStructure(node: compiler.ReadonlyableNode, structure: structures.ReadonlyableStructure) {
    if (structure.isReadonly != null)
        node.setIsReadonly(structure.isReadonly);
}

export function fillScopeableNodeFromStructure(node: compiler.ScopeableNode, structure: structures.ScopeableStructure) {
    if (structure.scope != null)
        node.setScope(structure.scope);
}

export function fillScopedNodeFromStructure(node: compiler.ScopedNode, structure: structures.ScopedStructure) {
    if (structure.scope != null)
        node.setScope(structure.scope);
}

export function fillStaticableNodeFromStructure(node: compiler.StaticableNode, structure: structures.StaticableStructure) {
    if (structure.isStatic != null)
        node.setIsStatic(structure.isStatic);
}

export function fillTypedNodeFromStructure(node: compiler.TypedNode, structure: structures.TypedStructure) {
    if (structure.type != null)
        node.setType(structure.type);
}

export function fillImplementsClauseableNodeFromStructure(
    node: compiler.ImplementsClauseableNode,
    structure: structures.ImplementsClauseableStructure
) {
    if (structure.implements != null && structure.implements.length > 0)
        node.addImplements(structure.implements);
}

export function fillExtendsClauseableNodeFromStructure(
    node: compiler.ExtendsClauseableNode,
    structure: structures.ExtendsClauseableStructure
) {
    if (structure.extends != null && structure.extends.length > 0)
        node.addExtends(structure.extends);
}

export function fillTypeParameteredNodeFromStructure(
    node: compiler.TypeParameteredNode,
    structure: structures.TypeParameteredStructure
) {
    if (structure.typeParameters != null && structure.typeParameters.length > 0)
        node.addTypeParameters(structure.typeParameters);
}

export function fillDecoratableNodeFromStructure(
    node: compiler.DecoratableNode,
    structure: structures.DecoratableStructure
) {
    if (structure.decorators != null && structure.decorators.length > 0)
        node.addDecorators(structure.decorators);
}

export function fillDocumentationableNodeFromStructure(
    node: compiler.DocumentationableNode,
    structure: structures.DocumentationableStructure
) {
    if (structure.docs != null && structure.docs.length > 0)
        node.addDocs(structure.docs);
}

export function fillReturnTypedNodeFromStructure(node: compiler.ReturnTypedNode, structure: structures.ReturnTypedStructure) {
    if (structure.returnType != null)
        node.setReturnType(structure.returnType);
}

export function fillParameteredNodeFromStructure(
    node: compiler.ParameteredNode,
    structure: structures.ParameteredStructure
) {
    if (structure.parameters != null && structure.parameters.length > 0)
        node.addParameters(structure.parameters);
}
