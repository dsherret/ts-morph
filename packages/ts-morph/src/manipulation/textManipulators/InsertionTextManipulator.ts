import { getTextForError } from "./getTextForError";
import { TextManipulator } from "./TextManipulator";

export interface InsertionTextManipulatorOptions {
  insertPos: number;
  newText: string;
  replacingLength?: number;
}

export class InsertionTextManipulator implements TextManipulator {
  readonly #opts: InsertionTextManipulatorOptions;

  constructor(opts: InsertionTextManipulatorOptions) {
    this.#opts = opts;
  }

  getNewText(inputText: string) {
    const { insertPos, newText, replacingLength = 0 } = this.#opts;
    return inputText.substring(0, insertPos) + newText + inputText.substring(insertPos + replacingLength);
  }

  getTextForError(newText: string) {
    return getTextForError(newText, this.#opts.insertPos, this.#opts.newText.length);
  }
}
