import { RenameLocation } from "../../compiler";
import { TextManipulator } from "./TextManipulator";

export class RenameLocationTextManipulator implements TextManipulator {
    constructor(private readonly renameLocations: RenameLocation[], private readonly newName: string) {
    }

    getNewText(inputText: string) {
        // get the rename locations in reverse order
        const renameLocations = this.renameLocations.map(l => l.getTextSpan()).sort((a, b) => b.getStart() - a.getStart());
        let newFileText = inputText;

        for (const textSpan of renameLocations) {
            const start = textSpan.getStart();
            const end = start + textSpan.getLength();
            newFileText = newFileText.substring(0, start) + this.newName + newFileText.substring(end);
        }

        return newFileText;
    }

    getTextForError(newText: string) {
        if (this.renameLocations.length === 0)
            return newText;

        return "..." + newText.substring(this.renameLocations[0].getTextSpan().getStart());
    }
}
