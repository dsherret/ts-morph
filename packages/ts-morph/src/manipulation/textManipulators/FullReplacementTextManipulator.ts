import { TextManipulator } from "./TextManipulator";

export class FullReplacementTextManipulator implements TextManipulator {
    readonly #newText: string;

  constructor(newText: string) {
      this.#newText = newText;
  }

  getNewText(inputText: string) {
    return this.#newText;
  }

  getTextForError(newText: string) {
    return newText;
  }
}
