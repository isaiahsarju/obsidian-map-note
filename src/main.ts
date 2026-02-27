import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LocationAddSettings, LocationAddTab } from './settings/settings';
import { SearchLocationModal } from 'modals/SearchLocationModal';
import { SearchResultsModal } from 'modals/SearchResultsModal';
import { AddCurrentLocationModal } from 'modals/AddCurrentLocationModal';
import { MapLocation } from 'models/MapLocation';


// Remember to rename these classes and interfaces!

export default class LocationAddPlugin extends Plugin {
	settings: LocationAddSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('map', 'New Location', () =>  this.createNewLocationNote())

		// This adds a new location
		this.addCommand({
			id: 'new-location',
			name: 'Add a new location',
			callback: () => this.createNewLocationNote()
		});

		// This adds a location based on the users current GPS coordinates
		this.addCommand({
			id: 'new-location-from-gps',
			name: 'Add current location',
			callback: () => this.createNewLocationNote()
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
	
	// To-do: add insertMetadata like function from https://github.com/anpigon/obsidian-book-search-plugin/blob/master/src/main.ts#L141

	async openSearchLocationModal(query = ''): Promise<MapLocation[]>{
		return new Promise((resolve, reject) => {
			return new SearchLocationModal(this.app, query, (error, results) => {
				return error ? reject(error) : resolve(results);
			}).open();
		});
	}

	async openSearchResultsModal(mapLocations: MapLocation[]): Promise<MapLocation>{
		return new Promise((resolve, reject) => {
			return new SearchResultsModal(this.app, mapLocations, (error, result) => {
				return error ? reject(error) : resolve(result);
			}).open();
		});
	}

	async selectCorrectLocation(query?: string): Promise<MapLocation>{
		const mapLocations = await this.openSearchLocationModal(query);
		return await this.openSearchResultsModal(mapLocations);
	}
	async createNewLocationNote(): Promise<void>{
		const mapLocation = await this.selectCorrectLocation();
	}
};
