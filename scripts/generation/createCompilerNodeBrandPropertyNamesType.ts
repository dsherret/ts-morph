/**
 * Code Generation - Create compiler node brand property names type.
 * -----------------------------------------------------------------
 * Creates a type that lists all the compiler nodes' brand property names.
 * ----------------------------------------------
 */
import { ArrayUtils } from "../../src/utils";
import { TsInspector } from "../inspectors";

export function createCompilerNodeBrandPropertyNamesType(tsInspector: TsInspector) {
    const brandMatchRegex = /^_[A-Za-z]+Brand$/;
    const brandNames = ArrayUtils.flatten(tsInspector.getTsNodes().map(n => n.getProperties()))
        .map(p => p.getName())
        .filter(name => brandMatchRegex.test(name));
    const sourceFile = tsInspector.getApiLayerFile();
    const typeAliasName = "CompilerNodeBrandPropertyNamesType";

    removeTypeAliasIfExists(typeAliasName);

    if (brandNames.length === 0)
        throw new Error("Unexpected! For some reason there were no brand names.");

    sourceFile.addTypeAlias({
        isExported: true,
        name: typeAliasName,
        type: writer => {
            for (let i = 0; i < brandNames.length; i++) {
                if (i > 0)
                    writer.write(" |").newLine().indent(); // todo: remove indent when #452 is fixed
                writer.quote(brandNames[i]);
            }
        }
    });

    function removeTypeAliasIfExists(name: string) {
        const existingTypeAlias = sourceFile.getTypeAlias(name);

        if (existingTypeAlias != null)
            existingTypeAlias.remove();
    }
}
