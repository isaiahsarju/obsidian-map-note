import { App, PluginSettingTab, Setting, ButtonComponent, TextComponent, ColorComponent, Notice, addIcon, setIcon} from "obsidian";
import type LocationAddPlugin from "../main";
import { IconColorAssociation } from "../models/IconColorAssociation"

/**
 * An interface describing LocationAddSettings
 * @public
 */
export interface LocationAddSettings {
	/** Path to template */
	templatePath: string;
	/** Boolean to perform icon and color associations */
	iconColorLookup: boolean,
	/** Dictionary where the key is the type and members are color and icon */
	icaDict: {[id: string] : IconColorAssociation},
}

/**
 * A dictionary with default LocationAddSettings
 * @public
 */
export const DEFAULT_SETTINGS: LocationAddSettings = {
	/** @inheritdoc LocationAddSettings.templatePath */
	templatePath: '',
	/** @inheritdoc LocationAddSettings.iconColorLookup */
	iconColorLookup: false,
	/** @inheritdoc LocationAddSettings.icaDict */
	icaDict: {}
}

/**
 * Plugin settings class for LocationAddPlugin
 * @implements {PluginSettingTab}
 */
export class LocationAddTab extends PluginSettingTab {
	/** @inheritdoc LocationAddPlugin */
	plugin: LocationAddPlugin;
	/** {TextComponent} to denote location type to associate with icon and/or color */
	private icaType: TextComponent;
	private strType: string;
	/** {TextComponent} to denote icon string */
	private icaIcon: TextComponent;
	private strIcon: string | undefined;
	/** {ColorComponent} to denote color */
	private icaColor: ColorComponent;
	private strColor: string | undefined;
	/** ButtonComponent used to create a new association of {type: IconColorAssociation} */
	private icaAddBtn: ButtonComponent;

	constructor(app: App, plugin: LocationAddPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Disable setting components
	 * @param {boolean} disabled if `true` then then disable setting components
	 */
	setICADisabled(disabled: boolean): void {
		this.icaType?.setDisabled(disabled);
		this.icaIcon?.setDisabled(disabled);
		this.icaColor?.setDisabled(disabled);
		this.icaAddBtn?.setDisabled(disabled);
	}

	/** @inheritdoc {PluginSettingTab.display} */
	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		const settings = this.plugin.settings;
		
		// Path to template file
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
		
		// Description for toggle of using/not using associations
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

		// To-Do add backup toggle to search lucide and pick first item from searched array

		// Toggle custom associations of {type: IconColorAssociation} on and off
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
		
		// Input fields to define new {type: IconColorAssociation} dictionary member
		const icAssociation = new Setting(containerEl)
            .setName('Add new icon color association')
            .setDesc('Add/update associations')
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

		// Extra + button to create new dictionary entry of {type: IconColorAssociation}
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
				// Only makes sense to make association if there is a color and/or icon set
				if (this.strIcon === undefined && this.strColor === undefined){
					const strError: string = "Must supply an icon and/or color";
					console.error(strError);
					new Notice(strError);
					return;
				}
				settings.icaDict[this.strType]= {'color':this.strColor, 'icon':this.strIcon};
				this.strColor = undefined;
				this.strIcon = undefined;
				await this.plugin.saveSettings();
				this.display();
			})
			.setDisabled(!settings.iconColorLookup)});

		// Display list of set icons
		// To-Do turn this into a clean list instead of a new setting for each one
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

			// Button to delete thh association and remove it from the dictionary
			icaSetting.addExtraButton((button) => {
				button
				.setIcon('trash')
				.setTooltip('Delete')
				.onClick( async () =>{
					delete settings.icaDict[K];
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}
}
