import { createDeclarationProject as scriptsCreateDeclarationProject, folders, path, tsMorph } from "../deps.ts";

export function getDeclarationProject() {
  const project = new tsMorph.Project({
    tsConfigFilePath: path.join(folders.tsMorph, "tsconfig.json"),
    manipulationSettings: {
      newLineKind: tsMorph.NewLineKind.LineFeed,
    },
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(path.join(folders.tsMorph, "lib/**/*.d.ts"));
  return project;
}

export function createDeclarationProject() {
  return scriptsCreateDeclarationProject({
    tsConfigFilePath: path.join(folders.tsMorph, "tsconfig.declarations.json"),
  });
}
