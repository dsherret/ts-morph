import { ManipulationSettingsContainer, SupportedFormatCodeSettings } from "../../options";
import { fillDefaultFormatCodeSettings } from "../../utils";
import { FormatCodeSettings } from "../../compiler";

export function getDefaultFormatCodeSettings(settings: FormatCodeSettings = {}): SupportedFormatCodeSettings {
    const manipulationSettingsContainer = new ManipulationSettingsContainer();
    fillDefaultFormatCodeSettings(settings, manipulationSettingsContainer);
    return settings as SupportedFormatCodeSettings;
}
