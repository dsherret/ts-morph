import { CodeBlockWriter } from "../../codeBlockWriter";
import { FormatCodeSettings } from "../../compiler";
import { StructurePrinterFactory } from "../../factories";
import { ManipulationSettingsContainer, SupportedFormatCodeSettings } from "../../options";
import { fillDefaultFormatCodeSettings } from "../../utils";

export function getDefaultFormatCodeSettings(settings: FormatCodeSettings = {}): SupportedFormatCodeSettings {
    const manipulationSettingsContainer = new ManipulationSettingsContainer();
    fillDefaultFormatCodeSettings(settings, manipulationSettingsContainer);
    return settings as SupportedFormatCodeSettings;
}

export function getStructureFactoryAndWriter(settings?: FormatCodeSettings) {
    return {
        writer: new CodeBlockWriter(),
        factory: getStructureFactory(settings)
    };
}

export function getStructureFactory(settings?: FormatCodeSettings) {
    return new StructurePrinterFactory(() => getDefaultFormatCodeSettings(settings));
}
