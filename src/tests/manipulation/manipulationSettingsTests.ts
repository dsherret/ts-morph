import {expect} from "chai";
import * as ts from "typescript";
import {ManipulationSettings, ManipulationSettingsContainer, IndentationText, StringChar, NewLineKind} from "./../../manipulation";

describe(nameof(IndentationText), () => {
    // ensure this enum is correct. It's hard to read all the spaces since string enums can't use computed values

    it("should have a tab when has a tab", () => {
        expect(IndentationText.Tab).to.equal("\t");
    });

    it("should have two spaces when has two", () => {
        expect(IndentationText.TwoSpaces).to.equal(" ".repeat(2));
    });

    it("should have four spaces when has four", () => {
        expect(IndentationText.FourSpaces).to.equal(" ".repeat(4));
    });

    it("should have eight spaces when has eight", () => {
        expect(IndentationText.EightSpaces).to.equal(" ".repeat(8));
    });
});

describe(nameof(ManipulationSettingsContainer), () => {
    function checkSettings(settings: ManipulationSettingsContainer, settingsSettings: ManipulationSettings) {
        expect(settings.getStringChar()).to.equal(settingsSettings.stringChar);
        expect(settings.getNewLineKind()).to.equal(settingsSettings.newLineKind);
        expect(settings.getIndentationText()).to.equal(settingsSettings.indentationText);
        expect(settings.getScriptTarget()).to.equal(settingsSettings.scriptTarget);
    }

    it("should have the correct defaults", () => {
        const settings = new ManipulationSettingsContainer();
        checkSettings(settings, {
            stringChar: StringChar.DoubleQuote,
            newLineKind: NewLineKind.LineFeed,
            indentationText: IndentationText.FourSpaces,
            scriptTarget: ts.ScriptTarget.Latest
        });
    });

    it("should set the settings when partially setting them", () => {
        const settings = new ManipulationSettingsContainer();
        settings.set({
            stringChar: StringChar.SingleQuote
        });

        checkSettings(settings, {
            stringChar: StringChar.SingleQuote,
            newLineKind: NewLineKind.LineFeed,
            indentationText: IndentationText.FourSpaces,
            scriptTarget: ts.ScriptTarget.Latest
        });
    });

    it("should set the settings when setting all of them", () => {
        const settings = new ManipulationSettingsContainer();
        settings.set({
            stringChar: StringChar.SingleQuote,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ts.ScriptTarget.ES3
        });

        checkSettings(settings, {
            stringChar: StringChar.SingleQuote,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ts.ScriptTarget.ES3
        });
    });
});
