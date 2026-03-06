import type { ButtonComponent } from 'obsidian';
import { App, Modal, Notice} from 'obsidian';
import type LocationAddPlugin from "../main";

/**
 * A Modal used to add current location based on users GPS coordinates
 * NOT YET IMPLEMENTED
 */
export class AddCurrentLocationModal extends Modal {
	plugin: LocationAddPlugin;
    
    query: string;
    isBusy: boolean;
    title: string;

    searchBtn?: ButtonComponent;
    
    constructor(app: App) {
        super(app);
    }

	/**
	 * @inheritdoc {Modal.onOpen}
	 */
	onOpen() {
		// Maybe gets GPS and then peforms OSM search to try and resolve an addr?
		new Notice('Not yet implemented');
        this.close();
	}

	/**
	 * @inheritdoc {Modal.onClose}
	 */
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}