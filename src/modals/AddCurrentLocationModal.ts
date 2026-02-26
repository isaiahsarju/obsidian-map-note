import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice, Setting, TextComponent} from 'obsidian';
import type LocationAddPlugin from "../main";

export class AddCurrentLocationModal extends Modal {
	plugin: LocationAddPlugin;
    
    query: string;
    isBusy: boolean;
    title: string;

    searchBtn?: ButtonComponent;
    
    constructor(app: App) {
        super(app);
    }

	onOpen() {
		let {contentEl} = this;
		new Notice('Not yet implemented');
        this.close();
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}