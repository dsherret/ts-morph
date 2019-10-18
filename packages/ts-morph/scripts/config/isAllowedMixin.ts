export function isAllowedMixin(name: string) {
    switch (name) {
        case "ModifierableNode":
        case "NamedNode":
        case "PropertyNamedNode":
        case "BindingNamedNode":
        case "HeritageClauseableNode":
        case "NamespaceChildableNode":
        case "OverloadableNode":
        case "TextInsertableNode":
        case "UnwrappableNode":
        case "ChildOrderableNode":
        case "InitializerExpressionGetableNode":
        case "ExpressionedNode":
        case "BodiedNode":
        case "BodyableNode":
        case "ModuledNode":
            return false;
        default:
            return true;
    }
}
