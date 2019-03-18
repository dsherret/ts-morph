import * as errors from "../../../errors";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange } from "../../../manipulation";
import { CommaSeparatedStructuresPrinter } from "../../../structurePrinters";
import { VariableDeclarationListStructure, VariableDeclarationStructure, VariableDeclarationListSpecificStructure } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { ModifierableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { VariableDeclaration } from "./VariableDeclaration";
import { VariableDeclarationKind } from "./VariableDeclarationKind";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
    addDeclaration(structure: VariableDeclarationStructure) {
        return this.addDeclarations([structure])[0];
    }

    /**
     * Adds variable declarations to the statement.
     * @param structures - Structures representing the variable declarations to add.
     */
    addDeclarations(structures: ReadonlyArray<VariableDeclarationStructure>) {
        return this.insertDeclarations(this.getDeclarations().length, structures);
    }

    /**
     * Inserts a variable declaration at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the variable declaration to insert.
     */
    insertDeclaration(index: number, structure: VariableDeclarationStructure) {
        return this.insertDeclarations(index, [structure])[0];
    }

    /**
     * Inserts variable declarations at the specified index within the statement.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the variable declarations to insert.
     */
    insertDeclarations(index: number, structures: ReadonlyArray<VariableDeclarationStructure>) {
        const writer = this._getWriterWithQueuedChildIndentation();
        const structurePrinter = new CommaSeparatedStructuresPrinter(this._context.structurePrinterFactory.forVariableDeclaration());

        structurePrinter.printText(writer, structures);

        insertIntoCommaSeparatedNodes({
            parent: this.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList),
            currentNodes: this.getDeclarations(),
            insertIndex: index,
            newText: writer.toString()
        });

        return getNodesToReturn(this.getDeclarations(), index, structures.length);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<VariableDeclarationListStructure>) {
        callBaseSet(VariableDeclarationListBase.prototype, this, structure);

        if (structure.declarationKind != null)
            this.setDeclarationKind(structure.declarationKind);
        if (structure.declarations != null) {
            const existingDeclarations = this.getDeclarations();
            this.addDeclarations(structure.declarations);
            existingDeclarations.forEach(d => d.remove());
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): VariableDeclarationListStructure {
        return callBaseGetStructure<VariableDeclarationListSpecificStructure>(VariableDeclarationListBase.prototype, this, {
            declarationKind: this.getDeclarationKind(),
            declarations: this.getDeclarations().map(declaration => declaration.getStructure())
        }) as any as VariableDeclarationListStructure;
    }
}
