import { AmbientableNodeStructure, AsyncableNodeStructure, ExportableNodeStructure, GeneratorableNodeStructure,
    JSDocableNodeStructure, SignaturedDeclarationStructure, TypeParameteredNodeStructure } from "../base";
import { StatementedNodeStructure } from "../statement";

export interface ArrowFunctionStructure
    extends ArrowFunctionSpecificStructure, TypeParameteredNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure,
    StatementedNodeStructure, AsyncableNodeStructure, ExportableNodeStructure, ExportableNodeStructure {
}

export interface ArrowFunctionSpecificStructure {
    singleBodyExpression?: string;
}