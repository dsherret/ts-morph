import {MixinViewModel} from "./../view-models";

export function isAllowedMixin(mixin: MixinViewModel) {
    switch (mixin.name) {
        case "ModifierableNode":
        case "NamedNode":
        case "PropertyNamedNode":
        case "DeclarationNamedNode":
        case "BindingNamedNode":
        case "HeritageClauseableNode":
        case "NamespaceChildableNode":
        case "OverloadableNode":
        case "TextInsertableNode":
            return false;
        default:
            return true;
    }
}
