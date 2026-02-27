import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, Setting} from 'obsidian';
import LocationAddPlugin from "../main";
import { MapLocation } from 'models/MapLocation';

export class SearchLocationModal extends Modal {
    plugin: LocationAddPlugin;
    private readonly TITLE: string = 'Location Search';
    private readonly SEARCH_BUTTON_TEXT: string  = 'Search';
    private readonly SEARCHING_BUTTON_TEXT: string = 'Searching...';
    private isBusy = false;
    private okBtnRef?: ButtonComponent;
    
    constructor(
        app: App,
        private query: string,
        private callback: (error: Error | null, result: MapLocation[]) => void,
        ) {
        super(app);
    }

    // Search API for locations
    private async searchNominatimFreeform(searchText: string): Promise<any> {
        const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(searchText) + "&format=json";

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

    setBusy(busy: boolean): void {
        this.isBusy = busy;
        this.okBtnRef?.setDisabled(busy).setButtonText(busy ? this.SEARCHING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
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
                })
                .inputEl.addEventListener('keydown', event => event.key === 'Enter' && !event.isComposing && this.getLocations()));

        new Setting(this.contentEl).addButton(btn => {
            this.okBtnRef = btn
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