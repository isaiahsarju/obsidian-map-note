import { App, SuggestModal, Notice} from 'obsidian';
import type LocationAddPlugin from "../main";
import { MapLocation } from '../models/MapLocation';
import { RuntimeSettings } from 'models/RuntimeSettings';

/**
 * A Modal used to select desired OSM location
 */
export class SearchResultsModal extends SuggestModal<MapLocation> {
    plugin: LocationAddPlugin;
    /** Intial string to fill out SuggestModal search box */
    private initialQuery: string;
    
    constructor(
        app: App,
        /** Array of potential MapLocations */
        private readonly suggestion: MapLocation[],
        /** Callback function to return a single MapLocation */ 
        private onChoose: (error: Error | null, result: MapLocation) => void,
        /** RuntimeSettings to pass shard information like query string */
        private rtSettings: RuntimeSettings){
        super(app);
        // Set initial string
        this.initialQuery = rtSettings.queryText ? rtSettings.queryText : ' ';
    }

    /**
     * 
     * @param {string} query - String for getting subset of MapLocations from all locations in MapLocation[]
     * @returns {MapLocation[]}
     * @inheritdoc {SuggestModal.getSuggestions}
     */
    getSuggestions(query: string): MapLocation[] {
        return this.suggestion.filter(mapLocation => {
            const searchQuery: string = query?.toLowerCase();
            const eachWord: string[] = searchQuery.split(/,| /);
            return(
                // Include map location if:
                // every word in query string is in the display_name (the long OSM address)
                // (e.g. "Cloud Gate, AT&T Plaza, Jewelers Row, Loop, Chicago, South Chicago Township, Cook County, Illinois, 60603, United States")
                eachWord.every(word => mapLocation.display_name?.toLowerCase().includes(word)) ||
                // OR type (e.g. "artwork") has any of the query terms
                eachWord.some(word => mapLocation.type?.toLowerCase().includes(word))||
                // OR the short name (e.g "Cloud Gate")
                eachWord.some(word => mapLocation.name?.toLowerCase().includes(word))
            )
        });
    }

    /**
     * Renders each MapLocation in SuggestModal view
     * @param {MapLocation} mapLocation - Individual MapLocation to render
     * @param {HTMLElement} el - Parent element to add to
     * @inheritdoc {SuggestModal.renderSuggestion}
     */
    renderSuggestion(mapLocation: MapLocation, el: HTMLElement): void {
        const mapLocationDiv = el.createEl('div', { cls: 'maplocation' });
        mapLocationDiv.createEl('div', {text: ((mapLocation.name != undefined && mapLocation.name?.length > 0) ? mapLocation.name : mapLocation.display_name), cls: 'maplocation__name'});
        mapLocationDiv.createEl('div', {text: mapLocation.display_name, cls: 'maplocation__display_name'});
        mapLocationDiv.createEl('small', {text: mapLocation.type, cls: 'maplocation__type'});
    }

    /**
     * 
     * @param {MapLocation} mapLocation 
     * @param {Event} evt - Event that fired choose suggestion
     * @inheritdoc {SuggestModal.onChooseSuggestion}
     */
    onChooseSuggestion(mapLocation: MapLocation, evt: Event): void {
        new Notice(`Selected ${mapLocation.name != undefined && mapLocation.name?.length > 0 ? mapLocation.name : mapLocation.display_name}`);
        this.onChoose(null, mapLocation);
    }

    /**
     * @inheritdoc {SuggestModal.onOpen}
     */
    onOpen() {
        // current hack from https://forum.obsidian.md/t/initial-query-for-suggestmodal/62872
        // to get it to display all options until text is input into the suggest modal
        if (this.initialQuery) {
            this.inputEl.value = this.initialQuery;
            this.inputEl.dispatchEvent(new InputEvent("input"));
        }
    }
}