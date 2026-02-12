import { App, PluginSettingTab, SecretComponent, Setting, ToggleComponent } from "obsidian";
import type LocationAddPlugin from "../main";

export interface LocationAddSettings {
	openStreetsCLIENT_ID: string;
	openStreetsCLIENT_SECRET: string;
	fUseDevURI: boolean;
}

export const DEFAULT_SETTINGS: LocationAddSettings = {
	openStreetsCLIENT_ID: '',
	openStreetsCLIENT_SECRET: '',
	fUseDevURI: false
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
			.setName('OpenStreets CLIENT_ID')
			.setDesc('Set Your OpenStreets CLIENT_ID')
			.addText((text) =>
				text
				.setPlaceholder('CLIENT_ID')
				.setValue(this.plugin.settings.openStreetsCLIENT_ID)
				.onChange(async (value) => {
					this.plugin.settings.openStreetsCLIENT_ID = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('OpenStreets CLIENT_SECRET')
			.setDesc('Set Your OpenStreets CLIENT_SECRET')
			.addComponent(el => new SecretComponent(this.app, el)
				.setValue(this.plugin.settings.openStreetsCLIENT_SECRET)
				.onChange(async (value) => {
					this.plugin.settings.openStreetsCLIENT_SECRET = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Use Dev URI')
			.setDesc('Check this box to use https://master.apis.dev.openstreetmap.org instead of https://api.openstreetmap.org')
			.addComponent(el  => new ToggleComponent(el)
					.setValue(this.plugin.settings.fUseDevURI)
					.onChange(async value => {
						this.plugin.settings.fUseDevURI = value;
						await this.plugin.saveSettings();
						this.display();
					}));
	}
}
