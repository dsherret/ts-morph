import { ClassDeclaration } from "../../../compiler";
import { Project } from "../../../Project";
import { StructureKind } from "../../../structures";
import { PerformanceTestTemplate } from "../helpers";

export class RenamingPerformanceTest extends PerformanceTestTemplate<ClassDeclaration> {
    id = 1;
    name = "Renaming Performance Test";

    protected setup() {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("test.ts");

        const assignmentStatements: string[] = [];
        for (let i = 0; i < 1000; i++)
            assignmentStatements.push(`let myVar${i} = new MyClass();`);
        sourceFile.set({
            statements: [{
                kind: StructureKind.Class,
                name: "MyClass",
            }, ...assignmentStatements],
        });

        return sourceFile.getClassOrThrow("MyClass");
    }

    protected runInternal(classDec: ClassDeclaration, reportProgress: (index: number, count: number) => void) {
        const iterationsCount = 50;
        for (let i = 0; i < iterationsCount; i++) {
            reportProgress(i, iterationsCount);
            classDec.rename(`MyClass${i}`);
        }
    }
}
