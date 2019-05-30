/* barrel:ignore */
import { CodeBlockWriter } from "../codeBlockWriter";
import * as errors from "../errors";
import { TypeElementMemberedNodeStructure } from "../structures";
import { StructurePrinterFactory } from "../factories/StructurePrinterFactory";
import { WriterFunction } from "../types";

export type WriterFunctionOrValue = string | number | WriterFunction;

const structurePrinterFactory = new StructurePrinterFactory(() => {
    throw new errors.NotImplementedError("Not implemented scenario for getting code format settings when using a writer function. Please open an issue.");
});

/**
 * Writer functions.
 * @remarks These functions are currently very experimental.
 */
export class WriterFunctions {
    private constructor() {
    }

    /**
     * Gets a writer function for writing the provided object as an object literal expression.
     * @param obj - Object to write.
     */
    static object(obj: { [key: string]: WriterFunctionOrValue | undefined; }): WriterFunction {
        return (writer: CodeBlockWriter) => {
            const keyNames = Object.keys(obj);
            writer.write("{");
            if (keyNames.length > 0) {
                writer.indentBlock(() => {
                    writeObject();
                });
            }
            writer.write("}");

            function writeObject() {
                for (let i = 0; i < keyNames.length; i++) {
                    if (i > 0)
                        writer.write(",").newLine();

                    const keyName = keyNames[i];
                    const value = obj[keyName];
                    writer.write(keyName);
                    if (value != null) {
                        writer.write(": ");
                        writeValue(writer, value);
                    }
                }

                writer.newLine();
            }
        };
    }

    /** Gets a writer function for writing an object type. */
    static objectType(structure: TypeElementMemberedNodeStructure): WriterFunction {
        return (writer: CodeBlockWriter) => {
            writer.write("{");
            if (anyPropertyHasValue(structure)) {
                writer.indentBlock(() => {
                    structurePrinterFactory.forTypeElementMemberedNode().printText(writer, structure);
                });
            }
            writer.write("}");
        };
    }

    /** Gets a writer function for writing a union type. */
    static unionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]) {
        return getWriteFunctionForUnionOrIntersectionType("|", [firstType, secondType, ...additionalTypes]);
    }

    /** Gets a writer function for writing an intersection type. */
    static intersectionType(firstType: WriterFunctionOrValue, secondType: WriterFunctionOrValue, ...additionalTypes: WriterFunctionOrValue[]) {
        return getWriteFunctionForUnionOrIntersectionType("&", [firstType, secondType, ...additionalTypes]);
    }

    /**
     * Gets a writer function for writing a return statement returning the provided value.
     * @param value - Value to be returned.
     */
    static returnStatement(value: WriterFunctionOrValue): WriterFunction {
        return (writer: CodeBlockWriter) => {
            writer.write("return ");
            writeValue(writer, value);
            writer.write(";");
        };
    }
}

function getWriteFunctionForUnionOrIntersectionType(separator: "|" | "&", args: WriterFunctionOrValue[]) {
    return (writer: CodeBlockWriter) => {
        writeSeparatedByString(writer, ` ${separator} `, args);
    };
}

function anyPropertyHasValue(obj: any) {
    for (const key of Object.keys(obj)) {
        if (obj[key] == null)
            continue;
        if (obj[key] instanceof Array && obj[key].length === 0)
            continue;

        return true;
    }

    return false;
}

function writeSeparatedByString(writer: CodeBlockWriter, separator: string, values: WriterFunctionOrValue[]) {
    for (let i = 0; i < values.length; i++) {
        writer.conditionalWrite(i > 0, separator);
        writeValue(writer, values[i]);
    }
}

function writeValue(writer: CodeBlockWriter, value: WriterFunctionOrValue) {
    if (value instanceof Function)
        value(writer);
    else
        writer.write(value.toString());
}
