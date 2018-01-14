import {ClassViewModel} from "./../view-models";
import TsSimpleAst, {ClassDeclaration} from "./../../src/main";
import {KeyValueCache} from "./../../src/utils";
import {getMixinViewModels} from "./getMixinViewModels";
import {isNodeClass} from "./isNodeClass";

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
            base: undefined
        };
        classesToVms.set(c, vm);
        const baseClass = c.getBaseClass();
        if (baseClass != null)
            vm.base = getViewModelForClass(baseClass);
        return vm;
    }
}
