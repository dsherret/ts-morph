import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { CommaSeparatedStructuresPrinter } from "../../../structurePrinters";
import { VariableDeclarationStructure, OptionalKind } from "../../../structures";
import { ModifierableNode } from "../base";
import { Node } from "../common";
import { VariableDeclaration } from "./VariableDeclaration";
import { VariableDeclarationKind } from "./VariableDeclarationKind";

export const VariableDeclarationListBase = ModifierableNode(Node);
export class VariableDeclarationList extends VariableDeclarationListBase<ts.VariableDeclarationList> {
    /**
     * Get the variable declarations.
     */
    getDeclarations(): VariableDeclaration[] {
        return this.compilerNode.declarations.map(d => this._getNodeFromCompilerNode(d));
    }

    /**
     * Gets the variable declaration kind.
     */
    getDeclarationKind(): VariableDeclarationKind {
        const nodeFlags = this.compilerNode.flags;

        if (nodeFlags & ts.NodeFlags.Let)
            return VariableDeclarationKind.Let;
        else if (nodeFlags & ts.NodeFlags.Const)
            return VariableDeclarationKind.Const;
        else
            return VariableDeclarationKind.Var;
    }

    /**
     * Gets the variable declaration kind keyword.
     */
    getDeclarationKindKeyword(): Node {
        const declarationKind = this.getDeclarationKind();
        switch (declarationKind) {
            case VariableDeclarationKind.Const:
                return this.getFirstChildByKindOrThrow(SyntaxKind.ConstKeyword);
            case VariableDeclarationKind.Let:
                return this.getFirstChildByKindOrThrow(SyntaxKind.LetKeyword);
            case VariableDeclarationKind.Var:
                return this.getFirstChildByKindOrThrow(SyntaxKind.VarKeyword);
            default:
                return errors.throwNotImplementedForNeverValueError(declarationKind);
        }
    }

    /**
     * Sets the variable declaration kind.
     * @param type - Type to set.
     */
    setDeclarationKind(type: VariableDeclarationKind) {
        if (this.getDeclarationKind() === type)
            return this;

        const keyword = this.getDeclarationKindKeyword();
        insertIntoParentTextRange({
            insertPos: keyword.getStart(),
            newText: type,
            parent: this,
            replacing: {
                textLength: keyword.getWidth()
            }
        });

        return this;
    }

    /**
     * Add a variable declaration to the statement.
     * @param structure - Structure representing the variable declaration to add.
     */
    addDeclaration(structure: OptionalKind<VariableDeclarationStructure>) {
        return this.addDeclarations([structure])[0];
    }

    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
        return this.insertDeclarations(this.getDeclarations().length, structures);
    }

    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: OptionalKind<VariableDeclarationStructure>) {
        return this.insertDeclarations(index, [structure])[0];
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: ReadonlyArray<OptionalKind<VariableDeclarationStructure>>) {
        const writer = this._getWriterWithQueuedChildIndentation();
        const structurePrinter = new CommaSeparatedStructuresPrinter(this._context.structurePrinterFactory.forVariableDeclaration());
        const originalChildrenCount = this.compilerNode.declarations.length;

        index = verifyAndGetIndex(index, originalChildrenCount);

        structurePrinter.printText(writer, structures);

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
            currentNodes: this.getDeclarations(),
            insertIndex: index,
            newText: writer.toString(),
            useTrailingCommas: false
        });

        return getNodesToReturn(originalChildrenCount, this.getDeclarations(), index, false);
    }
}
