import { FormatCodeSettings } from "../../compiler";
import { ManipulationSettingsContainer, SupportedFormatCodeSettings } from "../../options";
import { fillDefaultFormatCodeSettings } from "../../utils";

export function getDefaultFormatCodeSettings(settings: FormatCodeSettings = {}): SupportedFormatCodeSettings {
    const manipulationSettingsContainer = new ManipulationSettingsContainer();
    fillDefaultFormatCodeSettings(settings, manipulationSettingsContainer);
    return settings as SupportedFormatCodeSettings;
}
