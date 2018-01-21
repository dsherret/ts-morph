import {ClassViewModel} from "./../view-models";
import TsSimpleAst, {ClassDeclaration, Node, Type} from "./../../src/main";
import {KeyValueCache, ArrayUtils} from "./../../src/utils";
import {getMixinViewModels} from "./getMixinViewModels";
import {isNodeClass} from "./isNodeClass";

// todo: change this to use a wrapper pattern

export function* getClassViewModels(ast: TsSimpleAst): IterableIterator<ClassViewModel> {
    const compilerSourceFiles = ast.getSourceFiles("**/src/compiler/**/*.ts");
    const classesToVms = new KeyValueCache<ClassDeclaration, ClassViewModel>();
    const classes = compilerSourceFiles.map(f => f.getClasses()).reduce((a, b) => a.concat(b), []);

    for (const c of classes)
        yield getViewModelForClass(c);

    function getViewModelForClass(c: ClassDeclaration) {
        if (classesToVms.has(c))
            return classesToVms.get(c)!;

        const vm: ClassViewModel = {
            name: c.getName(),
            mixins: Array.from(getMixinViewModels(c)),
            path: c.getSourceFile().getFilePath(),
            isNodeClass: isNodeClass(c),
            base: undefined,
            associatedTsNodes: getAssociatedTsNodes()
        };
        classesToVms.set(c, vm);
        const baseClass = c.getBaseClass();
        if (baseClass != null)
            vm.base = getViewModelForClass(baseClass);
        return vm;

        function getAssociatedTsNodes(): Node[] {
            return ArrayUtils.flatten([getFromExtends(), getFromTypeParam()]);

            function getFromTypeParam() {
                const typeParams = c.getTypeParameters();
                if (typeParams.length === 0)
                    return [];
                const typeParam = typeParams[0];
                const defaultNode = typeParam.getDefaultNode();
                if (defaultNode == null)
                    return [];
                return getFromType(c.global.typeChecker.getTypeAtLocation(defaultNode));
            }

            function getFromExtends() {
                const extendsExpr = c.getExtends();
                if (extendsExpr == null)
                    return [];
                const typeArgs = extendsExpr!.getTypeArguments();
                if (typeArgs.length === 0)
                    return [];
                return getFromType(c.global.typeChecker.getTypeAtLocation(typeArgs[0]));
            }

            function getFromType(type: Type | undefined) {
                if (type == null)
                    return [];
                const symbol = type.getSymbol();
                if (symbol == null)
                    return [];
                return symbol.getDeclarations();
            }
        }
    }
}
