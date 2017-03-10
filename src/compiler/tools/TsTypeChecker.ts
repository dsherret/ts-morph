import * as ts from "typescript";
import {TsEnumMemberDeclaration} from "./../enum";

/**
 * Wrapper around the TypeChecker.
 */
export class TsTypeChecker {
    constructor(private readonly typeChecker: ts.TypeChecker) {
    }

    /**
     * Gets the compiler's TypeChecker.
     */
    getCompilerTypeChecker() {
        return this.typeChecker;
    }

    /**
     * Gets the constant value of a declaration.
     * @param node - Node to get the constant value from.
     */
    getConstantValue(node: TsEnumMemberDeclaration) {
        return this.typeChecker.getConstantValue(node.getCompilerNode());
    }
}
