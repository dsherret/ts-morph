import {TextManipulator} from "./TextManipulator";

export interface InsertionTextManipulatorOptions {
    insertPos: number;
    newText: string;
    replacingLength?: number;
}

export class InsertionTextManipulator implements TextManipulator {
    constructor(private readonly opts: InsertionTextManipulatorOptions) {
    }

    getNewText(inputText: string) {
        const {insertPos, newText, replacingLength = 0} = this.opts;
        return inputText.substring(0, insertPos) + newText + inputText.substring(insertPos + replacingLength);
    }

    getTextForError(newText: string) {
        const startPos = Math.max(0, newText.lastIndexOf("\n", this.opts.insertPos) - 50);
        let text = "";
        let endPos = Math.min(newText.length, newText.indexOf("\n", this.opts.insertPos + this.opts.newText.length) + 50);
        if (endPos === -1)
            endPos = newText.length;
        text += newText.substring(startPos, endPos);

        if (startPos !== 0)
            text = "..." + text;
        if (endPos !== newText.length)
            text += "...";

        return text;
    }
}
