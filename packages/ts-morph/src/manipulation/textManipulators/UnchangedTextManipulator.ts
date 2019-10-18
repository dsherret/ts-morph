import { TextManipulator } from "./TextManipulator";

export class UnchangedTextManipulator implements TextManipulator {
    getNewText(inputText: string) {
        return inputText;
    }

    getTextForError(newText: string) {
        return newText;
    }
}
