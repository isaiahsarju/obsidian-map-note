import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, requestUrl, RequestUrlParam, Setting, apiVersion} from 'obsidian';
import LocationAddPlugin from "../main";
import { MapLocation } from 'models/MapLocation';
import { RuntimeSettings } from 'models/RuntimeSettings';

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
     * @param {string} searchText - Freeform Nominatim API freeform style query string
     * @returns {Promise<object[]>} Promise of an Array of OSM locations
     */
    private async searchNominatimFreeform(searchText: string): Promise<object[]> {
        // Freeform search query
        const url: string = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(searchText) + "&format=json";
        // Headers
        // User-Agent or Referer required for Nominatim use
        const headers: Record<string, string> = {"Accept": "applicaiton/json", "User-Agent": 'obsidian-api/'+apiVersion};
        // Obsidian style RequestUrlParam
        // Set throw to false so we can see complete error from Nominatim
        const rupNominatim: RequestUrlParam = {url: url, method:"GET", headers: headers, throw: false};
        
        // Perform Freeform search
        try {
            const response = await requestUrl(rupNominatim);
            if (response.status !== 200) {
                throw new Error(`Response status (${response.status}): ${response.text}`);
            }

            const results: Array<object> = (response.json as object[]);
            return results;
        }
        // Catch errors
        catch (error) {
            const emptyArray: Array<object> = new Array<object>;
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

    /**
     * Get map locations and set mapLocations for return with callback function
     */
    private async getLocations(): Promise<void> {
        // Must enter a query
        if (!this.query) return void new Notice('No query entered.');
        new Notice(`You searched for '${this.query}'`);
        if (this.isBusy) return;

        // Get and set mapLocations from searchNominatim search
        // mapLocations is not returned directly but as a part of the callback function
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
    
    /**
     * @inheritdoc {Modal.onOpen}
     */
    onOpen() {
        // Search box
        new Setting(this.contentEl)
            .setName('Search')
            .addText((text) =>
                text
                .setPlaceholder("Cloud gate chicago")
                .onChange((value) => {
                this.query = value;
                this.rtSettings.queryText = this.query;
                })
                .inputEl.addEventListener('keydown', (event): void => {
                    if(event.key === 'Enter' && !event.isComposing){
                        //IIFE https://developer.mozilla.org/en-US/docs/Glossary/IIFE
                        // to resolve "Promise returned in function argument where a void return was expected" lint error
                        (() =>{
                            void this.getLocations().catch(console.warn);
                        })();
                    }
                })
            )
                //.inputEl.addEventListener('keydown', event => event.key === 'Enter' && !event.isComposing && this.getLocations()));
        // Search button
        new Setting(this.contentEl).addButton(btn => {
            this.searchBtnRef = btn
                .setButtonText(this.SEARCH_BUTTON_TEXT)
                .setCta()
                .onClick(() => this.getLocations());
            });
    }

    /**
     * @inheritdoc {Modal.onClose}
     */
    onClose() {
        let {contentEl} = this;
        contentEl.empty();
    }
}