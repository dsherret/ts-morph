import {NamedStructure, ReturnTypedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure, ScopedNodeStructure,
    AsyncableNodeStructure, GeneratorableNodeStructure} from "./../base";
import {FunctionLikeDeclarationStructure} from "./../function";

export interface MethodDeclarationStructure
    extends NamedStructure, ReturnTypedNodeStructure, StaticableNodeStructure, DecoratableNodeStructure, AbstractableNodeStructure,
        ScopedNodeStructure, AsyncableNodeStructure, GeneratorableNodeStructure, FunctionLikeDeclarationStructure
{
}
