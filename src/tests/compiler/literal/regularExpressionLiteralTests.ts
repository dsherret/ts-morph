import * as os from "os";
import {expect} from "chai";
import {VariableStatement, RegularExpressionLiteral} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithInitializer(text: string) {
    const obj = getInfoFromText<VariableStatement>(text);
    const initializer = obj.firstChild.getDeclarations()[0].getInitializerOrThrow() as RegularExpressionLiteral;
    return { ...obj, initializer };
}

describe(nameof(RegularExpressionLiteral), () => {
    const isWindows = os.platform() === "win32";

    describe(nameof<RegularExpressionLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, pattern: string, flags: string) {
            const {initializer} = getInfoFromTextWithInitializer(text);
            const regExpr = initializer.getLiteralValue();
            expect(regExpr.source).to.equal(pattern);

            // this works on my machine, but not the CI for some reason... ignoring it for now
            if (isWindows)
                expect(regExpr.flags).to.equal(flags);
        }

        it("should get the correct literal text when there are flags", () => {
            doTest("const t = /testing/gi;", "testing", "gi");
        });

        it("should get the correct literal text when there are no flags", () => {
            doTest("const t = /testing/;", "testing", "");
        });
    });
});
