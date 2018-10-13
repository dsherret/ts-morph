import { CodeBlockWriter } from "../codeBlockWriter";
import { WriterFunction } from "../types";

/** Functions for writing. */
export class WriterFunctions {
    private constructor() {
    }

    /**
     * Gets a writer function for writing the provided object as an object literal expression.
     * @param obj - Object to write.
     */
    static object(obj: { [key: string]: string | number | WriterFunction | undefined; }): WriterFunction {
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
                        if (value instanceof Function)
                            value(writer);
                        else
                            writer.write(value.toString());
                    }
                }

                writer.newLine();
            }
        };
    }
}
