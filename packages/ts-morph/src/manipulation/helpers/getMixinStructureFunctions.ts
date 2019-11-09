import * as compiler from "../../compiler";
import * as structures from "../../structures";

export function fromAbstractableNode(node: compiler.AbstractableNode): MakeRequired<structures.AbstractableNodeStructure> {
    return {
        isAbstract: node.isAbstract()
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

export function fromAwaitableNode(node: compiler.AwaitableNode): MakeRequired<structures.AwaitableNodeStructure> {
    return {
        isAwaited: node.isAwaited()
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
        returnType: returnTypeNode?.getText()
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

export function fromExtendsClauseableNode(node: compiler.ExtendsClauseableNode): MakeRequired<structures.ExtendsClauseableNodeStructure> {
    const exts = node.getExtends();
    return {
        extends: exts.length === 0 ? undefined : exts.map(e => e.getText())
    };
}

export function fromImplementsClauseableNode(node: compiler.ImplementsClauseableNode): MakeRequired<structures.ImplementsClauseableNodeStructure> {
    const implementsNodes = node.getImplements();
    return {
        implements: implementsNodes.length === 0 ? undefined : implementsNodes.map(e => e.getText())
    };
}

export function fromQuestionTokenableNode(node: compiler.QuestionTokenableNode): MakeRequired<structures.QuestionTokenableNodeStructure> {
    return {
        hasQuestionToken: node.hasQuestionToken()
    };
}

export function fromReadonlyableNode(node: compiler.ReadonlyableNode): MakeRequired<structures.ReadonlyableNodeStructure> {
    return {
        isReadonly: node.isReadonly()
    };
}

export function fromTypedNode(node: compiler.TypedNode): MakeRequired<structures.TypedNodeStructure> {
    const typeNode = node.getTypeNode();
    return {
        type: typeNode?.getText()
    };
}

export function fromInitializerExpressionableNode(
    node: compiler.InitializerExpressionableNode
): MakeRequired<structures.InitializerExpressionableNodeStructure> {
    const initializer = node.getInitializer();
    return {
        initializer: initializer?.getText()
    };
}

export function fromNamedNode(node: compiler.NamedNode): MakeRequired<structures.NamedNodeStructure> {
    return {
        name: node.getName()
    };
}
