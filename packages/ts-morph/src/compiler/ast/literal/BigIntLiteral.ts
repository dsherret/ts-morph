import { ts, errors } from "@ts-morph/common";
import { replaceNodeText } from "../../../manipulation";
import { LiteralExpression } from "../expression";

declare function BigInt(value: any): any;

export const BigIntLiteralBase = LiteralExpression;
export class BigIntLiteral extends BigIntLiteralBase<ts.BigIntLiteral> {
    /**
     * Gets the BigInt literal value.
     *
     * Assert this as a `bigint` in environments that support it.
     */
    getLiteralValue(): unknown {
        const text = this.compilerNode.text;
        if (typeof BigInt === "undefined")
            throw new errors.InvalidOperationError("Runtime environment does not support BigInts. Perhaps work with the text instead?");
        const textWithoutN = text.substring(0, text.length - 1);
        return BigInt(textWithoutN);
    }

    /**
     * Sets the bigint literal value.
     * @param value - Value to set (must provide a bigint here at runtime).
     */
    setLiteralValue(value: unknown) {
        if (typeof value !== "bigint")
            throw new errors.ArgumentTypeError(nameof(value), "bigint", typeof value);

        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart(),
            replacingLength: this.getWidth(),
            newText: value.toString() + "n"
        });
        return this;
    }
}
