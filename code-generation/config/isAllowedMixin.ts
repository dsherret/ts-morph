import {MixinViewModel} from "./../view-models";

export function isAllowedMixin(mixin: MixinViewModel) {
    switch (mixin.name) {
        case "ModifierableNode":
        case "NamedNode":
        case "PropertyNamedNode":
        case "DeclarationNamedNode":
        case "BindingNamedNode":
        case "HeritageClauseableNode":
        case "FollowingCommableNode":
        case "BodiedNode":
        case "BodyableNode":
            return false;
        default:
            return true;
    }
}
