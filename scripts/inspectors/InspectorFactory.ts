import {Project} from "../../src/Project";
import {getProject} from "../common";
import {WrapperFactory} from "./WrapperFactory";
import {TsSimpleAstInspector} from "./TsSimpleAstInspector";
import {TsInspector} from "./TsInspector";

export class InspectorFactory {
    private readonly tsSimpleAstInspector: TsSimpleAstInspector;
    private readonly tsInspector: TsInspector;
    private readonly project: Project;

    constructor() {
        const wrapperFactory = new WrapperFactory();

        this.project = getProject();
        this.tsSimpleAstInspector = new TsSimpleAstInspector(wrapperFactory, this.project);
        this.tsInspector = new TsInspector(wrapperFactory, this.project);
    }

    getTsSimpleAstInspector() {
        return this.tsSimpleAstInspector;
    }

    getTsInspector() {
        return this.tsInspector;
    }

    getProject() {
        return this.project;
    }
}
