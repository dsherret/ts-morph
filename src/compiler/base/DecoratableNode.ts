import * as errors from "../../errors";
import { FormattingKind, getEndIndexFromArray, getNewInsertCode, getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../manipulation";
import { DecoratableNodeStructure, DecoratorStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../utils";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { Decorator } from "../decorator/Decorator";

export type DecoratableNodeExtensionType = Node<ts.Node & { decorators: ts.NodeArray<ts.Decorator> | undefined; }>;

export interface DecoratableNode {
    /**
     * Gets a decorator or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getDecorator(name: string): Decorator | undefined;
    /**
     * Gets a decorator or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getDecorator(findFunction: (declaration: Decorator) => boolean): Decorator | undefined;
    /**
     * Gets a decorator or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getDecoratorOrThrow(name: string): Decorator;
    /**
     * Gets a decorator or throws if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getDecoratorOrThrow(findFunction: (declaration: Decorator) => boolean): Decorator;
    /**
     * Gets all the decorators of the node.
     */
    getDecorators(): Decorator[];
    /**
     * Adds a decorator.
     * @param structure - Structure of the decorator.
     */
    addDecorator(structure: DecoratorStructure): Decorator;
    /**
     * Adds decorators.
     * @param structures - Structures of the decorators.
     */
    addDecorators(structures: DecoratorStructure[]): Decorator[];
    /**
     * Inserts a decorator.
     * @param index - Child index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the decorator.
     */
    insertDecorator(index: number, structure: DecoratorStructure): Decorator;
    /**
     * Insert decorators.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertDecorators(index: number, structures: DecoratorStructure[]): Decorator[];
}

export function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T {
    return class extends Base implements DecoratableNode {
        getDecorator(nameOrFindFunction: string | ((declaration: Decorator) => boolean)): Decorator | undefined {
            return getNodeByNameOrFindFunction(this.getDecorators(), nameOrFindFunction);
        }

        getDecoratorOrThrow(nameOrFindFunction: string | ((declaration: Decorator) => boolean)): Decorator {
            return errors.throwIfNullOrUndefined(this.getDecorator(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("decorator", nameOrFindFunction));
        }

        getDecorators(): Decorator[] {
            if (this.compilerNode.decorators == null)
                return [];
            return this.compilerNode.decorators.map(d => this.getNodeFromCompilerNode(d));
        }

        addDecorator(structure: DecoratorStructure) {
            return this.insertDecorator(getEndIndexFromArray(this.compilerNode.decorators), structure);
        }

        addDecorators(structures: DecoratorStructure[]) {
            return this.insertDecorators(getEndIndexFromArray(this.compilerNode.decorators), structures);
        }

        insertDecorator(index: number, structure: DecoratorStructure) {
            return this.insertDecorators(index, [structure])[0];
        }

        insertDecorators(index: number, structures: DecoratorStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const decoratorLines = getDecoratorLines(this, structures);
            const decorators = this.getDecorators();
            index = verifyAndGetIndex(index, decorators.length);
            const formattingKind = getDecoratorFormattingKind(this, decorators);
            const previousDecorator = decorators[index - 1];
            const decoratorCode = getNewInsertCode({
                structures,
                newCodes: decoratorLines,
                parent: this,
                indentationText: this.getIndentationText(),
                getSeparator: () => formattingKind,
                previousFormattingKind: previousDecorator == null ? FormattingKind.None : formattingKind,
                nextFormattingKind: previousDecorator == null ? formattingKind : FormattingKind.None
            });

            insertIntoParentTextRange({
                parent: decorators.length === 0 ? this : decorators[0].getParentSyntaxListOrThrow(),
                insertPos: decorators[index - 1] == null ? this.getStart() : decorators[index - 1].getEnd(),
                newText: decoratorCode
            });

            return getNodesToReturn(this.getDecorators(), index, structures.length);
        }

        fill(structure: Partial<DecoratableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.decorators != null && structure.decorators.length > 0)
                this.addDecorators(structure.decorators);

            return this;
        }
    };
}

function getDecoratorLines(node: Node, structures: DecoratorStructure[]) {
    const lines: string[] = [];
    for (const structure of structures) {
        // todo: temporary code... refactor this later
        const writer = node.getWriter();
        const structurePrinter = node.context.structurePrinterFactory.forDecorator();
        structurePrinter.printText(writer, structure);
        lines.push(writer.toString());
    }
    return lines;
}

function getDecoratorFormattingKind(parent: DecoratableNode & Node, currentDecorators: Node[]) {
    const sameLine = areDecoratorsOnSameLine(parent, currentDecorators);
    return sameLine ? FormattingKind.Space : FormattingKind.Newline;
}

function areDecoratorsOnSameLine(parent: DecoratableNode & Node, currentDecorators: Node[]) {
    if (currentDecorators.length <= 1)
        return parent.getKind() === SyntaxKind.Parameter;

    const startLinePos = currentDecorators[0].getStartLinePos();
    for (let i = 1; i < currentDecorators.length; i++) {
        if (currentDecorators[i].getStartLinePos() !== startLinePos)
            return false;
    }

    return true;
}
