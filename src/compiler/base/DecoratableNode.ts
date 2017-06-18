import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {DecoratorStructure} from "./../../structures";
import {getEndIndexFromArray, verifyAndGetIndex, insertCreatingSyntaxList, insertIntoSyntaxList} from "./../../manipulation";
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
            if (this.node.decorators == null)
                return [];
            return this.node.decorators.map(d => this.factory.getDecorator(d, this.sourceFile));
        }

        addDecorator(structure: DecoratorStructure) {
            return this.insertDecorator(getEndIndexFromArray(this.node.decorators), structure);
        }

        addDecorators(structures: DecoratorStructure[]) {
            return this.insertDecorators(getEndIndexFromArray(this.node.decorators), structures);
        }

        insertDecorator(index: number, structure: DecoratorStructure) {
            return this.insertDecorators(index, [structure])[0];
        }

        insertDecorators(index: number, structures: DecoratorStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const decoratorLines = getDecoratorLines(structures);
            const decorators = this.getDecorators();
            const newLineText = this.factory.getLanguageService().getNewLine();
            index = verifyAndGetIndex(index, decorators.length);

            if (decorators.length === 0) {
                const indentationText = this.getIndentationText();
                const decoratorCode = prependIndentationText(decoratorLines, indentationText).join(newLineText) + newLineText;
                insertCreatingSyntaxList(this.getSourceFile(), this.getStart() - indentationText.length, decoratorCode);
            }
            else {
                const nextDecorator = decorators[index];
                if (nextDecorator == null) {
                    const previousDecorator = decorators[index - 1];
                    const indentationText = previousDecorator.getIndentationText();
                    const decoratorCode = newLineText + prependIndentationText(decoratorLines, indentationText).join(newLineText);
                    insertIntoSyntaxList(this.getSourceFile(), previousDecorator.getEnd(), decoratorCode, decorators[0].getParentSyntaxListOrThrow(), index, structures.length);
                }
                else {
                    const indentationText = nextDecorator.getIndentationText();
                    let decoratorCode = decoratorLines[0] + newLineText;
                    if (decoratorLines.length > 1)
                        decoratorCode += prependIndentationText(decoratorLines.slice(1), indentationText).join(newLineText) + newLineText;
                    decoratorCode += indentationText;
                    insertIntoSyntaxList(this.getSourceFile(), nextDecorator.getStart(), decoratorCode, decorators[0].getParentSyntaxListOrThrow(), index, structures.length);
                }
            }

            return this.getDecorators().slice(index, index + structures.length);
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
