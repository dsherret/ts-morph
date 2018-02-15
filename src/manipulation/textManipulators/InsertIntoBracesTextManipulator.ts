import {Node} from "./../../compiler";
import {getInsertPosFromIndex} from "./../helpers";
import {InsertionTextManipulator} from "./InsertionTextManipulator";
import {isBlankLineAtPos} from "./../textChecks";
import {TypeGuards, StringUtils} from "./../../utils";

export interface InsertIntoBracesTextManipulatorOptions<TStructure> {
    parent: Node;
    children: Node[];
    index: number;
    childCodes: string[];
    separator: string;
    structures?: TStructure[];
    previousBlanklineWhen?: (previousMember: Node, firstStructure: TStructure) => boolean;
    nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean;
    separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean;
}

export class InsertIntoBracesTextManipulator<TStructure> extends InsertionTextManipulator {
    constructor(opts: InsertIntoBracesTextManipulatorOptions<TStructure>) {
        // todo: doing this doesn't seem right, but I'd rather have all these text manipulations happening in here
        super({
            insertPos: getInsertPosFromIndex(opts.index, opts.parent, opts.children),
            newText: getNewText()
        });

        function getNewText() {
            const {parent, index, childCodes, separator, children} = opts;

            if (childCodes.length === 0)
                return "";

            const sourceFile = parent.getSourceFile();
            const insertPos = getInsertPosFromIndex(index, parent, children);
            const newLineChar = sourceFile.global.manipulationSettings.getNewLineKindAsString();

            let newText = "";

            for (let i = 0; i < childCodes.length; i++) {
                if (i > 0) {
                    newText += separator;
                    if (opts.separatorNewlineWhen != null && opts.separatorNewlineWhen(opts.structures![i - 1], opts.structures![i]))
                        newText += newLineChar;
                }
                newText += childCodes[i];
            }

            if (index !== 0)
                newText = separator + newText;
            else if (insertPos !== 0)
                newText = newLineChar + newText;
            else if (parent.getFullWidth() > 0)
                newText = newText + separator;

            if (opts.previousBlanklineWhen != null) {
                const previousMember: Node | undefined = children[index - 1];
                const firstStructure = opts.structures![0];
                if (previousMember != null && opts.previousBlanklineWhen(previousMember, firstStructure))
                    newText = newLineChar + newText;
            }

            const nextMember: Node | undefined = children[index];
            if (opts.nextBlanklineWhen != null) {
                const lastStructure = opts.structures![opts.structures!.length - 1];
                if (nextMember != null && opts.nextBlanklineWhen(nextMember, lastStructure)) {
                    if (!isBlankLineAtPos(sourceFile, insertPos))
                        newText = newText + newLineChar;
                }
            }

            if (TypeGuards.isSourceFile(parent) && nextMember == null && !StringUtils.endsWith(newText, newLineChar) && !StringUtils.endsWith(sourceFile.getFullText(), "\n"))
                newText = newText + newLineChar;

            return newText;
        }
    }
}
