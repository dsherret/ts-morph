import * as ts from "typescript";
import {Node} from "./../common";
import {FunctionDeclarationOverloadStructure} from "./../../structures";
import {verifyAndGetIndex} from "./../../manipulation";
import * as fillClassFuncs from "./../../manipulation/fillClassFunctions";
import {NamedNode, ModifierableNode, ExportableNode, AmbientableNode, AsyncableNode, GeneratorableNode, BodyableNode} from "./../base";
import {StatementedNode} from "./../statement";
import {NamespaceChildableNode} from "./../namespace";
import {FunctionLikeDeclaration} from "./FunctionLikeDeclaration";
import {OverloadableNode} from "./OverloadableNode";

export const FunctionDeclarationBase = OverloadableNode(AsyncableNode(GeneratorableNode(FunctionLikeDeclaration(StatementedNode(AmbientableNode(
    NamespaceChildableNode(ExportableNode(ModifierableNode(BodyableNode(NamedNode(Node)))))
))))));
export class FunctionDeclaration extends FunctionDeclarationBase<ts.FunctionDeclaration> {
    /**
     * Adds a function overload.
     * @param structure - Structure of the overload.
     */
    addOverload(structure: FunctionDeclarationOverloadStructure) {
        return this.addOverloads([structure])[0];
    }

    /**
     * Adds function overloads.
     * @param structures - Structures of the overloads.
     */
    addOverloads(structures: FunctionDeclarationOverloadStructure[]) {
        return this.insertOverloads(this.getOverloads().length, structures);
    }

    /**
     * Inserts a function overload.
     * @param index - Index to insert.
     * @param structure - Structure of the overload.
     */
    insertOverload(index: number, structure: FunctionDeclarationOverloadStructure) {
        return this.insertOverloads(index, [structure])[0];
    }

    /**
     * Inserts function overloads.
     * @param index - Index to insert.
     * @param structure - Structures of the overloads.
     */
    insertOverloads(index: number, structures: FunctionDeclarationOverloadStructure[]) {
        const overloads = this.getOverloads();
        const overloadsCount = overloads.length;
        index = verifyAndGetIndex(index, overloadsCount);

        const parent = this.getParentOrThrow() as any as StatementedNode;
        const indentationText = this.getIndentationText();
        const thisName = this.getName();
        const texts = structures.map(structure => `${indentationText}function ${thisName}();`);
        const firstIndex = overloads.length > 0 ? overloads[0].getChildIndex() : this.getChildIndex();
        const mainIndex = firstIndex + index;

        const newChildren = parent._insertMainChildren<FunctionDeclaration>(mainIndex, texts, structures, ts.SyntaxKind.FunctionDeclaration, (child, i) => {
            fillClassFuncs.fillFunctionDeclarationOverloadFromStructure(child, structures[i]);
        }, {
            previousBlanklineWhen: () => index == 0,
            nextBlanklineWhen: () => false,
            separatorNewlineWhen: () => false
        });

        return newChildren;
    }
}
