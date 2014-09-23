'use strict';

angular.module('angularPoint')
    .controller('apGroupManagerCtrl', ["$scope", "$q", "$timeout", "$filter", "_", "ngTableParams", "apConfig", "apDataService", "toastr", function ($scope, $q, $timeout, $filter, _, ngTableParams, apConfig, apDataService, toastr) {

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
    }]);
;angular.module('angularPoint').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('bower_components/angular-point-group-manager/src/group_manager_view.html',
    "<style>select.multiselect {\n" +
    "        min-height: 400px;\n" +
    "    }\n" +
    "\n" +
    "    .ui-match {\n" +
    "        background: yellow;\n" +
    "    }</style><div class=container><ul class=\"nav nav-tabs\"><li ng-class=\"{active: state.activeTab === 'Users'}\"><a href ng-click=\"updateTab('Users')\">Users</a></li><li ng-class=\"{active: state.activeTab === 'Groups'}\"><a href ng-click=\"updateTab('Groups')\">Groups</a></li><li ng-class=\"{active: state.activeTab === 'Merge'}\"><a href ng-click=\"state.activeTab = 'Merge'\">Merge</a></li><li ng-class=\"{active: state.activeTab === 'UserList'}\"><a href ng-click=\"state.activeTab = 'UserList'\">User List</a></li><li ng-class=\"{active: state.activeTab === 'GroupList'}\"><a href ng-click=\"state.activeTab = 'GroupList'\">Group List</a></li></ul><div ng-if=\"state.activeTab === 'Users'\"><div class=\"panel panel-default\"><div class=panel-heading><div class=row><div class=col-xs-5><span style=font-weight:bold>Select a Group:</span><select class=form-control ng-model=users.filter ng-options=\"group.Name for group in groups.all\" ng-change=updateAvailableUsers(users.filter) style=\"min-width: 100px\"></select></div><div class=col-xs-7><span style=font-weight:bold>Site/Site Collection:</span> <input class=form-control ng-model=state.siteUrl ng-change=updateAvailableUsers(users.filter)></div></div><div class=row ng-if=users.filter.Description><div class=col-xs-12><p class=help-block>Description: {{ users.filter.Description }}</p></div></div></div><div class=panel-body><div class=row><div class=col-xs-12><div colspan=3 class=description>This tab will allow you to quickly assign multiple users to a selected group.</div></div></div><hr class=hr-sm><div class=row><div class=col-xs-5><div class=form-group><label>Available Users ({{users.available.length}})</label><select ng-model=users.selectedAvailable ng-options=\"user.Name for user in users.available\" multiple class=\"multiselect form-control\"></select></div></div><div class=\"col-xs-2 text-center\" style=\"padding-top: 175px\"><button class=\"btn btn-default\" style=width:80px ng-click=\"updatePermissions('AddUserToGroup', users.selectedAvailable, [users.filter])\" title=\"Add user\"><i class=\"fa fa-2x fa-angle-double-right\"></i></button><br><br><button class=\"btn btn-default\" style=width:80px ng-click=\"updatePermissions('RemoveUserFromGroup', users.selectedAssigned, [users.filter])\"><i class=\"fa fa-2x fa-angle-double-left\"></i></button></div><div class=col-xs-5><div class=form-group><label>Assigned Users ({{users.assigned.length}})</label><select ng-model=users.selectedAssigned ng-options=\"user.Name for user in users.assigned\" multiple class=\"multiselect form-control\"></select></div></div></div></div></div></div><div ng-if=\"state.activeTab === 'Groups'\"><div class=\"panel panel-default\"><div class=panel-heading><div class=row><div class=col-xs-5><span style=font-weight:bold>Select a User:</span><select class=form-control ng-model=groups.filter ng-options=\"user.Name for user in users.all\" ng-change=updateAvailableGroups(groups.filter) style=\"min-width: 100px\"></select></div><div class=col-xs-7><span style=font-weight:bold>Site/Site Collection:</span> <input class=form-control ng-model=state.siteUrl ng-change=updateAvailableGroups(groups.filter)></div></div></div><div class=panel-body><div class=row><div class=col-xs-12><div colspan=3 class=description>This page was created to make the process of managing users/groups within the site collection more manageable. When a user is selected, the available groups are displayed on the left and the groups that the user is currently a member of will show on the right. Selecting multiple groups is supported.</div></div></div><hr class=hr-sm><div class=row><div class=col-xs-5><div class=form-group><label>Available Groups ({{groups.available.length}})</label><select ng-model=groups.selectedAvailable ng-options=\"group.Name for group in groups.available\" multiple class=\"multiselect form-control\"></select></div></div><div class=\"col-xs-2 text-center\" style=\"padding-top: 175px\"><button class=\"btn btn-default\" style=width:80px ng-click=\"updatePermissions('AddUserToGroup', [groups.filter], groups.selectedAvailable)\" title=\"Add to group\"><i class=\"fa fa-2x fa-angle-double-right\"></i></button><br><br><button class=\"btn btn-default\" style=width:80px ng-click=\"updatePermissions('RemoveUserFromGroup', [groups.filter], groups.selectedAssigned)\"><i class=\"fa fa-2x fa-angle-double-left\"></i></button></div><div class=col-xs-5><div class=form-group><label>Assigned Users ({{users.assigned.length}})</label><select ng-model=groups.selectedAssigned ng-options=\"group.Name for group in groups.assigned\" multiple class=\"multiselect form-control\"></select></div></div></div></div></div></div><div ng-if=\"state.activeTab === 'Merge'\"><div class=\"panel panel-default\"><div class=panel-body><div class=row><div class=col-xs-12><div class=description>This tab allows us to copy the members from the \"Source\" group over to the \"Target\" group. It's not a problem if any of the users already exist in the destination group. Note: This is a onetime operation so any additional members added to the Source group will not automatically be added to the destination group. You will need to repeat this process.</div></div></div><hr class=hr-sm><div class=row><div class=col-xs-5><fieldset><legend>Step 1</legend><div class=well><div class=form-group><label>Source Group</label><select class=form-control ng-model=state.sourceGroup ng-options=\"group.Name for group in groups.all\" ng-change=updateAvailableUsers(state.sourceGroup) style=\"min-width: 100px\"></select></div></div></fieldset></div><div class=col-xs-5><fieldset><legend>Step 2</legend><div class=well><div class=form-group><label>Source Group</label><select class=form-control ng-model=state.targetGroup ng-options=\"group.Name for group in groups.all\" style=\"min-width: 100px\"></select></div></div></fieldset></div><div class=col-xs-2><fieldset><legend>Step 3</legend><button class=\"btn btn-success\" ng-disabled=\"state.sourceGroup.length < 1 || state.targetGroup.length < 1\" ng-click=mergeGroups() title=\"Copy all members from the source group over to the destination group.\"><i class=\"fa fa-2x fa-magic\"></i> Merge</button></fieldset></div></div></div></div></div><div ng-if=\"state.activeTab === 'UserList'\"><div class=\"panel panel-default\"><div class=panel-heading><span style=font-weight:bold>User Filter</span> <input class=form-control ng-model=state.userFilter ng-change=usersTable.reload()></div><table ng-table=usersTable class=table template-pagination=custom/pager><tr ng-repeat=\"user in $data\"><td data-title=\"'ID'\">{{ user.ID }}</td><td data-title=\"'Name'\"><a href ng-click=userDetailsLink(user) ng-bind-html=\"user.Name |  highlight:state.userFilter\"></a></td><td data-title=\"'Email'\">{{ user.Email }}</td></tr></table></div></div><div ng-if=\"state.activeTab === 'GroupList'\"><div class=\"panel panel-default\"><div class=panel-heading><span style=font-weight:bold>Group Filter</span> <input class=form-control ng-model=state.groupFilter ng-change=groupsTable.reload()></div><table ng-table=groupsTable class=table template-pagination=custom/pager><tr ng-repeat=\"group in $data\"><td data-title=\"'ID'\">{{ group.ID }}</td><td data-title=\"'Name'\"><a href ng-click=groupDetailsLink(group) ng-bind-html=\"group.Name |  highlight:state.groupFilter\"></a></td><td data-title=\"'Description'\">{{ group.Description }}</td></tr></table></div></div></div><script type=text/ng-template id=custom/pager><div class=\"row\">\n" +
    "        <div class=\"col-xs-12\">\n" +
    "            <ul class=\"pager ng-cloak\">\n" +
    "                <li ng-repeat=\"page in pages\"\n" +
    "                    ng-class=\"{'disabled': !page.active}\"\n" +
    "                    ng-show=\"page.type == 'prev' || page.type == 'next'\" ng-switch=\"page.type\">\n" +
    "                    <a ng-switch-when=\"prev\" ng-click=\"params.page(page.number)\" href=\"\">\n" +
    "                        <i class=\"fa fa-chevron-left\"></i>\n" +
    "                    </a>\n" +
    "                    <a ng-switch-when=\"next\" ng-click=\"params.page(page.number)\" href=\"\">\n" +
    "                        <i class=\"fa fa-chevron-right\"></i>\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "    </div></script>"
  );

}]);
