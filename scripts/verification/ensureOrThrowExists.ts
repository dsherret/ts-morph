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
import Project, { Type, ClassDeclaration, InterfaceDeclaration, MethodDeclaration, MethodSignature, Directory } from "ts-simple-ast";
import { InspectorFactory } from "./inspectors";

const inspector = new InspectorFactory().getTsSimpleAstInspector();
const problems: string[] = [];

for (const c of inspector.getPublicClasses()) {
    for (const method of c.getInstanceMethods()) {
        if (!doesReturnTypeRequireOrThrow(method.getReturnType()))
            continue;

        const orThrowMethod = c.getInstanceMethod(method.getName() + "OrThrow");
        if (orThrowMethod == null && !isIgnoredMethod(c, method))
            problems.push(`Expected method ${c.getName()}.${method.getName()} to have a corresponding OrThrow method.`);
    }
}

for (const i of inspector.getPublicInterfaces()) {
    for (const method of i.getMethods()) {
        if (!doesReturnTypeRequireOrThrow(method.getReturnType()))
            continue;

        const orThrowMethod = i.getMethod(method.getName() + "OrThrow");
        if (orThrowMethod == null && !isIgnoredMethod(i, method))
            problems.push(`Expected method ${i.getName()}.${method.getName()} to have a corresponding OrThrow method.`);
    }
}

problems.forEach(p => console.error(p));

console.log(`\nFound ${problems.length} issues.`);

function doesReturnTypeRequireOrThrow(returnType: Type) {
    return returnType.isNullable();
}

function isIgnoredMethod(parent: ClassDeclaration | InterfaceDeclaration, method: MethodDeclaration | MethodSignature) {
    if (parent.getName() === "CodeBlockWriter")
        return true;

    return hasTag("internal") || hasTag("skipOrThrowCheck");

    function hasTag(tagName: string) {
        return method.getJsDocs().some(d => d.getTags().some(t => t.getTagNameNode().getText() === tagName));
    }
}

function matches(name: string, names: string[]) {
    return names.indexOf(name) >= 0;
}
