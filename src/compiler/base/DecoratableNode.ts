import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {DecoratorStructure, DecoratableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {getEndIndexFromArray, verifyAndGetIndex, insertIntoCreatableSyntaxList, getNewCode, getInsertFormatting} from "./../../manipulation";
import {getNextNonWhitespacePos} from "./../../manipulation/textSeek";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {Decorator} from "./../decorator/Decorator";

export type DecoratableNodeExtensionType = Node<ts.Node & { decorators: ts.NodeArray<ts.Decorator>; }>;

export interface DecoratableNode {
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
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the decorator.
     */
    insertDecorator(index: number, structure: DecoratorStructure): Decorator;
    /**
     * Insert decorators.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertDecorators(index: number, structures: DecoratorStructure[]): Decorator[];
}

export function DecoratableNode<T extends Constructor<DecoratableNodeExtensionType>>(Base: T): Constructor<DecoratableNode> & T {
    return class extends Base implements DecoratableNode {
        getDecorators(): Decorator[] {
            if (this.compilerNode.decorators == null)
                return [];
            return this.compilerNode.decorators.map(d => this.global.compilerFactory.getDecorator(d, this.sourceFile));
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

            const decoratorLines = getDecoratorLines(structures);
            const decorators = this.getDecorators();
            index = verifyAndGetIndex(index, decorators.length);

            const formatting = getInsertFormatting(ts.SyntaxKind.Decorator, {
                parent: this,
                children: decorators,
                structures,
                index
            });

            const decoratorCode = getNewCode({
                structures,
                newCodes: decoratorLines,
                parent: this,
                indentationText: this.getIndentationText(),
                formatting
            });

            insertIntoCreatableSyntaxList({
                parent: this,
                insertPos: formatting.getInsertPos(),
                childIndex: index,
                insertItemsCount: structures.length,
                newText: decoratorCode,
                syntaxList: decorators.length === 0 ? undefined : decorators[0].getParentSyntaxListOrThrow()
            });

            return this.getDecorators().slice(index, index + structures.length);
        }

        fill(structure: Partial<DecoratableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.decorators != null && structure.decorators.length > 0)
                this.addDecorators(structure.decorators);

            return this;
        }
    };
}

function getDecoratorLines(structures: DecoratorStructure[]) {
    const lines: string[] = [];
    for (const structure of structures) {
        let line = `@${structure.name}`;
        if (structure.arguments != null)
            line += `(${structure.arguments.join(", ")})`;
        lines.push(line);
    }
    return lines;
}

function prependIndentationText(lines: string[], indentationText: string) {
    return lines.map(l => indentationText + l);
}
