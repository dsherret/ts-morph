import { tsMorph } from "@ts-morph/scripts";
import { getProject } from "../common";
import { TsInspector } from "./TsInspector";
import { TsMorphInspector } from "./TsMorphInspector";
import { WrapperFactory } from "./WrapperFactory";

export class InspectorFactory {
  private readonly tsMorphInspector: TsMorphInspector;
  private readonly tsInspector: TsInspector;
  private readonly project: tsMorph.Project;

  constructor() {
    const wrapperFactory = new WrapperFactory();

    this.project = getProject();
    this.tsMorphInspector = new TsMorphInspector(wrapperFactory, this.project);
    this.tsInspector = new TsInspector(wrapperFactory, this.project);
  }

  getTsMorphInspector() {
    return this.tsMorphInspector;
  }

  getTsInspector() {
    return this.tsInspector;
  }

  getProject() {
    return this.project;
  }
}
