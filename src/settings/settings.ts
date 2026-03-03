import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, ColorComponent, Notice, addIcon, setIcon} from "obsidian";
import type LocationAddPlugin from "../main";
import { IconColorAssociation } from "../models/IconColorAssociation"

export interface LocationAddSettings {
	templatePath: string;
	iconColorLookup: boolean,
	icaDict: {[id: string] : IconColorAssociation},
}

export const DEFAULT_SETTINGS: LocationAddSettings = {
	templatePath: '',
	iconColorLookup: false,
	icaDict: {}
}

export class LocationAddTab extends PluginSettingTab {
	plugin: LocationAddPlugin;
	private icaType: TextComponent;
	private strType: string;
	private icaIcon: TextComponent;
	private strIcon: string | undefined;
	private icaColor: ColorComponent;
	private strColor: string | undefined;
	private icaAddBtn: ButtonComponent;

	constructor(app: App, plugin: LocationAddPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	setICADisabled(disabled: boolean): void {
		this.icaType?.setDisabled(disabled);
		this.icaIcon?.setDisabled(disabled);
		this.icaColor?.setDisabled(disabled);
		this.icaAddBtn?.setDisabled(disabled);
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		const settings = this.plugin.settings;
		
		// To-Do make this a searchable drop down
		new Setting(containerEl)
			.setName('Path to template file')
			.setDesc('See README docs for example template file')
			.addText((text) =>
				text
				.setPlaceholder('path/to/template/file')
				.setValue(settings.templatePath)
				.onChange(async (value) => {
					settings.templatePath = value;
					await this.plugin.saveSettings();
				}));
		
		// Enable / disable icon lookups
		const icDesc = document.createDocumentFragment();
		icDesc.appendText('Use custom associations for ');  
		icDesc.createEl('a', {  
			text: 'icons',  
			attr: { href: 'https://lucide.dev/icons/', target: '_blank' }  
		});
		icDesc.appendText(' and ');
		icDesc.createEl('a', {  
			text: 'colors',  
			attr: { href: 'https://en.wikipedia.org/wiki/Web_colors', target: '_blank' }  
		});

		// toggle custom definitions on and off
		new Setting(containerEl)  
			.setName('Icon and color associations')
			.setDesc(icDesc)
			.addToggle(toggle => toggle  
				.setValue(settings.iconColorLookup)  
				.onChange(async (value) => {  
					settings.iconColorLookup = value;  
					await this.plugin.saveSettings();
					this.setICADisabled(!value);
					this.display();
				})  
			);
		
		// Icon and color association settings
		const icAssociation = new Setting(containerEl)
            .setName('Add new icon color association')
            .setDesc('Add or update type association with icon/color')
			.setDisabled(!settings.iconColorLookup);
		
		// Set type of location (e.g. landmark, park, building)
		icAssociation.addText((text) =>{
			this.icaType = text;
			text
				.setPlaceholder("type: e.g. landmark")
				.setDisabled(!settings.iconColorLookup)
				.onChange((value) =>
					{
						this.strType = value
					}
				);
		});

		// Set icon str
		// To-Do: this should be a lookup box with icons rendered
		icAssociation.addText((text) => {
			this.icaIcon = text;
			text
				.setPlaceholder("icon: e.g. tree")
				.onChange((value) => {this.strIcon = value;})
				.setDisabled(!settings.iconColorLookup);
			});
		
		// Set color str
		icAssociation.addColorPicker((color) => {
			this.icaColor = color;
			color
			.onChange((value) => {this.strColor = value;})
			.setDisabled(!settings.iconColorLookup);
		});

		icAssociation.addExtraButton((button) => {
			button
			.setIcon('plus')
			.onClick(async () => {
				if(this.icaType.getValue() === undefined || this.icaType.getValue() === ''){
					const strError: string = "Must supply a type name. Setting not saved";
					console.error(strError);
					new Notice(strError);
					return;
				}
				// To-Do check that one or both color or icon are set if not give notice
				if (this.strIcon === undefined && this.strColor === undefined){
					const strError: string = "Must supply an icon and/or color";
					console.error(strError);
					new Notice(strError);
					return;
				}
				// To-Do add backup toggle to search lucide and pick first item from searched array
				settings.icaDict[this.strType]= {'color':this.strColor, 'icon':this.strIcon};
				console.log(settings.icaDict);
				this.strColor = undefined;
				this.strIcon = undefined;
				await this.plugin.saveSettings();
				this.display();
			})
			.setDisabled(!settings.iconColorLookup)});

		// Display list of set icons
		// To-Do turn this into a clean list
		// add listing for each item in the dictionary
		for (let K in settings.icaDict){
			if (K === undefined) return;
			let icaIconColor = settings.icaDict[K];
			const icaSetting = new Setting(containerEl);
			icaSetting.setName(K)
			// Show assigned color
			if (icaIconColor?.color){
				const setColor = icaIconColor.color;
				icaSetting.addColorPicker((color) => {
					color
					.setDisabled(true)
					.setValue(setColor);
			})};

			if (icaIconColor?.icon){
				const setIcon = icaIconColor.icon;
				icaSetting.addExtraButton((button) => {
					button.setIcon(setIcon).setDisabled;
				})
			}

			// Delete this association button
			icaSetting.addExtraButton((button) => {
				button
				.setIcon('trash')
				.setTooltip('Delete')
				.onClick( async () =>{
					delete settings.icaDict[K];
					console.log(settings.icaDict);
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}
}
