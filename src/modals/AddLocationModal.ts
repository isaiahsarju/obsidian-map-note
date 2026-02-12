import type { ButtonComponent } from 'obsidian';
import { Modal, Notice, Setting, TextComponent} from 'obsidian';
import type LocationAddPlugin from "../main";
import type { LocationModalData } from '../utils/ModalHelper';

export class AddLocationModal extends Modal {
    plugin: LocationAddPlugin;

    query: string;
	isBusy: boolean;
	title: string;

    searchBtn?: ButtonComponent;

    /**
     * name
     */
    private onSubmit (result: string){
        new Notice(`You searched for: ${result}!`);
    }

	submitCallback?: (res: LocationModalData) => void;
	closeCallback?: (err?: Error) => void;
    
    constructor(plugin: LocationAddPlugin) {
        super(plugin.app);
        this.setTitle('Location Search');

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
                .setButtonText('Submit')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(searchText);
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