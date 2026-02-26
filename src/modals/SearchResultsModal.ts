import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, Setting} from 'obsidian';
import type LocationAddPlugin from "../main";
import { MapLocation } from '../models/MapLocation';

export class SearchResultsModal extends Modal {
    plugin: LocationAddPlugin;

    searchTerm: string;
    title: string = 'Location Results';

    private onSubmit (result: string){
        new Notice(`You selected: ${result}!`);
    }

    private async searchNominatimFreeform(searchTerm: string): Promise<any> {
        const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(searchTerm) + "&format=json";

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const results = await response.json();
            return results;
        }
        catch (error) {
            console.warn('failed to get results of search', error);
            return null;
        }
    }
    
    constructor(app: App, searchTerm: string) {
        super(app);
        this.setTitle(this.title);
        this.searchTerm = searchTerm;
        this.preview(this.searchTerm);
    }

    async preview(searchTerm: string): Promise<void>{
        //let {contentEl} = this;
        let locations = await this.searchNominatimFreeform(this.searchTerm);
        console.log(locations);

        try{
            // validate there are 1 or more locations in array
            let mapLocationData: MapLocation = {lat:"", lon:"", lucide_icon:"landmark"};

            if (locations != null && locations.length > 0) {
                let mapLocationData = locations[0] as MapLocation;
                mapLocationData.lucide_icon = "landmark";
                console.log(mapLocationData);
            } else {
                throw new Error('Location array of size zero');
            }

            const mapLocation = this.containerEl.createEl('div', { cls: 'maplocation' });
            mapLocation.createEl('div', {text: ((mapLocationData.name != undefined && mapLocationData.name?.length > 0) ? mapLocationData.name : mapLocationData.display_name), cls: 'maplocation__name'});
            mapLocation.createEl('div', {text: mapLocationData.display_name, cls: 'maplocation__display_name'});
            mapLocation.createEl('small', {text: mapLocationData.type, cls: 'maplocation__type'});
        } catch(error) {
            console.warn('No valid results returned', error);
            new Notice('No results returned');
        }
    }

    onOpen() {
        let {contentEl} = this;
        //this.preview(this.searchTerm);
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}