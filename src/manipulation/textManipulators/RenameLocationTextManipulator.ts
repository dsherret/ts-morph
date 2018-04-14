import { RenameLocation } from "../../compiler";
import { TextManipulator } from "./TextManipulator";

export class RenameLocationTextManipulator implements TextManipulator {
    constructor(private readonly renameLocations: RenameLocation[], private readonly newName: string) {
    }

    getNewText(inputText: string) {
        // todo: go in reverse so that the difference doesn't need to be kept track of
        let newFileText = inputText;
        let difference = 0;

        for (const textSpan of this.renameLocations.map(l => l.getTextSpan())) {
            let start = textSpan.getStart();
            let end = start + textSpan.getLength();
            start -= difference;
            end -= difference;
            newFileText = newFileText.substring(0, start) + this.newName + newFileText.substring(end);
            difference += textSpan.getLength() - this.newName.length;
        }

        return newFileText;
    }

    getTextForError(newText: string) {
        if (this.renameLocations.length === 0)
            return newText;

        return "..." + newText.substring(this.renameLocations[0].getTextSpan().getStart());
    }
}
