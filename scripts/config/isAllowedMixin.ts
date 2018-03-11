export function isAllowedMixin(name: string) {
    switch (name) {
        case "ModifierableNode":
        case "NamedNode":
        case "PropertyNamedNode":
        case "DeclarationNamedNode":
        case "BindingNamedNode":
        case "HeritageClauseableNode":
        case "NamespaceChildableNode":
        case "OverloadableNode":
        case "TextInsertableNode":
        case "UnwrappableNode":
        case "ChildOrderableNode":
        case "InitializerGetExpressionableNode":
        case "ExpressionedNode":
            return false;
        default:
            return true;
    }
}
