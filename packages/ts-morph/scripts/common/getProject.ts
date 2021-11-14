import { folders, path, tsMorph } from "../../../scripts/mod.ts";

export function getProject() {
  return new tsMorph.Project({
    tsConfigFilePath: path.join(folders.tsMorph, "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
    manipulationSettings: {
      indentationText: tsMorph.IndentationText.TwoSpaces,
      newLineKind: tsMorph.NewLineKind.LineFeed,
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
    },
  });
}
