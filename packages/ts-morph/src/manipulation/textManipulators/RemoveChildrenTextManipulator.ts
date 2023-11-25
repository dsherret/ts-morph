import { Node } from "../../compiler";
import { CharCodes } from "../../utils";
import { getNextMatchingPos, getPreviousMatchingPos } from "../textSeek";
import { getTextForError } from "./getTextForError";
import { TextManipulator } from "./TextManipulator";

export interface RemoveChildrenTextManipulatorOptions {
  children: Node[];
  removePrecedingSpaces?: boolean;
  removeFollowingSpaces?: boolean;
  removePrecedingNewLines?: boolean;
  removeFollowingNewLines?: boolean;
  customRemovalPos?: number;
  customRemovalEnd?: number;
  replaceTrivia?: string;
}

export class RemoveChildrenTextManipulator implements TextManipulator {
    readonly #opts: RemoveChildrenTextManipulatorOptions;
  #removalPos: number | undefined;

  constructor(opts: RemoveChildrenTextManipulatorOptions) {
      this.#opts = opts;
  }

  getNewText(inputText: string) {
    const opts = this.#opts;
    const {
      children,
      removePrecedingSpaces = false,
      removeFollowingSpaces = false,
      removePrecedingNewLines = false,
      removeFollowingNewLines = false,
      replaceTrivia = "",
    } = opts;
    const sourceFile = children[0].getSourceFile();
    const fullText = sourceFile.getFullText();
    const removalPos = getRemovalPos();
    this.#removalPos = removalPos;

    return getPrefix() + replaceTrivia + getSuffix();

    function getPrefix() {
      return fullText.substring(0, removalPos);
    }

    function getSuffix() {
      return fullText.substring(getRemovalEnd());
    }

    function getRemovalPos() {
      if (opts.customRemovalPos != null)
        return opts.customRemovalPos;
      const pos = children[0].getNonWhitespaceStart();
      if (removePrecedingSpaces || removePrecedingNewLines)
        return getPreviousMatchingPos(fullText, pos, getCharRemovalFunction(removePrecedingSpaces, removePrecedingNewLines));
      return pos;
    }

    function getRemovalEnd() {
      if (opts.customRemovalEnd != null)
        return opts.customRemovalEnd;
      const end = children[children.length - 1].getEnd();
      if (removeFollowingSpaces || removeFollowingNewLines)
        return getNextMatchingPos(fullText, end, getCharRemovalFunction(removeFollowingSpaces, removeFollowingNewLines));
      return end;
    }

    function getCharRemovalFunction(removeSpaces: boolean, removeNewLines: boolean) {
      return (char: number) => {
        if (removeNewLines && (char === CharCodes.CARRIAGE_RETURN || char === CharCodes.NEWLINE))
          return false;
        if (removeSpaces && !charNotSpaceOrTab(char))
          return false;
        return true;
      };
    }

    function charNotSpaceOrTab(charCode: number) {
      return charCode !== CharCodes.SPACE && charCode !== CharCodes.TAB;
    }
  }

  getTextForError(newText: string) {
    return getTextForError(newText, this.#removalPos!);
  }
}
