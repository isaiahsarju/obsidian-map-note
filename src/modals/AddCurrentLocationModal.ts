import type { ButtonComponent } from 'obsidian';
import { Modal, Notice, Setting, TextComponent} from 'obsidian';
import type LocationAddPlugin from "../main";
import type { LocationModalData } from '../utils/ModalHelper';

export class AddCurrentLocation extends Modal {
	plugin: LocationAddPlugin;
    
    query: string;
    isBusy: boolean;
    title: string;

    searchBtn?: ButtonComponent;

    submitCallback?: (res: LocationModalData) => void;
    closeCallback?: (err?: Error) => void;
    
    constructor(plugin: LocationAddPlugin) {
        super(plugin.app);
    }

	onOpen() {
		let {contentEl} = this;
		new Notice('Note yet implemented');
        this.close();
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}