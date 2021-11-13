import { tsMorph } from "@ts-morph/scripts";
import * as path from "path";
import { rootFolder } from "../config";

export function getProject() {
  return new tsMorph.Project({
    tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
    manipulationSettings: {
      indentationText: tsMorph.IndentationText.TwoSpaces,
      newLineKind: tsMorph.NewLineKind.LineFeed,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
}
