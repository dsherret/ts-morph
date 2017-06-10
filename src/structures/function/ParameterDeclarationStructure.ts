import {NamedStructure, TypedStructure, ReadonlyableStructure, DecoratableStructure} from "./../base";

export interface ParameterDeclarationStructure extends NamedStructure, TypedStructure, ReadonlyableStructure, DecoratableStructure {
    isRestParameter?: boolean;
}
