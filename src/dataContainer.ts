module ap.groupmanager {
    'use strict';
	
	interface IDataContainer{
		all: [];
		assigned: [];
		available: [];
		filter: IXMLGroup | IXMLUser;

		selectedAssigned: [];
		selectedAvailable: [];
		clearSelected(): void;
	}

	export class DataContainer implements IDataContainer {
		all = [];
		assigned = [];
		available = [];
		filter;
		selectedAssigned = [];
		selectedAvailable = [];
		clearSelected(): void {
			this.selectedAvailable.length = 0;
			this.selectedAssigned.length = 0;
		}
	}

}