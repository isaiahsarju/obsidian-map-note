import { App, Notice, Plugin, normalizePath, TFile} from 'obsidian';
import { DEFAULT_SETTINGS, LocationAddSettings, LocationAddTab } from './settings/settings';
import { SearchLocationModal } from 'modals/SearchLocationModal';
import { SearchResultsModal } from 'modals/SearchResultsModal';
import { AddCurrentLocationModal } from 'modals/AddCurrentLocationModal';
import { MapLocation } from 'models/MapLocation';
import { RuntimeSettings } from 'models/RuntimeSettings';
import { replacePlaceHolders } from 'utils/utils'


// Remember to rename these classes and interfaces!

export default class LocationAddPlugin extends Plugin {
	settings: LocationAddSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('map-pin-plus', 'New Location', () =>  this.createNewLocationNote())

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

	async openSearchLocationModal(rtSettings: RuntimeSettings): Promise<MapLocation[]>{
		return new Promise((resolve, reject) => {
			return new SearchLocationModal(this.app, rtSettings, (error, results) => {
				return error ? reject(error) : resolve(results);
			}).open();
		});
	}

	async openSearchResultsModal(mapLocations: MapLocation[], rtSettings: RuntimeSettings): Promise<MapLocation>{
		return new Promise((resolve, reject) => {
			return new SearchResultsModal(this.app, mapLocations, (error, result) => {
				return error ? reject(error) : resolve(result);
			}, rtSettings).open();
		});
	}

	async selectCorrectLocation(query?: string): Promise<MapLocation>{
		let rtSettings: RuntimeSettings = {queryText: query ? query : ''};
		const mapLocations = await this.openSearchLocationModal(rtSettings);
		return await this.openSearchResultsModal(mapLocations, rtSettings);
	}

	async createNewLocationNote(): Promise<void>{
		let vault = this.app.vault;
		try {
			// Get correct Locaiton
			const mapLocation = await this.selectCorrectLocation();
			console.log(`Selected name: ${mapLocation.name}\ndisplay_name: ${mapLocation.display_name}\ntype: ${mapLocation.type}`);
			console.debug(mapLocation);

			// Make new note from location
			const fileName = (mapLocation.name ? mapLocation.name : mapLocation.display_name) + '.md';
			const templatePath = normalizePath(this.settings.templatePath) + '.md';
			const templateFile = vault.getFileByPath(templatePath);
			let fileContents = '';
			if (templateFile) {
				const fileTemplateText = await vault.read(templateFile);
				fileContents = replacePlaceHolders(mapLocation, fileTemplateText);
			} else {
				throw new Error(`Template file not found: ${templatePath}`)
			}
			const targetFile = await this.app.vault.create(fileName, fileContents);
			
			// open file
			const activeLeaf = this.app.workspace.getLeaf();
			if (!activeLeaf) {
				console.warn('No active leaf');
				return;
			}

			await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
			activeLeaf.setEphemeralState({ rename: 'all' });

		} catch (error){
			console.warn(error);
			new Notice(`${error}`);
		}
	}
};
