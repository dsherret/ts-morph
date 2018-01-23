import {getAst} from "./../common";
import {WrapperFactory} from "./WrapperFactory";
import {TsSimpleAstInspector} from "./TsSimpleAstInspector";
import {TsInspector} from "./TsInspector";

export class InspectorFactory {
    private readonly tsSimpleAstInspector: TsSimpleAstInspector;
    private readonly tsInspector: TsInspector;

    constructor() {
        const wrapperFactory = new WrapperFactory();
        const ast = getAst();

        this.tsSimpleAstInspector = new TsSimpleAstInspector(wrapperFactory, ast);
        this.tsInspector = new TsInspector(wrapperFactory, ast);
    }

    getTsSimpleAstInspector() {
        return this.tsSimpleAstInspector;
    }

    getTsInspector() {
        return this.tsInspector;
    }
}
