/// <reference path="../typings/tsd.d.ts" />

module ap.groupmanager {
  'use strict';
  
  angular.module('angularPoint')
    .directive('apGroupManager', GroupManager);
    
    function GroupManager() {
        return {
            controller: GroupManagerController,
            controllerAs: 'vm',
            templateUrl: 'angular-point-group-manager-templates.html'
        };
    }
  
}