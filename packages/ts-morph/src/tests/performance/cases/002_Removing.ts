import { Project } from "../../../Project";
import { PerformanceTestTemplate } from "../helpers";
import { Statement, ParameterDeclaration } from "../../../compiler";

interface SetupData {
    statements: Statement[];
    params: ParameterDeclaration[];
}

export class RemovingPerformanceTest extends PerformanceTestTemplate<SetupData> {
    id = 2;
    name = "Removing Performance Test";

    protected setup() {
        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile("test.ts");

        const statements: string[] = [];
        for (let i = 0; i < 1500; i++)
            statements.push(`class MyClass${i} {\n}\n`);

        let functionText = "function f(";
        for (let i = 0; i < 100; i++)
            functionText += `p${i}`;
        functionText += ") {\n}";
        statements.splice(Math.floor(statements.length / 2), 0, functionText);

        sourceFile.addStatements(statements);
        sourceFile.getDescendants(); // wrap every descendant

        return {
            statements: sourceFile.getStatements(),
            params: sourceFile.getFunctionOrThrow("f").getParameters()
        };
    }

    protected runInternal(setupData: SetupData, reportProgress: (index: number, count: number) => void) {
        const sourceFile = setupData.params[0].getSourceFile();
        const totalActions = setupData.statements.length + setupData.params.length;
        let actionCount = 0;

        removeFromMiddle(setupData.params);
        removeFromMiddle(setupData.statements);

        // verify this test did what it was supposed to do
        if (sourceFile.getText().length > 0)
            throw new Error("The source file text was greater than 0 for some reason: " + sourceFile.getText());

        function removeFromMiddle(items: { remove(): void; }[]) {
            while (items.length > 0) {
                const item = items.splice(Math.floor(items.length / 2), 1)[0];
                item.remove();
                actionCount++;

                if (actionCount % 10 === 0)
                    reportProgress(actionCount, totalActions);
            }
        }
    }
}
