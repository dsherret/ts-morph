import { getProject } from "../common/mod.ts";
import { tsMorph } from "../deps.ts";
import { TsInspector } from "./TsInspector.ts";
import { TsMorphInspector } from "./TsMorphInspector.ts";
import { WrapperFactory } from "./WrapperFactory.ts";

export class InspectorFactory {
  readonly #tsMorphInspector: TsMorphInspector;
  readonly #tsInspector: TsInspector;
  readonly #project: tsMorph.Project;

  constructor() {
    const wrapperFactory = new WrapperFactory();

    this.#project = getProject();
    this.#tsMorphInspector = new TsMorphInspector(wrapperFactory, this.#project);
    this.#tsInspector = new TsInspector(wrapperFactory, this.#project);
  }

  getTsMorphInspector() {
    return this.#tsMorphInspector;
  }

  getTsInspector() {
    return this.#tsInspector;
  }

  getProject() {
    return this.#project;
  }
}
