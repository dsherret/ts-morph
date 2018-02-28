import {expect} from "chai";
import {ManipulationSettings, ManipulationSettingsContainer, IndentationText} from "./../ManipulationSettings";
import {ts, ScriptTarget, NewLineKind, EditorSettings, IndentStyle} from "./../typescript";
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
            scriptTarget: ScriptTarget.Latest
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
            scriptTarget: ScriptTarget.Latest
        });
    });

    it("should set the settings when setting all of them", () => {
        const settings = new ManipulationSettingsContainer();
        settings.set({
            quoteType: QuoteType.Single,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ScriptTarget.ES3
        });

        checkSettings(settings, {
            quoteType: QuoteType.Single,
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            indentationText: IndentationText.EightSpaces,
            scriptTarget: ScriptTarget.ES3
        });
    });

    describe(nameof<ManipulationSettingsContainer>(c => c.getEditorSettings), () => {
        function doTest(actual: EditorSettings, expected: EditorSettings) {
            expect(actual).is.deep.equal(expected);
        }

        it("should get the default editor settings", () => {
            doTest(new ManipulationSettingsContainer().getEditorSettings(), {
                convertTabsToSpaces: true,
                newLineCharacter: "\n",
                indentStyle: IndentStyle.Smart,
                indentSize: 4,
                tabSize: 4
            });
        });

        it("should get the correct editor settings after changing", () => {
            const container = new ManipulationSettingsContainer();
            container.getEditorSettings(); // fill the internal cache
            container.set({
                indentationText: IndentationText.Tab,
                newLineKind: NewLineKind.CarriageReturnLineFeed
            });

            doTest(container.getEditorSettings(), {
                convertTabsToSpaces: false,
                newLineCharacter: "\r\n",
                indentStyle: IndentStyle.Smart,
                indentSize: 1,
                tabSize: 1
            });
        });
    });
});
