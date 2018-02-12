import {TsSimpleAst} from "./../../src/TsSimpleAst";
import {getAst} from "./../common";
import {WrapperFactory} from "./WrapperFactory";
import {TsSimpleAstInspector} from "./TsSimpleAstInspector";
import {TsInspector} from "./TsInspector";

export class InspectorFactory {
    private readonly tsSimpleAstInspector: TsSimpleAstInspector;
    private readonly tsInspector: TsInspector;
    private readonly ast: TsSimpleAst;

    constructor() {
        const wrapperFactory = new WrapperFactory();

        this.ast = getAst();
        this.tsSimpleAstInspector = new TsSimpleAstInspector(wrapperFactory, this.ast);
        this.tsInspector = new TsInspector(wrapperFactory, this.ast);
    }

    getTsSimpleAstInspector() {
        return this.tsSimpleAstInspector;
    }

    getTsInspector() {
        return this.tsInspector;
    }

    getAst() {
        return this.ast;
    }
}
