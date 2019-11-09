import { errors, ArrayUtils, SyntaxKind, ts } from "@ts-morph/common";
import { FormattingKind, getEndIndexFromArray, getNewInsertCode, getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { DecoratableNodeStructure, DecoratorStructure, OptionalKind } from "../../../structures";
import { Constructor } from "../../../types";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { Decorator } from "../decorator/Decorator";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type DecoratableNodeExtensionType = Node<ts.Node>;

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
    addDecorator(structure: OptionalKind<DecoratorStructure>): Decorator;
    /**
     * Adds decorators.
     * @param structures - Structures of the decorators.
     */
    addDecorators(structures: ReadonlyArray<OptionalKind<DecoratorStructure>>): Decorator[];
    /**
     * Inserts a decorator.
     * @param index - Child index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the decorator.
     */
    insertDecorator(index: number, structure: OptionalKind<DecoratorStructure>): Decorator;
    /**
     * Insert decorators.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertDecorators(index: number, structures: ReadonlyArray<OptionalKind<DecoratorStructure>>): Decorator[];
}

export function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T {
    return class extends Base implements DecoratableNode {
        getDecorator(nameOrFindFunction: string | ((declaration: Decorator) => boolean)): Decorator | undefined {
            return getNodeByNameOrFindFunction(this.getDecorators(), nameOrFindFunction);
        }

        getDecoratorOrThrow(nameOrFindFunction: string | ((declaration: Decorator) => boolean)): Decorator {
            return errors.throwIfNullOrUndefined(this.getDecorator(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("decorator", nameOrFindFunction));
        }

        getDecorators(): Decorator[] {
            return this.compilerNode.decorators?.map(d => this._getNodeFromCompilerNode(d)) ?? [];
        }

        addDecorator(structure: OptionalKind<DecoratorStructure>) {
            return this.insertDecorator(getEndIndexFromArray(this.compilerNode.decorators), structure);
        }

        addDecorators(structures: ReadonlyArray<OptionalKind<DecoratorStructure>>) {
            return this.insertDecorators(getEndIndexFromArray(this.compilerNode.decorators), structures);
        }

        insertDecorator(index: number, structure: OptionalKind<DecoratorStructure>) {
            return this.insertDecorators(index, [structure])[0];
        }

        insertDecorators(index: number, structures: ReadonlyArray<OptionalKind<DecoratorStructure>>) {
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

            return getNodesToReturn(decorators, this.getDecorators(), index, false);
        }

        set(structure: Partial<DecoratableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.decorators != null) {
                this.getDecorators().forEach(d => d.remove());
                this.addDecorators(structure.decorators);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<DecoratableNodeStructure>(Base.prototype, this, {
                decorators: this.getDecorators().map(d => d.getStructure())
            });
        }
    };
}

function getDecoratorLines(node: Node, structures: ReadonlyArray<OptionalKind<DecoratorStructure>>) {
    const lines: string[] = [];
    for (const structure of structures) {
        // todo: temporary code... refactor this later
        const writer = node._getWriter();
        const structurePrinter = node._context.structurePrinterFactory.forDecorator();
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
