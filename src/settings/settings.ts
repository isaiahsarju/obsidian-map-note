import { App, PluginSettingTab, SecretComponent, Setting, ToggleComponent } from "obsidian";
import type LocationAddPlugin from "../main";

export interface LocationAddSettings {
	templatePath: string;
}

export const DEFAULT_SETTINGS: LocationAddSettings = {
	templatePath: '',
}

export class LocationAddTab extends PluginSettingTab {
	plugin: LocationAddPlugin;

	constructor(app: App, plugin: LocationAddPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		
		new Setting(containerEl)
			.setName('Path to template file')
			.setDesc('See README docs for example template file')
			.addText((text) =>
				text
				.setPlaceholder('path/to/template/file')
				.setValue(this.plugin.settings.templatePath)
				.onChange(async (value) => {
					this.plugin.settings.templatePath = value;
					await this.plugin.saveSettings();
				}));
	}
}
