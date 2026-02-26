import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, Setting} from 'obsidian';
import LocationAddPlugin from "../main";
import { SearchResultsModal } from './SearchResultsModal';

export class AddLocationModal extends Modal {
    plugin: LocationAddPlugin;
    title: string = 'Location Search';

    private onSubmit (app: App, searchText: string){
        new Notice(`You searched for: ${searchText}!`);
        new SearchResultsModal(app, searchText).open();
    }
    
    constructor(app: App) {
        super(app);
        this.setTitle(this.title);

        let searchText ='';

        new Setting(this.contentEl)
            .setName('Search')
            .addText((text) =>
                text
                .setPlaceholder("e.g. Cloud Gate Chicago")
                .onChange((value) => {
                searchText = value;
                }));

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                .setButtonText('Search')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(app, searchText);
                }));
    }

    onOpen() {
        let {contentEl} = this;
    }

    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}