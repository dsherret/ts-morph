export interface TextManipulator {
    getNewText(inputText: string): string;
    getTextForError(newText: string): string;
}
