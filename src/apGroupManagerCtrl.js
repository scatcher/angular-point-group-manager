'use strict';

angular.module('angularPoint')
    .controller('apGroupManagerCtrl', function ($scope, $q, $timeout, $filter, _, ngTableParams, apConfig, apDataService, toastr) {

        $scope.assignedOptions = [];
        $scope.availableOptions = [];
        $scope.groupDetailsLink = groupDetailsLink;
        $scope.groups = new DataContainer();
        $scope.groupsTable = getGroupsTable();
        $scope.mergeGroups = mergeGroups;
        $scope.tabContents = {};
        $scope.updateAvailableGroups = updateAvailableGroups;
        $scope.updateAvailableUsers = updateAvailableUsers;
        $scope.updatePermissions = updatePermissions;
        $scope.updateTab = updateTab;
        $scope.userDetailsLink = userDetailsLink;
        $scope.users = new DataContainer();
        $scope.usersTable = getUsersTable();

        $scope.state = {
            activeTab: 'Users',
            siteUrl: '',
            sourceGroup: '',
            userFilter: '',
            groupFilter: ''
        };

        return activate();


        function activate() {
            apDataService.getCurrentSite()
                .then(function (siteUrl) {
                    $scope.state.siteUrl = siteUrl;
                });

            $q.all(getUserCollection(), getGroupCollection()).then(function () {
                $scope.updateTab('Users');
                console.log($scope);
            });
        }

        //Constructor for users and groups data objects
        function DataContainer() {
            var self = this;
            var container = {
                all: [],
                available: [],
                selectedAvailable: [],
                assigned: [],
                selectedAssigned: [],
                filter: '' //Group selected in dropdown at top
            };
            _.extend(self, container);
            self.clearSelected = function () {
                self.selectedAvailable.length = 0;
                self.selectedAssigned.length = 0;
            };
        }


        function buildInputs(assignedItems, type) {
            var map = [];
            var available = [];
            var assigned = [];

            var data = $scope[type];

            //Clear out any existing data
            data.available.length = 0;
            data.selectedAvailable.length = 0;
            data.assigned.length = 0;
            data.selectedAssigned.length = 0;

            //Create a quick map to speed up checking in future
            _.each(assignedItems, function (item) {
                map.push(item.ID);
            });

            _.each(data.all, function (item) {
                if (_.indexOf(map, item.ID) > -1) {
                    //Already assigned
                    assigned.push(item);
                } else {
                    available.push(item);
                }
            });

            Array.prototype.push.apply(data.available, available);
            Array.prototype.push.apply(data.assigned, assigned);
            console.log($scope);
        }

        function updateAvailableGroups() {
            var deferred = $q.defer();
            toastr.info('Retrieving an updated list of groups for the current user');
            apDataService.getCollection({
                webUrl: $scope.state.siteUrl,
                operation: 'GetGroupCollectionFromUser',
                userLoginName: $scope.groups.filter.LoginName
            }).then(function (response) {
                buildInputs(response, 'groups');
                deferred.resolve(response);
            });

            return deferred.promise;
        }

        function updateAvailableUsers(group) {
            var deferred = $q.defer();

            toastr.info('Retrieving an updated list of users for the current group');
            apDataService.getCollection({
                webUrl: $scope.state.siteUrl,
                groupName: group.Name,
                operation: 'GetUserCollectionFromGroup'
            }).then(function (response) {
                buildInputs(response, 'users');
                deferred.resolve(response);
            }, function () {
                toastr.error('Please verify that you have sufficient permissions to view members of this group');
                //No users were returned so display all users as available
                deferred.resolve([]);
            });

            return deferred.promise;

        }

        function updateTab(tab) {
            initializeFilterFields();
            $scope.state.activeTab = tab;

            if (tab === 'Groups') {
                $scope.updateAvailableGroups().then(function () {

                });
            } else {
                $scope.updateAvailableUsers($scope.users.filter).then(function () {

                });
            }
        }

        function userDetailsLink(user) {
            $scope.groups.filter = user;
            $scope.updateTab('Groups');
        }

        function groupDetailsLink(group) {
            $scope.users.filter = group;
            $scope.updateTab('Users');
        }

        /**
         * Copy users from one group into another
         */
        function mergeGroups() {
            $scope.updatePermissions('AddUserToGroup', $scope.users.assigned, [$scope.state.targetGroup]).then(function (promiseArray) {
                toastr.success(promiseArray.length + ' users successfully merged.');
                //Reset dropdowns to empty
                $scope.state.sourceGroup = '';
                $scope.state.targetGroup = '';
            });
        }

        /**
         * Can add/remove multiple users to multiple groups asynchronously
         * @param {string} operation - Either 'AddUserToGroup' || 'RemoveUserFromGroup'
         * @param {array} usersArray
         * @param {array} groupsArray
         * @returns {Promise.promise|*}
         */
        function updatePermissions(operation, usersArray, groupsArray) {
            var deferredPermissionsUpdate = $q.defer();

            if (!usersArray.length) {
                toastr.warning('Please make a selection');
            } else {
                toastr.info('Processing your request');
                var queue = [];
                _.each(usersArray, function (user) {
                    _.each(groupsArray, function (group) {
                        var deferred = $q.defer();

                        if (apConfig.offline) {
                            //Simulate an async call
                            $timeout(function () {
                                //Push option to look like they've been assigned
//                                destination.push(user);
//                                //Remove from the available side
//                                source.splice(source.indexOf(user), 1);
                            });
                        } else {
                            apDataService.serviceWrapper({
                                webUrl: $scope.state.siteUrl,
                                filterNode: 'User',   //Look for all xml 'User' nodes and convert those in to JS objects
                                operation: operation, //AddUserToGroup || RemoveUserFromGroup'
                                groupName: group.Name,
                                userLoginName: user.LoginName
                            }).then(function (response) {
                                deferred.resolve(response);
                            });
                        }

                        queue.push(deferred.promise);
                    });

                });

                $scope.users.clearSelected();
                $scope.groups.clearSelected();

                //Resolved when all promises complete
                $q.all(queue).then(function (responses) {
                    toastr.success(operation === 'AddUserToGroup' ?
                        'User successfully added' :
                        'User successfully removed');
                    if (!apConfig.offline) {
                        //Retrieve updated value from the server
                        if ($scope.state.activeTab === 'Users') {
                            $scope.updateAvailableUsers($scope.users.filter);
                        } else {
                            $scope.updateAvailableGroups();
                        }
                    }
                    deferredPermissionsUpdate.resolve(responses);

                }, function () {
                    toastr.error('There was a problem removing the user');
                });
            }

            return deferredPermissionsUpdate.promise;
        }

        function getUsersTable() {
            return new ngTableParams({
                page: 1,            // show first page
                count: 30,           // count per page
                sorting: {
                    title: 'asc'
                }
            }, {
                total: $scope.users.all.length, // length of data
                getData: function ($defer, params) {
                    console.time('Filtering');
                    // use build-in angular filter
                    var orderedData = $scope.users.all;
                    orderedData = $filter('filter')(orderedData, function (record) {
                        var match = false;

                        if ($scope.state.userFilter === '') {
                            return true;
                        }
                        var textFields = ['ID', 'Name', 'Email'];
                        var searchStringLowerCase = $scope.state.userFilter.toLowerCase();
                        _.each(textFields, function (fieldName) {
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

        function getGroupsTable() {
            return new ngTableParams({
                page: 1,            // show first page
                count: 30,           // count per page
                sorting: {
                    title: 'asc'
                }
            }, {
                total: $scope.groups.all.length, // length of data
                getData: function ($defer, params) {
                    console.time('Filtering');
                    // use build-in angular filter
                    var orderedData = $scope.groups.all;
                    orderedData = $filter('filter')(orderedData, function (record) {
                        var match = false;

                        if ($scope.state.groupFilter === '') {
                            return true;
                        }
                        var textFields = ['ID', 'Name', 'Description'];
                        var searchStringLowerCase = $scope.state.groupFilter.toLowerCase();
                        _.each(textFields, function (fieldName) {
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

        function initializeFilterFields() {
            $scope.users.filter = $scope.users.filter || $scope.groups.all[0];
            $scope.groups.filter = $scope.groups.filter || $scope.users.all[0];
        }

        function getUserCollection() {
            var deferred = $q.defer();
            apDataService.getCollection({
                webUrl: $scope.state.siteUrl,
                operation: 'GetUserCollectionFromSite'
            }).then(function (response) {
                _.each(response, function (user) {
                    //Assume that valid users all have email addresses and services/groups don't
                    if (user.Email) {
                        $scope.users.all.push(user);
                    }
                });
                deferred.resolve($scope.users.all);
            });
            return deferred.promise;
        }

        function getGroupCollection() {
            var deferred = $q.defer();
            apDataService.getCollection({
                webUrl: $scope.state.siteUrl,
                operation: 'GetGroupCollectionFromSite'
            }).then(function (response) {
                Array.prototype.push.apply($scope.groups.all, response);
                deferred.resolve($scope.groups.all);
            });
            return deferred.promise;
        }
    });
