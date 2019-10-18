import { TextManipulator } from "./TextManipulator";

export class FullReplacementTextManipulator implements TextManipulator {
    constructor(private readonly newText: string) {
    }

    getNewText(inputText: string) {
        return this.newText;
    }

    getTextForError(newText: string) {
        return newText;
    }
}
