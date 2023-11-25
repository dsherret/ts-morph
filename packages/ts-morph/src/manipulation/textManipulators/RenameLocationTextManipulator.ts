import { RenameLocation } from "../../compiler";
import { TextManipulator } from "./TextManipulator";

export class RenameLocationTextManipulator implements TextManipulator {
    readonly #newName: string;
    readonly #renameLocations: RenameLocation[];

  constructor(renameLocations: RenameLocation[], newName: string) {
      this.#renameLocations = renameLocations;
      this.#newName = newName;
  }

  getNewText(inputText: string) {
    // get the rename locations in reverse order
    const renameLocations = [...this.#renameLocations].sort((a, b) => b.getTextSpan().getStart() - a.getTextSpan().getStart());
    let currentPos = inputText.length;
    let result = "";

    for (let i = 0; i < renameLocations.length; i++) {
      const renameLocation = renameLocations[i];
      const textSpan = renameLocation.getTextSpan();
      result = (renameLocation.getPrefixText() || "")
        + this.#newName
        + (renameLocation.getSuffixText() || "")
        + inputText.substring(textSpan.getEnd(), currentPos)
        + result;
      currentPos = textSpan.getStart();
    }

    return inputText.substring(0, currentPos) + result;
  }

  getTextForError(newText: string) {
    if (this.#renameLocations.length === 0)
      return newText;

    return "..." + newText.substring(this.#renameLocations[0].getTextSpan().getStart());
  }
}
