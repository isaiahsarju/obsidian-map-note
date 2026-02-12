import { Notice } from 'obsidian';
//import { LocationPreviewModal } from 'src/modals/LocationPreviewModal';
import type LocationAddPlugin from '../main';

/**
 * The data the search modal returns.
 * - query: the query string
 */
export interface LocationModalData {
	query: string;
}

