import * as compiler from "./../compiler";
import * as structures from "./../structures";

export function fromAbstractableNode(node: compiler.AbstractableNode): MakeRequired<structures.AbstractableNodeStructure> {
    return {
        isAbstract: node.getIsAbstract()
    };
}

export function fromAmbientableNode(node: compiler.AmbientableNode): MakeRequired<structures.AmbientableNodeStructure> {
    return {
        hasDeclareKeyword: node.hasDeclareKeyword()
    };
}

export function fromAsyncableNode(node: compiler.AsyncableNode): MakeRequired<structures.AsyncableNodeStructure> {
    return {
        isAsync: node.isAsync()
    };
}

export function fromExportableNode(node: compiler.ExportableNode): MakeRequired<structures.ExportableNodeStructure> {
    return {
        isDefaultExport: node.hasDefaultKeyword(),
        isExported: node.hasExportKeyword()
    };
}

export function fromGeneratorableNode(node: compiler.GeneratorableNode): MakeRequired<structures.GeneratorableNodeStructure> {
    return {
        isGenerator: node.isGenerator()
    };
}

export function fromReturnTypedNode(node: compiler.ReturnTypedNode): MakeRequired<structures.ReturnTypedNodeStructure> {
    const returnTypeNode = node.getReturnTypeNode();
    return {
        returnType: returnTypeNode == null ? undefined : returnTypeNode.getText()
    };
}

export function fromStaticableNode(node: compiler.StaticableNode): MakeRequired<structures.StaticableNodeStructure> {
    return {
        isStatic: node.isStatic()
    };
}

export function fromScopeableNode(node: compiler.ScopeableNode): MakeRequired<structures.ScopeableNodeStructure> {
    return {
        scope: node.getScope()
    };
}

export function fromScopedNode(node: compiler.ScopedNode): MakeRequired<structures.ScopedNodeStructure> {
    return {
        scope: node.hasScopeKeyword() ? node.getScope() : undefined
    };
}
