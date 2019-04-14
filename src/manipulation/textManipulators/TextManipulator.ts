export interface TextManipulator {
    getNewText(inputText: string): string;
    getTextForError(newText: string): string;
}

export interface AstTextManipulator {
    // temp method name
    getNewTextForAst(inputText: string): { newText: string; pos: number; end: number };
    getTextForError(newText: string): string;
}