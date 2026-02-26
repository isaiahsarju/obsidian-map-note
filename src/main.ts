import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LocationAddSettings, LocationAddTab } from './settings/settings';
import { AddLocationModal } from './modals/AddLocationModal';
import { AddCurrentLocationModal } from './modals/AddCurrentLocationModal';


// Remember to rename these classes and interfaces!

export default class LocationAddPlugin extends Plugin {
	settings: LocationAddSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('map', 'New Location', () => {
				new AddLocationModal(this.app).open();
			})

		// This adds a new location
		this.addCommand({
			id: 'new-location',
			name: 'Add a new location',
			callback: () => {
				new AddLocationModal(this.app).open();
			}
		});

		// This adds a location based on the users current GPS coordinates
		this.addCommand({
			id: 'new-location-from-gps',
			name: 'Add current location',
			callback: () => {
				new AddCurrentLocationModal(this.app).open();
			}
		});


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LocationAddTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<LocationAddSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
};
