import {IXMLGroup, IXMLUser} from 'angular-point';

export class DataContainer {
    all = [];
    assigned = [];
    available = [];
    filter: IXMLGroup | IXMLUser | any;
    selectedAssigned = [];
    selectedAvailable = [];

    clearSelected(): void {
        this.selectedAvailable.length = 0;
        this.selectedAssigned.length = 0;
    }
}

