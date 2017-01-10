import * as toastr from 'toastr';
import * as _ from 'lodash';
import {NgTableParams as INgTableParams} from 'ng-table';
import {DataContainer} from './dataContainer';
import {IXMLGroup, IXMLUser, DataService} from 'angular-point';

export class GroupManagerController {
    
    static $inject = ['NgTableParams', '$filter', '$timeout', '$q', 'apDataService'];
    activeTab = 'Users';
    assignedOptions = [];
    availableOptions = [];
    groupFilter = '';
    groups = new DataContainer();
    groupsTable: INgTableParams<any>;
    siteUrl = '';
    sourceGroup: IXMLGroup;
    tabContents = {};
    targetGroup: IXMLGroup;
    userFilter = '';
    users = new DataContainer();
    usersTable: Object;

    constructor(
        private NgTableParams,
        private $filter: ng.IFilterService,
        private $timeout: ng.ITimeoutService,
        private $q: ng.IQService,
        private apDataService: DataService) { }

    $onInit() {

        this.apDataService.getCurrentSite()
            .then(siteUrl => this.siteUrl = siteUrl);

        this.$q.all([this.getUserCollection(), this.getGroupCollection()])
            .then(() => this.updateTab('Users'));

        this.buildTables();
    }

    buildInputs(assignedItems: IXMLGroup[] | IXMLUser[], type: 'groups' | 'users') {
        // Create a quick map to speed up checking in future
        let map = _.map(assignedItems, (item: IXMLUser | IXMLGroup) => item.ID);
        let available = [];
        let assigned = [];
        let data = this[type];

        // Clear out any existing data
        data.available.length = 0;
        data.selectedAvailable.length = 0;
        data.assigned.length = 0;
        data.selectedAssigned.length = 0;

        
        _.each(data.all, item => {
            if (_.indexOf(map, item.ID) > -1) {
                // Already assigned
                assigned.push(item);
            } else {
                available.push(item);
            }
        });

        Array.prototype.push.apply(data.available, available);
        Array.prototype.push.apply(data.assigned, assigned);

    }

    buildTables() {
        this.groupsTable = new this.NgTableParams({
            page: 1,            // show first page
            count: 30,           // count per page
            sorting: {
                title: 'asc'
            }
        }, {
            total: this.groups.all.length, // length of data
            getData: (params) => {
                // use build-in angular filter
                let orderedData = this.groups.all;
                let filteredData = this.$filter('filter')(orderedData, (record) => {
                    let match = false;

                    if (this.groupFilter === '') {
                        return true;
                    }
                    let textFields = ['ID', 'Name', 'Description'];
                    let searchStringLowerCase = this.groupFilter.toLowerCase();
                    _.each(textFields, (fieldName) => {
                        if (record[fieldName].toLowerCase().indexOf(searchStringLowerCase) !== -1) {
                            match = true;
                        }
                    });
                    return match;
                });

                params.total(filteredData.length);
                return filteredData.slice((params.page() - 1) * params.count(), params.page() * params.count());
            }
        });

        this.usersTable = new this.NgTableParams({
            page: 1,            // show first page
            count: 30,           // count per page
            sorting: {
                title: 'asc'
            }
        }, {
            total: this.users.all.length, // length of data
            getData: (params) => {
                let orderedData = this.users.all;
                let filteredData = this.$filter('filter')(orderedData, (record) => {
                    let match = false;

                    if (this.userFilter === '') {
                        return true;
                    }
                    let textFields = ['ID', 'Name', 'Email'];
                    let searchStringLowerCase = this.userFilter.toLowerCase();
                    _.each(textFields, (fieldName) => {
                        if (record[fieldName].toLowerCase().indexOf(searchStringLowerCase) !== -1) {
                            match = true;
                        }
                    });
                    return match;
                });

                params.total(orderedData.length);
                return filteredData.slice((params.page() - 1) * params.count(), params.page() * params.count());
            }
        });
    }

    initializeFilterFields() {
        this.users.filter = this.users.filter || this.groups.all[0];
        this.groups.filter = this.groups.filter || this.users.all[0];
    }

    getGroupCollection() {
        let deferred = this.$q.defer();
        this.apDataService.getCollection({
            webURL: this.siteUrl,
            operation: 'GetGroupCollectionFromSite'
        }).then((response: IXMLGroup[]) => {
            Array.prototype.push.apply(this.groups.all, response);
            deferred.resolve(this.groups.all);
        });
        return deferred.promise;
    }

    getUserCollection() {
        let deferred = this.$q.defer();
        this.apDataService.getCollection({
            webURL: this.siteUrl,
            operation: 'GetUserCollectionFromSite'
        }).then((response: IXMLUser[]) => {
            // Assume that valid users all have email addresses and services/groups don't
            _.each(response, user => this.users.all.push(user));
            
            deferred.resolve(this.users.all);
        });
        return deferred.promise;
    }

    groupDetailsLink(group: IXMLGroup) {
        this.users.filter = group;
        this.updateTab('Users');
    }

    /**
     * Copy users from one group into another
     */
    mergeGroups() {
        this.updatePermissions('AddUserToGroup', this.users.assigned, [this.targetGroup])
            .then( (promiseArray) => {
                toastr.success(promiseArray.length + ' users successfully merged.');
                // Reset dropdowns to empty
                this.sourceGroup = undefined;
                this.targetGroup = undefined;
            });
    }


    updateAvailableGroups() {
        let deferred = this.$q.defer();
        toastr.info('Retrieving an updated list of groups for the current user');
        this.apDataService.getCollection({
            webURL: this.siteUrl,
            operation: 'GetGroupCollectionFromUser',
            userLoginName: this.groups.filter.LoginName
        }).then((response: IXMLGroup[]) => {
            this.buildInputs(response, 'groups');
            deferred.resolve(response);
        });

        return deferred.promise;
    }

    updateAvailableUsers(group: IXMLGroup) {
        let deferred = this.$q.defer();

        toastr.info('Retrieving an updated list of users for the current group');
        this.apDataService.getCollection({
            webURL: this.siteUrl,
            groupName: group.Name,
            operation: 'GetUserCollectionFromGroup'
        }).then((response: IXMLUser[]) => {
            this.buildInputs(response, 'users');
            deferred.resolve(response);
        }, (err) => {
            toastr.error('Please verify that you have sufficient permissions to view members of this group');
            // No users were returned so display all users as available
            deferred.resolve([]);
        });

        return deferred.promise;

    }

    /**
     * Can add/remove multiple users to multiple groups asynchronously
     * @param {string} operation - Either 'AddUserToGroup' || 'RemoveUserFromGroup'
     * @param {array} usersArray
     * @param {array} groupsArray
     * @returns {Promise.promise|*}
     */
    updatePermissions(operation: string, usersArray: IXMLUser[], groupsArray: IXMLGroup[]): ng.IPromise<Object[]> {
        let deferredPermissionsUpdate = this.$q.defer();

        if (!usersArray.length) {
            toastr.warning('Please make a selection');
        } else {
            toastr.info('Processing your request');
            let queue = [];
            _.each(usersArray, (user: IXMLUser) => {
                _.each(groupsArray, (group: IXMLGroup) => {
                    let deferred = this.$q.defer();

                    this.apDataService.serviceWrapper({
                        webUrl: this.siteUrl,
                        filterNode: 'User',   // Look for all xml 'User' nodes and convert those in to JS objects
                        operation: operation, // AddUserToGroup || RemoveUserFromGroup'
                        groupName: group.Name,
                        userLoginName: user.LoginName
                    }).then( (response) => {
                        deferred.resolve(response);
                    });

                    queue.push(deferred.promise);
                });

            });

            this.users.clearSelected();
            this.groups.clearSelected();

            // Resolved when all promises complete
            this.$q.all(queue).then( (responses) => {
                toastr.success(operation === 'AddUserToGroup' ?
                    'User successfully added' :
                    'User successfully removed');

                // Retrieve updated value from the server
                if (this.activeTab === 'Users') {
                    this.updateAvailableUsers(this.users.filter);
                } else {
                    this.updateAvailableGroups();
                }

                deferredPermissionsUpdate.resolve(responses);

            }, () => {
                toastr.error('There was a problem removing the user');
            });
        }

        return deferredPermissionsUpdate.promise;
    }

    updateTab(tab: string) {
        this.initializeFilterFields();
        this.activeTab = tab;

        if (tab === 'Groups') {
            this.updateAvailableGroups().then(function () {

            });
        } else {
            this.updateAvailableUsers(this.users.filter).then(function () {

            });
        }
    }

    userDetailsLink(user) {
        this.groups.filter = user;
        this.updateTab('Groups');
    }
}

export const GroupManagerComponent = {
    controller: GroupManagerController,
    template: require('./angular-point-group-manager-templates.html')
};
