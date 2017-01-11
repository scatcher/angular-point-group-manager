import {XMLGroup, XMLUser} from 'angular-point';

export class DataContainer {
    all = [];
    assigned = [];
    available = [];
    filter: XMLGroup | XMLUser | any;
    selectedAssigned = [];
    selectedAvailable = [];

    clearSelected(): void {
        this.selectedAvailable.length = 0;
        this.selectedAssigned.length = 0;
    }
}

