import { App, Notice, Plugin, normalizePath, TFile} from 'obsidian';
import { DEFAULT_SETTINGS, LocationAddSettings, LocationAddTab } from './settings/settings';
import { SearchLocationModal } from 'modals/SearchLocationModal';
import { SearchResultsModal } from 'modals/SearchResultsModal';
import { AddCurrentLocationModal } from 'modals/AddCurrentLocationModal'; // To-Do Allow a user to create a location based on the GPS of their device
import { MapLocation } from 'models/MapLocation';
import { RuntimeSettings } from 'models/RuntimeSettings';
import { replacePlaceHolders } from 'utils/utils'

/**
 * LocationAddPlugin that provides methods to
 * create locations by searching OpenStreetMaps database
 * via the nominatim OSM api
 */
export default class LocationAddPlugin extends Plugin {
	settings: LocationAddSettings;
	
	/**
	 * @inheritDoc {Plugin.onload}
	 */
	async onload() {
		await this.loadSettings();

		// Creates an icon in the left ribbon.
		// To-Do: add setting to disable this
		this.addRibbonIcon('map-pin-plus', 'New Location', () =>  this.createNewLocationNote())

		// Adds a new location by calling OSM API,
		// resolving location data, and filling out a template
		this.addCommand({
			id: 'new-location',
			name: 'Add a new location',
			callback: () => this.createNewLocationNote()
		});

		// Adds location data to a current note, pre-filling search
		// with the name of the note
		this.addCommand({
			id: 'add-location-data',
			name: 'Add location data to current note',
			callback: () => this.addLocationData()
		})

		// Adds a location based on the users current GPS coordinates
		// To-Do: Implement
		this.addCommand({
			id: 'new-location-from-gps',
			name: 'Add current location',
			callback: () => this.addCurrentLocation()
		});


		// Adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new LocationAddTab(this.app, this));
	}
	
	/**
	 * Load plugin settings
	 */
	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<LocationAddSettings>);
	}

	/**
	 * Save plugin settings
	 */
	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
	
	/**
	 * Open modal to search for a location
	 * @param {RuntimeSettings} rtSettings - Settings that are shared between modals (e.g. Search query string)
	 * @returns {PromiseLike<MapLocation[]>}
	 */
	async openSearchLocationModal(rtSettings: RuntimeSettings): Promise<MapLocation[]>{
		return new Promise((resolve, reject) => {
			// Open SearchLocationModal to search for locations
			return new SearchLocationModal(this.app, rtSettings, (error, results) => {
				return error ? reject(error) : resolve(results);
			}).open();
		});
	}

	/**
	 * Open modal to select correct location
	 * @param {MapLocation[]} mapLocations - Array of MapLocations
	 * @param rtSettings - Settings that are shared between modals (e.g. Search query string)
	 * @returns {PromiseLike<MapLocation>}
	 */
	async openSearchResultsModal(mapLocations: MapLocation[], rtSettings: RuntimeSettings): Promise<MapLocation>{
		return new Promise((resolve, reject) => {
			// Open SearchResultsModal to select desired location
			return new SearchResultsModal(this.app, mapLocations, (error, result) => {
				return error ? reject(error) : resolve(result);
			}, rtSettings).open();
		});
	}

	/**
	 * Search for and select a MapLocation.
	 * Sets a RuntimeSettings object to pass to results modal to pre-fill text.
	 * Opens SearchLocationModal and then opens SearchResultsModal with the found locations.
	 * @param {string} query - string used to search for location
	 * @returns {PromiseLike<MapLocation} a MapLocation
	 */
	async selectCorrectLocation(query?: string): Promise<MapLocation>{
		// Create RuntimeSettings object to hold query text
		let rtSettings: RuntimeSettings = {queryText: query ? query : ''};
		// Search for a location
		const mapLocations = await this.openSearchLocationModal(rtSettings);
		// Return selected location from a list of locations
		return await this.openSearchResultsModal(mapLocations, rtSettings);
	}

	async createNewLocationNote(): Promise<void>{
		let vault = this.app.vault;
		try {
			// Get correct Locaiton
			const mapLocation = await this.selectCorrectLocation();
			console.info(`Selected name: ${mapLocation.name}\ndisplay_name: ${mapLocation.display_name}\ntype: ${mapLocation.type}`);
			console.debug(mapLocation);

			// Make new note from location
			const fileName = (mapLocation.name ? mapLocation.name : mapLocation.display_name) + '.md';
			const templatePath = normalizePath(this.settings.templatePath) + '.md';
			const templateFile = vault.getFileByPath(templatePath);
			let fileContents = '';

			// Set icons and colors inside of MapLocation Object
			// The dictionary of icon and color associations (ica)
            const icaDict = this.settings.icaDict;
			const mapLocationType = mapLocation.type;

			// If the icaDict has any definitions and mapLocationType is defined
			// then we can lookup icons and colors based on the type.
			// These associations are defined under the settings
            if (icaDict !== undefined && mapLocationType !== undefined){
				const icaIcon = icaDict[mapLocationType]?.icon;
				const icaColor = icaDict[mapLocationType]?.color;
				if (icaIcon) mapLocation.lucide_icon = icaIcon;
				if (icaColor) mapLocation.color = icaColor;
            }

			// To-Do, add setting for looking up lucide icons based on type and selecting
			// the first one
			
			// Only create a new file if template is defined
			if (templateFile) {
				// Read and fill out templated text
				const fileTemplateText = await vault.read(templateFile);
				fileContents = replacePlaceHolders(mapLocation, fileTemplateText);
			} else {
				// If no template file found: throw an error
				throw new Error(`Template file not found: ${templatePath}`)
			}
			const targetFile = await this.app.vault.create(fileName, fileContents);
			
			// Get active leaf and open created note
			const activeLeaf = this.app.workspace.getLeaf();
			if (!activeLeaf) {
				console.warn('No active leaf');
				return;
			}

			await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
			activeLeaf.setEphemeralState({ rename: 'all' });
		} catch (error){
			// https://www.youtube.com/watch?v=JuYeHPFR3f0
			console.warn(error);
			new Notice(`${error}`);
		}
	}

	/**
	 * Prepends location data to the current note based on template
	 */
	async addLocationData(): Promise<void>{
		// To-do: add insertMetadata like function from https://github.com/anpigon/obsidian-book-search-plugin/blob/master/src/main.ts#L141
		const strWarn = 'addLocationData() not yet implemented'
		console.warn(strWarn);
		new Notice(`${strWarn}`);
	}

	/**
	 * Creates new location note based on current GPS coordinates
	 */
	async addCurrentLocation(): Promise<void>{
		const strWarn = 'addCurrentLocation() not yet implemented'
		console.warn(strWarn);
		new Notice(`${strWarn}`);
	}
};
