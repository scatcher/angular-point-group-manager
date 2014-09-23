angular-point-group-manager
===========================

angular-point tool to manage SharePoint users and groups.

Just need to setup a route to reference the controller/view.

'''
app.config(function($stateProvider) {
        $stateProvider

            //Group Manager
            .state('groupmanager', {
                url: '/group_manager',
                templateUrl: 'bower_components/angular-point-group-manager/src/group_manager_view.html',
                controller: 'apGroupManagerCtrl'
            });
});
'''
