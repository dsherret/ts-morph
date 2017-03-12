import * as ts from "typescript";
import {EnumMemberDeclaration} from "./../enum";

/**
 * Wrapper around the TypeChecker.
 */
export class TypeChecker {
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
    getConstantValue(node: EnumMemberDeclaration) {
        return this.typeChecker.getConstantValue(node.getCompilerNode());
    }
}
