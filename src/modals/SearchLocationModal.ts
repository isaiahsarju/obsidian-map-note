import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, Setting} from 'obsidian';
import LocationAddPlugin from "../main";
import { MapLocation } from 'models/MapLocation';
import { RuntimeSettings } from 'models/RuntimeSettings';
import { assert } from 'console';

/**
 * A Modal used to search for desired OSM location
 */
export class SearchLocationModal extends Modal {
    plugin: LocationAddPlugin;
    private readonly TITLE: string = 'Location Search';
    private readonly SEARCH_BUTTON_TEXT: string  = 'Search';
    private readonly SEARCHING_BUTTON_TEXT: string = 'Searching...';
    /** Set to busy if button clicked and search occuring  */
    private isBusy = false;
    /** Reference to search button */
    private searchBtnRef?: ButtonComponent;
    /** Location search string */
    private query?: string;
    /**
     * RunTimeSettings object used to track settings accross Modals,
     * in addition to saved plugin settings. e.g. used to track query string
     * between SearchLocationModal and SearchResultsModal
     */
    private rtSettings: RuntimeSettings;
    
    constructor(
        app: App,
        rtSettings: RuntimeSettings,
        private callback: (error: Error | null, result: MapLocation[]) => void,
        ) {
        super(app);
        this.rtSettings = rtSettings;
        this.query = this.rtSettings.queryText;
    }

    /**
     * 
     * @param {string} searchText - Freeform Nominatim API style query string
     * @returns {Promise<any[]>} Promise of an Array of OSM locations
     */
    private async searchNominatimFreeform(searchText: string): Promise<any[]> {
        const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(searchText) + "&format=json";

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const results: Array<any> = await response.json() as Array<any>;
            return results;
        }
        catch (error) {
            const emptyArray: Array<any> = new Array;
            console.warn('Failed to get results of search', error);
            return emptyArray;
        }
    }

    //To-Do implement advanced search

    /**
     * Change button text based if search is occuring (busy) or not (not busy)
     * @param {boolean} busy - Boolean designating if busy (i.e. search occuring)
     */
    setBusy(busy: boolean): void {
        this.isBusy = busy;
        this.searchBtnRef?.setDisabled(busy).setButtonText(busy ? this.SEARCHING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
    }

    // Returns all available suggestions.
    private async getLocations(): Promise<void> {
        if (!this.query) return void new Notice('No query entered.');
        new Notice(`You searched for '${this.query}'`);
        if (this.isBusy) return;

        let  mapLocations: MapLocation[] = [];
        this.setBusy(true);
        try {
            let mapLocations: MapLocation[] = await this.searchNominatimFreeform(this.query) as MapLocation[];
            if (!mapLocations?.length) return void new Notice(`No results found for "${this.query}"`);
            this.callback(null, mapLocations);
        } catch (err) {
            this.callback(err as Error, mapLocations);
        } finally {
            this.setBusy(false);
            this.close();
        }
    }

    onOpen() {
        let {contentEl} = this;
        new Setting(this.contentEl)
            .setName('Search')
            .addText((text) =>
                text
                .setPlaceholder("e.g. Cloud Gate Chicago")
                .onChange((value) => {
                this.query = value;
                this.rtSettings.queryText = this.query;
                })
                .inputEl.addEventListener('keydown', event => event.key === 'Enter' && !event.isComposing && this.getLocations()));

        new Setting(this.contentEl).addButton(btn => {
            this.searchBtnRef = btn
                .setButtonText(this.SEARCH_BUTTON_TEXT)
                .setCta()
                .onClick(() => this.getLocations());
            });
    }

    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}