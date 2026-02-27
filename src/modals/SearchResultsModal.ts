import type { ButtonComponent, ISuggestOwner } from 'obsidian';
import { App, SuggestModal, Modal, Notice, Setting} from 'obsidian';
import type LocationAddPlugin from "../main";
import { MapLocation } from '../models/MapLocation';

export class SearchResultsModal extends SuggestModal<MapLocation> {
    plugin: LocationAddPlugin;
    private initialQuery: string = ' ';
    
    constructor(
        app: App,
        private readonly suggestion: MapLocation[],
        private onChoose: (error: Error | null, result: MapLocation) => void){
        super(app);
    }

    // Returns all available mapLocations.
    getSuggestions(query: string): MapLocation[] {
        return this.suggestion.filter(mapLocation => {
            const searchQuery = query?.toLowerCase();
            return (
                mapLocation.name?.toLowerCase().includes(searchQuery) ||
                mapLocation.display_name?.toLowerCase().includes(searchQuery) ||
                mapLocation.type?.toLowerCase().includes(searchQuery));
            });
        }

    // Renders each suggestion item.
    renderSuggestion(mapLocation: MapLocation, el: HTMLElement): void {
        const mapLocationDiv = el.createEl('div', { cls: 'maplocation' });
        mapLocationDiv.createEl('div', {text: ((mapLocation.name != undefined && mapLocation.name?.length > 0) ? mapLocation.name : mapLocation.display_name), cls: 'maplocation__name'});
        mapLocationDiv.createEl('div', {text: mapLocation.display_name, cls: 'maplocation__display_name'});
        mapLocationDiv.createEl('small', {text: mapLocation.type, cls: 'maplocation__type'});
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(mapLocation: MapLocation, evt: Event): void {
        new Notice(`Selected ${mapLocation.name != undefined && mapLocation.name?.length > 0 ? mapLocation.name : mapLocation.display_name}`);
    }


    onOpen() {
        let {contentEl} = this;
        // current hack from https://forum.obsidian.md/t/initial-query-for-suggestmodal/62872
        // to get it to display all options until text is input into the suggest modal
        if (this.initialQuery) {
            this.inputEl.value = this.initialQuery;
            //this.inputEl.value = this.plugin.settings.templatePath;
            this.inputEl.dispatchEvent(new InputEvent("input"));
        }
    }
}