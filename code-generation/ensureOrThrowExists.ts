/**
 * Code Verification - Ensure "OrThrow" exists.
 * --------------------------------------------
 * This code verification goes through all the classes and interfaces in the compiler directory and checks to find all the
 * methods that should probably have a corresponding "OrThrow" method.
 *
 * OrThrow methods are useful when developing a library because they can be used to give better error messages when something
 * unexpected happens. They also work nicely with strict null checking.
 * --------------------------------------------
 */

import {Type} from "./../src/compiler";
import {getAst} from "./common";

const ast = getAst();
const problems: string[] = [];

for (const sourceFile of ast.getSourceFiles().filter(f => f.getFilePath().includes("/src/compiler"))) {
    for (const c of sourceFile.getClasses()) {
        for (const method of c.getInstanceMethods()) {
            if (!doesReturnTypeRequireOrThrow(method.getReturnType()))
                continue;

            const orThrowMethod = c.getInstanceMethod(method.getName() + "OrThrow");
            if (orThrowMethod == null)
                problems.push(`Expected method ${c.getName()}.${method.getName()} to have a corresponding OrThrow method.`);
        }
    }

    for (const i of sourceFile.getInterfaces()) {
        for (const method of i.getMethods()) {
            if (!doesReturnTypeRequireOrThrow(method.getReturnType()))
                continue;

            const orThrowMethod = i.getMethod(method.getName() + "OrThrow");
            if (orThrowMethod == null)
                problems.push(`Expected method ${i.getName()}.${method.getName()} to have a corresponding OrThrow method.`);
        }
    }
}

problems.forEach(p => console.error(p));

function doesReturnTypeRequireOrThrow(returnType: Type) {
    const unionTypes = returnType.getUnionTypes();
    return unionTypes.some(t => t.isUndefinedType());
}
