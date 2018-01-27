import {expect} from "chai";
import * as errors from "./../../errors";
import {StringUtils} from "./../../utils";

describe(nameof(StringUtils), () => {
    describe(nameof(StringUtils.getLineNumberFromPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLineNumberFromPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLineNumberFromPos("", 1)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLineNumberFromPos("", 2)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(newLineType: string) {
            let str = `testing${newLineType}this${newLineType}out`;
            const pos = str.length;
            str += `${newLineType}more and more${newLineType}and more`;
            expect(StringUtils.getLineNumberFromPos(str, pos)).to.equal(3);
        }

        it("should get the line position for the specified pos when using \r newlines", () => {
            doTest("\r");
        });

        it("should get the line position for the specified pos when using \n newlines", () => {
            doTest("\n");
        });

        it("should get the line position for the specified pos when using \r\n newlines", () => {
            doTest("\r\n");
        });

        it("should get the line position for the specified pos when right after the newline when mixing newlines", () => {
            let str = "testing\r\nthis\nout\rmore\r\nandmore\n";
            const pos = str.length;
            str += "out\r\nmore and more";
            expect(StringUtils.getLineNumberFromPos(str, pos)).to.equal(6);
        });
    });
});
