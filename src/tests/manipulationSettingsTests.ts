import {expect} from "chai";
import * as ts from "typescript";
import {ManipulationSettings, ManipulationSettingsContainer, IndentationText, NewLineKind} from "./../ManipulationSettings";
import {QuoteType} from "./../compiler";
import {StringUtils} from "./../utils";

describe(nameof(IndentationText), () => {
    // ensure this enum is correct. It's hard to read all the spaces since string enums can't use computed values

    it("should have a tab when has a tab", () => {
        expect(IndentationText.Tab).to.equal("\t");
    });

    it("should have two spaces when has two", () => {
        expect(IndentationText.TwoSpaces).to.equal(StringUtils.repeat(" ", 2));
    });

    it("should have four spaces when has four", () => {
        expect(IndentationText.FourSpaces).to.equal(StringUtils.repeat(" ", 4));
    });

    it("should have eight spaces when has eight", () => {
        expect(IndentationText.EightSpaces).to.equal(StringUtils.repeat(" ", 8));
    });
});

describe(nameof(ManipulationSettingsContainer), () => {
    function checkSettings(settings: ManipulationSettingsContainer, settingsSettings: ManipulationSettings) {
        expect(settings.getQuoteType()).to.equal(settingsSettings.quoteType);
        expect(settings.getNewLineKind()).to.equal(settingsSettings.newLineKind);
        expect(settings.getIndentationText()).to.equal(settingsSettings.indentationText);
        expect(settings.getScriptTarget()).to.equal(settingsSettings.scriptTarget);
    }

    it("should have the correct defaults", () => {
        const settings = new ManipulationSettingsContainer();
        checkSettings(settings, {
            quoteType: QuoteType.Double,
            newLineKind: NewLineKind.LineFeed,
            indentationText: IndentationText.FourSpaces,
            scriptTarget: ts.ScriptTarget.Latest
        });
    });

    it("should set the settings when partially setting them", () => {
        const settings = new ManipulationSettingsContainer();
        settings.set({
            quoteType: QuoteType.Single
        });

        checkSettings(settings, {
            quoteType: QuoteType.Single,
            newLineKind: NewLineKind.LineFeed,
            indentationText: IndentationText.FourSpaces,
            scriptTarget: ts.ScriptTarget.Latest
        });
    });

    it("should set the settings when setting all of them", () => {
        const settings = new ManipulationSettingsContainer();
        settings.set({
            quoteType: QuoteType.Single,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ts.ScriptTarget.ES3
        });

        checkSettings(settings, {
            quoteType: QuoteType.Single,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ts.ScriptTarget.ES3
        });
    });
});
