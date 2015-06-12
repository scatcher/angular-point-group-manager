/// <reference path="index.ts" />
/// <reference path="dataContainer.ts" />


module ap.groupmanager {
    'use strict';

    var vm: GroupManagerController, $filter, $q, $timeout, _, apConfig, apDataService, ngTableParams, toastr;


    export class GroupManagerController {
        activeTab = 'Users';
        assignedOptions = [];
        availableOptions = [];
        groupFilter = '';
        groups = new DataContainer();
        groupsTable: Object;
        siteUrl = '';
        sourceGroup: IXMLGroup;
        tabContents = {};
        targetGroup: IXMLGroup;
        userFilter = '';
        users = new DataContainer();
        usersTable: Object;
        constructor(private $scope, $injector) {

            vm = this;
            $filter = $injector.get('$filter');
            ngTableParams = $injector.get('ngTableParams');
            $q = $injector.get('$q');
            $timeout = $injector.get('$timeout');
            apDataService = $injector.get('apDataService');
            apConfig = $injector.get('apConfig');
            toastr = $injector.get('toastr');
            _ = $injector.get('_');

            vm.activate();

        }

        activate() {
            apDataService.getCurrentSite()
                .then(function(siteUrl) {
                    vm.siteUrl = siteUrl;
                });

            $q.all([vm.getUserCollection(), vm.getGroupCollection()])
                .then(function() {
                    vm.updateTab('Users');
                });

            vm.buildTables();
        }

        buildInputs(assignedItems, type) {
            var map = [];
            var available = [];
            var assigned = [];

            var data = vm[type];

            //Clear out any existing data
            data.available.length = 0;
            data.selectedAvailable.length = 0;
            data.assigned.length = 0;
            data.selectedAssigned.length = 0;

            //Create a quick map to speed up checking in future
            _.each(assignedItems, function(item) {
                map.push(item.ID);
            });

            _.each(data.all, function(item) {
                if (_.indexOf(map, item.ID) > -1) {
                    //Already assigned
                    assigned.push(item);
                } else {
                    available.push(item);
                }
            });

            Array.prototype.push.apply(data.available, available);
            Array.prototype.push.apply(data.assigned, assigned);

        }

        buildTables() {
            vm.groupsTable = new ngTableParams({
                page: 1,            // show first page
                count: 30,           // count per page
                sorting: {
                    title: 'asc'
                }
            }, {
                    total: vm.groups.all.length, // length of data
                    getData: function($defer, params) {
                        console.time('Filtering');
                        // use build-in angular filter
                        var orderedData = vm.groups.all;
                        orderedData = $filter('filter')(orderedData, function(record) {
                            var match = false;

                            if (vm.groupFilter === '') {
                                return true;
                            }
                            var textFields = ['ID', 'Name', 'Description'];
                            var searchStringLowerCase = vm.groupFilter.toLowerCase();
                            _.each(textFields, function(fieldName) {
                                if (record[fieldName].toLowerCase().indexOf(searchStringLowerCase) !== -1) {
                                    match = true;
                                }
                            });
                            return match;
                        });

                        params.total(orderedData.length);
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });

            vm.usersTable = new ngTableParams({
                page: 1,            // show first page
                count: 30,           // count per page
                sorting: {
                    title: 'asc'
                }
            }, {
                    total: vm.users.all.length, // length of data
                    getData: function($defer, params) {
                        console.time('Filtering');
                        // use build-in angular filter
                        var orderedData = vm.users.all;
                        orderedData = $filter('filter')(orderedData, function(record) {
                            var match = false;

                            if (vm.userFilter === '') {
                                return true;
                            }
                            var textFields = ['ID', 'Name', 'Email'];
                            var searchStringLowerCase = vm.userFilter.toLowerCase();
                            _.each(textFields, function(fieldName) {
                                if (record[fieldName].toLowerCase().indexOf(searchStringLowerCase) !== -1) {
                                    match = true;
                                }
                            });
                            return match;
                        });

                        params.total(orderedData.length);
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
        }

        initializeFilterFields() {
            vm.users.filter = vm.users.filter || vm.groups.all[0];
            vm.groups.filter = vm.groups.filter || vm.users.all[0];
        }

        getGroupCollection() {
            var deferred = $q.defer();
            apDataService.getCollection({
                webUrl: vm.siteUrl,
                operation: 'GetGroupCollectionFromSite'
            }).then(function(response) {
                Array.prototype.push.apply(vm.groups.all, response);
                deferred.resolve(vm.groups.all);
            });
            return deferred.promise;
        }

        getUserCollection() {
            var deferred = $q.defer();
            apDataService.getCollection({
                webUrl: vm.siteUrl,
                operation: 'GetUserCollectionFromSite'
            }).then(function(response) {
                _.each(response, function(user) {
                    //Assume that valid users all have email addresses and services/groups don't
                    // if (user.Email) {
                        vm.users.all.push(user);
                    // }
                });
                deferred.resolve(vm.users.all);
            });
            return deferred.promise;
        }

        groupDetailsLink(group: IXMLGroup) {
            vm.users.filter = group;
            vm.updateTab('Users');
        }
        
        /**
         * Copy users from one group into another
         */
        mergeGroups() {
            vm.updatePermissions('AddUserToGroup', vm.users.assigned, [vm.targetGroup])
                .then(function(promiseArray) {
                    toastr.success(promiseArray.length + ' users successfully merged.');
                    //Reset dropdowns to empty
                    vm.sourceGroup = undefined;
                    vm.targetGroup = undefined;
                });
        }



        updateAvailableGroups() {
            var deferred = $q.defer();
            toastr.info('Retrieving an updated list of groups for the current user');
            apDataService.getCollection({
                webUrl: vm.siteUrl,
                operation: 'GetGroupCollectionFromUser',
                userLoginName: vm.groups.filter.LoginName
            }).then(function(response) {
                vm.buildInputs(response, 'groups');
                deferred.resolve(response);
            });

            return deferred.promise;
        }

        updateAvailableUsers(group: IXMLGroup) {
            var deferred = $q.defer();

            toastr.info('Retrieving an updated list of users for the current group');
            apDataService.getCollection({
                webUrl: vm.siteUrl,
                groupName: group.Name,
                operation: 'GetUserCollectionFromGroup'
            }).then(function(response) {
                vm.buildInputs(response, 'users');
                deferred.resolve(response);
            }, function() {
                toastr.error('Please verify that you have sufficient permissions to view members of this group');
                //No users were returned so display all users as available
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
        updatePermissions(operation: string, usersArray: IXMLUser[], groupsArray: IXMLGroup[]) {
            var deferredPermissionsUpdate = $q.defer();

            if (!usersArray.length) {
                toastr.warning('Please make a selection');
            } else {
                toastr.info('Processing your request');
                var queue = [];
                _.each(usersArray, function(user: IXMLUser) {
                    _.each(groupsArray, function(group: IXMLGroup) {
                        var deferred = $q.defer();

                        if (apConfig.offline) {
                            //Simulate an async call
                            $timeout(function() {
                                //Push option to look like they've been assigned
                                //                                destination.push(user);
                                //                                //Remove from the available side
                                //                                source.splice(source.indexOf(user), 1);
                            });
                        } else {
                            apDataService.serviceWrapper({
                                webUrl: vm.siteUrl,
                                filterNode: 'User',   //Look for all xml 'User' nodes and convert those in to JS objects
                                operation: operation, //AddUserToGroup || RemoveUserFromGroup'
                                groupName: group.Name,
                                userLoginName: user.LoginName
                            }).then(function(response) {
                                deferred.resolve(response);
                            });
                        }

                        queue.push(deferred.promise);
                    });

                });

                vm.users.clearSelected();
                vm.groups.clearSelected();

                //Resolved when all promises complete
                $q.all(queue).then(function(responses) {
                    toastr.success(operation === 'AddUserToGroup' ?
                        'User successfully added' :
                        'User successfully removed');
                    if (!apConfig.offline) {
                        //Retrieve updated value from the server
                        if (vm.activeTab === 'Users') {
                            vm.updateAvailableUsers(vm.users.filter);
                        } else {
                            vm.updateAvailableGroups();
                        }
                    }
                    deferredPermissionsUpdate.resolve(responses);

                }, function() {
                    toastr.error('There was a problem removing the user');
                });
            }

            return deferredPermissionsUpdate.promise;
        }

        updateTab(tab: string) {
            vm.initializeFilterFields();
            vm.activeTab = tab;

            if (tab === 'Groups') {
                vm.updateAvailableGroups().then(function() {

                });
            } else {
                vm.updateAvailableUsers(vm.users.filter).then(function() {

                });
            }
        }

        userDetailsLink(user) {
            vm.groups.filter = user;
            vm.updateTab('Groups');
        }
    }

}