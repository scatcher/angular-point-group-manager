angular.module("angularPoint").run(["$templateCache", function($templateCache) {$templateCache.put("angular-point-group-manager-templates.html","<style type=\"text/css\">\n    select.multiselect {\n        min-height: 400px;\n    }\n\n    .ui-match {\n        background: yellow;\n    }\n</style>\n\n\n<div class=\"container\">\n<ul class=\"nav nav-tabs\">\n    <li ng-class=\"{active: vm.activeTab === \'Users\'}\">\n        <a href ng-click=\"vm.updateTab(\'Users\')\">Users</a>\n    </li>\n    <li ng-class=\"{active: vm.activeTab === \'Groups\'}\">\n        <a href ng-click=\"vm.updateTab(\'Groups\')\">Groups</a>\n    </li>\n    <li ng-class=\"{active: vm.activeTab === \'Merge\'}\">\n        <a href ng-click=\"vm.activeTab = \'Merge\'\">Merge</a>\n    </li>\n    <li ng-class=\"{active: vm.activeTab === \'UserList\'}\">\n        <a href ng-click=\"vm.activeTab = \'UserList\'\">User List</a>\n    </li>\n    <li ng-class=\"{active: vm.activeTab === \'GroupList\'}\">\n        <a href ng-click=\"vm.activeTab = \'GroupList\'\">Group List</a>\n    </li>\n</ul>\n\n<div ng-if=\"vm.activeTab === \'Users\'\">\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <div class=\"row\">\n                <div class=\"col-xs-5\">\n                    <span style=\"font-weight:bold\">Select a Group:</span>\n                    <select class=\"form-control\" ng-model=\"vm.users.filter\"\n                            ng-options=\"group.Name for group in vm.groups.all\"\n                            ng-change=\"vm.updateAvailableUsers(vm.users.filter)\" style=\"min-width: 100px;\"></select>\n                </div>\n                <div class=\"col-xs-7\">\n                    <span style=\"font-weight:bold\">Site/Site Collection: </span>\n                    <input class=\"form-control\" ng-model=\"vm.siteUrl\" ng-change=\"vm.updateAvailableUsers(vm.users.filter)\">\n                </div>\n            </div>\n            <div class=\"row\" ng-if=\"vm.users.filter.Description\">\n                <div class=\"col-xs-12\">\n                    <p class=\"help-block\">Description: {{ vm.users.filter.Description }}</p>\n                </div>\n            </div>\n        </div>\n        <div class=\"panel-body\">\n            <div class=\"row\">\n                <div class=\"col-xs-12\">\n                    <div colspan=\"3\" class=\"description\">This tab will allow you to quickly assign multiple users to a\n                        selected group.\n                    </div>\n                </div>\n            </div>\n            <hr class=\"hr-sm\">\n            <div class=\"row\">\n                <div class=\"col-xs-5\">\n                    <div class=\"form-group\">\n                        <label>Available Users ({{vm.users.available.length}})</label>\n                        <select ng-model=\"vm.users.selectedAvailable\"\n                                ng-options=\"user.Name for user in vm.users.available\"\n                                multiple=\"multiple\" class=\"multiselect form-control\"></select>\n                    </div>\n                </div>\n                <div class=\"col-xs-2 text-center\" style=\"padding-top: 175px\">\n                    <button class=\"btn btn-default\" style=\"width:80px;\"\n                            ng-click=\"vm.updatePermissions(\'AddUserToGroup\', vm.users.selectedAvailable, [vm.users.filter])\"\n                            title=\"Add user\">\n                        <i class=\"fa fa-2x fa-angle-double-right\"></i>\n                    </button>\n                    <br/><br/>\n                    <button class=\"btn btn-default\" style=\"width:80px;\"\n                            ng-click=\"vm.updatePermissions(\'RemoveUserFromGroup\', vm.users.selectedAssigned, [vm.users.filter])\">\n                        <i class=\"fa fa-2x fa-angle-double-left\"></i>\n                    </button>\n                </div>\n                <div class=\"col-xs-5\">\n                    <div class=\"form-group\">\n                        <label>Assigned Users ({{vm.users.assigned.length}})</label>\n                        <select ng-model=\"vm.users.selectedAssigned\"\n                                ng-options=\"user.Name for user in vm.users.assigned\"\n                                multiple=\"multiple\" class=\"multiselect form-control\"></select>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div ng-if=\"vm.activeTab === \'Groups\'\">\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <div class=\"row\">\n                <div class=\"col-xs-5\">\n                    <span style=\"font-weight:bold\">Select a User:</span>\n                    <select class=\"form-control\" ng-model=\"vm.groups.filter\"\n                            ng-options=\"user.Name for user in vm.users.all\"\n                            ng-change=\"vm.updateAvailableGroups(vm.groups.filter)\" style=\"min-width: 100px;\"></select>\n                </div>\n                <div class=\"col-xs-7\">\n                    <span style=\"font-weight:bold\">Site/Site Collection: </span>\n                    <input class=\"form-control\" ng-model=\"vm.siteUrl\"\n                           ng-change=\"vm.updateAvailableGroups(vm.groups.filter)\">\n                </div>\n            </div>\n        </div>\n        <div class=\"panel-body\">\n            <div class=\"row\">\n                <div class=\"col-xs-12\">\n                    <div colspan=\"3\" class=\"description\">This page was created to make the process of managing\n                        users/groups within the site\n                        collection more manageable. When a user is selected, the available groups are displayed on the\n                        left and the groups that the user is currently a member of will show on the right. Selecting\n                        multiple groups is supported.\n                    </div>\n                </div>\n            </div>\n            <hr class=\"hr-sm\">\n            <div class=\"row\">\n                <div class=\"col-xs-5\">\n                    <div class=\"form-group\">\n                        <label>Available Groups ({{vm.groups.available.length}})</label>\n                        <select ng-model=\"vm.groups.selectedAvailable\"\n                                ng-options=\"group.Name for group in vm.groups.available\"\n                                multiple=\"multiple\" class=\"multiselect form-control\"></select>\n                    </div>\n                </div>\n                <div class=\"col-xs-2 text-center\" style=\"padding-top: 175px\">\n                    <button class=\"btn btn-default\" style=\"width:80px;\"\n                            ng-click=\"vm.updatePermissions(\'AddUserToGroup\', [vm.groups.filter], vm.groups.selectedAvailable)\"\n                            title=\"Add to group\">\n                        <i class=\"fa fa-2x fa-angle-double-right\"></i>\n                    </button>\n                    <br/><br/>\n                    <button class=\"btn btn-default\" style=\"width:80px;\"\n                            ng-click=\"vm.updatePermissions(\'RemoveUserFromGroup\', [vm.groups.filter], vm.groups.selectedAssigned)\">\n                        <i class=\"fa fa-2x fa-angle-double-left\"></i>\n                    </button>\n                </div>\n                <div class=\"col-xs-5\">\n                    <div class=\"form-group\">\n                        <label>Assigned Users ({{vm.users.assigned.length}})</label>\n                        <select ng-model=\"vm.groups.selectedAssigned\"\n                                ng-options=\"group.Name for group in vm.groups.assigned\"\n                                multiple=\"multiple\" class=\"multiselect form-control\"></select>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div ng-if=\"vm.activeTab === \'Merge\'\">\n    <div class=\"panel panel-default\">\n        <div class=\"panel-body\">\n            <div class=\"row\">\n                <div class=\"col-xs-12\">\n                    <div class=\"description\">This tab allows us to copy the members from the \"Source\" group over to\n                        the \"Target\" group.\n                        It\'s not a problem if any of the users already exist in the destination group. Note: This is\n                        a onetime operation\n                        so any additional members added to the Source group will not automatically be added to the\n                        destination group. You will\n                        need to repeat this process.\n                    </div>\n                </div>\n            </div>\n            <hr class=\"hr-sm\">\n            <div class=\"row\">\n                <div class=\"col-xs-5\">\n                    <fieldset>\n                        <legend>Step 1</legend>\n                        <div class=\"well\">\n                            <div class=\"form-group\">\n                                <label>Source Group</label>\n                                <select class=\"form-control\" ng-model=\"vm.sourceGroup\"\n                                        ng-options=\"group.Name for group in vm.groups.all\"\n                                        ng-change=\"vm.updateAvailableUsers(vm.sourceGroup)\"\n                                        style=\"min-width: 100px;\"></select>\n                            </div>\n                        </div>\n                    </fieldset>\n                </div>\n                <div class=\"col-xs-5\">\n                    <fieldset>\n                        <legend>Step 2</legend>\n\n                        <div class=\"well\">\n                            <div class=\"form-group\">\n                                <label>Source Group</label>\n                                <select class=\"form-control\" ng-model=\"vm.targetGroup\"\n                                        ng-options=\"group.Name for group in vm.groups.all\"\n                                        style=\"min-width: 100px;\"></select>\n                            </div>\n                        </div>\n                    </fieldset>\n                </div>\n                <div class=\"col-xs-2\">\n                    <fieldset>\n                        <legend>Step 3</legend>\n                        <button class=\"btn btn-success\"\n                                ng-disabled=\"vm.sourceGroup.length < 1 || vm.targetGroup.length < 1\"\n                                ng-click=\"vm.mergeGroups()\"\n                                title=\"Copy all members from the source group over to the destination group.\">\n                            <i class=\"fa fa-2x fa-magic\"></i> Merge\n                        </button>\n                    </fieldset>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n<div ng-if=\"vm.activeTab === \'UserList\'\">\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <span style=\"font-weight:bold\">User Filter</span>\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.userFilter\"\n                   ng-change=\"vm.usersTable.reload()\">\n        </div>\n        <table ng-table=\"vm.usersTable\" class=\"table\" template-pagination=\"custom/pager\">\n            <tr ng-repeat=\"user in $data\">\n                <td data-title=\"\'ID\'\"> {{ user.ID }}</td>\n                <td data-title=\"\'Name\'\">\n                    <a href ng-click=\"vm.userDetailsLink(user)\"\n                       ng-bind-html=\"user.Name |  highlight:vm.userFilter\"></a>\n                </td>\n                <td data-title=\"\'Email\'\"> {{ user.Email }}</td>\n            </tr>\n\n        </table>\n    </div>\n</div>\n<div ng-if=\"vm.activeTab === \'GroupList\'\">\n    <div class=\"panel panel-default\">\n        <div class=\"panel-heading\">\n            <span style=\"font-weight:bold\">Group Filter</span>\n            <input type=\"text\" class=\"form-control\" ng-model=\"vm.groupFilter\"\n                   ng-change=\"vm.groupsTable.reload()\">\n        </div>\n        <table ng-table=\"vm.groupsTable\" class=\"table\" template-pagination=\"custom/pager\">\n            <tr ng-repeat=\"group in $data\">\n                <td data-title=\"\'ID\'\"> {{ group.ID }}</td>\n                <td data-title=\"\'Name\'\">\n                    <a href ng-click=\"vm.groupDetailsLink(group)\"\n                       ng-bind-html=\"group.Name |  highlight:vm.groupFilter\"></a>\n                </td>\n                <td data-title=\"\'Description\'\"> {{ vm.group.Description }}</td>\n            </tr>\n        </table>\n    </div>\n</div>\n</div>\n\n<script type=\"text/ng-template\" id=\"custom/pager\">\n    <div class=\"row\">\n        <div class=\"col-xs-12\">\n            <ul class=\"pager ng-cloak\">\n                <li ng-repeat=\"page in pages\"\n                    ng-class=\"{\'disabled\': !page.active}\"\n                    ng-show=\"page.type == \'prev\' || page.type == \'next\'\" ng-switch=\"page.type\">\n                    <a ng-switch-when=\"prev\" ng-click=\"params.page(page.number)\" href=\"\">\n                        <i class=\"fa fa-chevron-left\"></i>\n                    </a>\n                    <a ng-switch-when=\"next\" ng-click=\"params.page(page.number)\" href=\"\">\n                        <i class=\"fa fa-chevron-right\"></i>\n                    </a>\n                </li>\n            </ul>\n        </div>\n    </div>\n</script>");}]);
var ap;
(function (ap) {
    var groupmanager;
    (function (groupmanager) {
        'use strict';
        var DataContainer = (function () {
            function DataContainer() {
                this.all = [];
                this.assigned = [];
                this.available = [];
                this.selectedAssigned = [];
                this.selectedAvailable = [];
            }
            DataContainer.prototype.clearSelected = function () {
                this.selectedAvailable.length = 0;
                this.selectedAssigned.length = 0;
            };
            return DataContainer;
        })();
        groupmanager.DataContainer = DataContainer;
    })(groupmanager = ap.groupmanager || (ap.groupmanager = {}));
})(ap || (ap = {}));

/// <reference path="../typings/tsd.d.ts" />
var ap;
(function (ap) {
    var groupmanager;
    (function (groupmanager) {
        'use strict';
        angular.module('angularPoint')
            .directive('apGroupManager', GroupManager);
        function GroupManager() {
            return {
                controller: groupmanager.GroupManagerController,
                controllerAs: 'vm',
                templateUrl: 'angular-point-group-manager-templates.html'
            };
        }
    })(groupmanager = ap.groupmanager || (ap.groupmanager = {}));
})(ap || (ap = {}));

/// <reference path="index.ts" />
/// <reference path="dataContainer.ts" />
var ap;
(function (ap) {
    var groupmanager;
    (function (groupmanager) {
        'use strict';
        var vm, $filter, $q, $timeout, _, apConfig, apDataService, NgTableParams, toastr;
        var GroupManagerController = (function () {
            function GroupManagerController($scope, $injector) {
                this.$scope = $scope;
                this.activeTab = 'Users';
                this.assignedOptions = [];
                this.availableOptions = [];
                this.groupFilter = '';
                this.groups = new groupmanager.DataContainer();
                this.siteUrl = '';
                this.tabContents = {};
                this.userFilter = '';
                this.users = new groupmanager.DataContainer();
                vm = this;
                $filter = $injector.get('$filter');
                NgTableParams = $injector.get('NgTableParams');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
                apDataService = $injector.get('apDataService');
                apConfig = $injector.get('apConfig');
                toastr = $injector.get('toastr');
                _ = $injector.get('_');
                vm.activate();
            }
            GroupManagerController.prototype.activate = function () {
                apDataService.getCurrentSite()
                    .then(function (siteUrl) {
                    vm.siteUrl = siteUrl;
                });
                $q.all([vm.getUserCollection(), vm.getGroupCollection()])
                    .then(function () {
                    vm.updateTab('Users');
                });
                vm.buildTables();
            };
            GroupManagerController.prototype.buildInputs = function (assignedItems, type) {
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
                _.each(assignedItems, function (item) {
                    map.push(item.ID);
                });
                _.each(data.all, function (item) {
                    if (_.indexOf(map, item.ID) > -1) {
                        //Already assigned
                        assigned.push(item);
                    }
                    else {
                        available.push(item);
                    }
                });
                Array.prototype.push.apply(data.available, available);
                Array.prototype.push.apply(data.assigned, assigned);
            };
            GroupManagerController.prototype.buildTables = function () {
                vm.groupsTable = new NgTableParams({
                    page: 1,
                    count: 30,
                    sorting: {
                        title: 'asc'
                    }
                }, {
                    total: vm.groups.all.length,
                    getData: function (params) {
                        console.time('Filtering');
                        // use build-in angular filter
                        var orderedData = vm.groups.all;
                        var filteredData = $filter('filter')(orderedData, function (record) {
                            var match = false;
                            if (vm.groupFilter === '') {
                                return true;
                            }
                            var textFields = ['ID', 'Name', 'Description'];
                            var searchStringLowerCase = vm.groupFilter.toLowerCase();
                            _.each(textFields, function (fieldName) {
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
                vm.usersTable = new NgTableParams({
                    page: 1,
                    count: 30,
                    sorting: {
                        title: 'asc'
                    }
                }, {
                    total: vm.users.all.length,
                    getData: function (params) {
                        var orderedData = vm.users.all;
                        var filteredData = $filter('filter')(orderedData, function (record) {
                            var match = false;
                            if (vm.userFilter === '') {
                                return true;
                            }
                            var textFields = ['ID', 'Name', 'Email'];
                            var searchStringLowerCase = vm.userFilter.toLowerCase();
                            _.each(textFields, function (fieldName) {
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
            };
            GroupManagerController.prototype.initializeFilterFields = function () {
                vm.users.filter = vm.users.filter || vm.groups.all[0];
                vm.groups.filter = vm.groups.filter || vm.users.all[0];
            };
            GroupManagerController.prototype.getGroupCollection = function () {
                var deferred = $q.defer();
                apDataService.getCollection({
                    webUrl: vm.siteUrl,
                    operation: 'GetGroupCollectionFromSite'
                }).then(function (response) {
                    Array.prototype.push.apply(vm.groups.all, response);
                    deferred.resolve(vm.groups.all);
                });
                return deferred.promise;
            };
            GroupManagerController.prototype.getUserCollection = function () {
                var deferred = $q.defer();
                apDataService.getCollection({
                    webUrl: vm.siteUrl,
                    operation: 'GetUserCollectionFromSite'
                }).then(function (response) {
                    _.each(response, function (user) {
                        //Assume that valid users all have email addresses and services/groups don't
                        // if (user.Email) {
                        vm.users.all.push(user);
                        // }
                    });
                    deferred.resolve(vm.users.all);
                });
                return deferred.promise;
            };
            GroupManagerController.prototype.groupDetailsLink = function (group) {
                vm.users.filter = group;
                vm.updateTab('Users');
            };
            /**
             * Copy users from one group into another
             */
            GroupManagerController.prototype.mergeGroups = function () {
                vm.updatePermissions('AddUserToGroup', vm.users.assigned, [vm.targetGroup])
                    .then(function (promiseArray) {
                    toastr.success(promiseArray.length + ' users successfully merged.');
                    //Reset dropdowns to empty
                    vm.sourceGroup = undefined;
                    vm.targetGroup = undefined;
                });
            };
            GroupManagerController.prototype.updateAvailableGroups = function () {
                var deferred = $q.defer();
                toastr.info('Retrieving an updated list of groups for the current user');
                apDataService.getCollection({
                    webUrl: vm.siteUrl,
                    operation: 'GetGroupCollectionFromUser',
                    userLoginName: vm.groups.filter.LoginName
                }).then(function (response) {
                    vm.buildInputs(response, 'groups');
                    deferred.resolve(response);
                });
                return deferred.promise;
            };
            GroupManagerController.prototype.updateAvailableUsers = function (group) {
                var deferred = $q.defer();
                toastr.info('Retrieving an updated list of users for the current group');
                apDataService.getCollection({
                    webUrl: vm.siteUrl,
                    groupName: group.Name,
                    operation: 'GetUserCollectionFromGroup'
                }).then(function (response) {
                    vm.buildInputs(response, 'users');
                    deferred.resolve(response);
                }, function () {
                    toastr.error('Please verify that you have sufficient permissions to view members of this group');
                    //No users were returned so display all users as available
                    deferred.resolve([]);
                });
                return deferred.promise;
            };
            /**
             * Can add/remove multiple users to multiple groups asynchronously
             * @param {string} operation - Either 'AddUserToGroup' || 'RemoveUserFromGroup'
             * @param {array} usersArray
             * @param {array} groupsArray
             * @returns {Promise.promise|*}
             */
            GroupManagerController.prototype.updatePermissions = function (operation, usersArray, groupsArray) {
                var deferredPermissionsUpdate = $q.defer();
                if (!usersArray.length) {
                    toastr.warning('Please make a selection');
                }
                else {
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
                            }
                            else {
                                apDataService.serviceWrapper({
                                    webUrl: vm.siteUrl,
                                    filterNode: 'User',
                                    operation: operation,
                                    groupName: group.Name,
                                    userLoginName: user.LoginName
                                }).then(function (response) {
                                    deferred.resolve(response);
                                });
                            }
                            queue.push(deferred.promise);
                        });
                    });
                    vm.users.clearSelected();
                    vm.groups.clearSelected();
                    //Resolved when all promises complete
                    $q.all(queue).then(function (responses) {
                        toastr.success(operation === 'AddUserToGroup' ?
                            'User successfully added' :
                            'User successfully removed');
                        if (!apConfig.offline) {
                            //Retrieve updated value from the server
                            if (vm.activeTab === 'Users') {
                                vm.updateAvailableUsers(vm.users.filter);
                            }
                            else {
                                vm.updateAvailableGroups();
                            }
                        }
                        deferredPermissionsUpdate.resolve(responses);
                    }, function () {
                        toastr.error('There was a problem removing the user');
                    });
                }
                return deferredPermissionsUpdate.promise;
            };
            GroupManagerController.prototype.updateTab = function (tab) {
                vm.initializeFilterFields();
                vm.activeTab = tab;
                if (tab === 'Groups') {
                    vm.updateAvailableGroups().then(function () {
                    });
                }
                else {
                    vm.updateAvailableUsers(vm.users.filter).then(function () {
                    });
                }
            };
            GroupManagerController.prototype.userDetailsLink = function (user) {
                vm.groups.filter = user;
                vm.updateTab('Groups');
            };
            return GroupManagerController;
        })();
        groupmanager.GroupManagerController = GroupManagerController;
    })(groupmanager = ap.groupmanager || (ap.groupmanager = {}));
})(ap || (ap = {}));

//# sourceMappingURL=angular-point-group-manager.js.map