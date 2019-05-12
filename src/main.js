var defaultSettings = {
    crmVersion: "9.1",
}


var app = angular.module("ddApp", [])
    .controller("pdfVieweController", ["$scope", ($scope) => { }]);

app.service('settingsService', ['$window',
    function ($window) {
        this.getSetting = function (settingName) {
            //todo: get settig from data pased from CRM context
            return $window.defaultSettings[settingName];
        }
    }]);


app.service('xrmRepositoryService', ['$window', '$http', '$q', '$rootScope', 'settingsService',
    function ($window, $http, $q, $rootScope, settingsService) {

        this.getPdfAnnotations = function () {
            return webApiGet('annotations')
                .then(response => { return response.data.value; })
        }


        webApiGet = function (options) {
            const url = getApiUrl() + options;

            return $http({
                method: 'GET',
                url: url
            })
                .then(response => {
                    return response;
                })
                .catch(function (data) {
                    console.log("Error:");
                    console.log(url);
                    console.log(data);
                });
        }

        getApiUrl = function () {
            let crmVersion = settingsService.getSetting("crmVersion");
            return `${GetGlobalContext().getClientUrl()}/api/data/v${crmVersion}/`;
        }

        this.getUrl = function () {
            return `${GetGlobalContext().getClientUrl()}`;
        }

    }]);


    app.directive('mainView', ["xrmRepositoryService", "settingsService", (xrmRepositoryService, settingsService) => {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                context: '=',
            },
            controller: function ($scope, $element) {
    
                initialize = function () {
                    
                }
    
                $scope.raiseMessage = function (title, text, ok, cancel) {
                    $scope.errTitle = title;
                    $scope.errText = text;
                    $scope.errOk = ok;
                    $scope.errCancel = cancel;
    
                    $('#errorModal').modal(null);
                }
    
                initialize();
    
            },
            template:
                ['<div id="mainViewController">',
    
                    //Toolbar
                    '<div class="container">',
                    '   <div class="row">',
                    '       <span  ng-show="!loadingSolutions" style="font-size: 20px; margin: 10px; cursor: pointer;" ng-click="reloadSolutions()"><i class="fas fa-sync"></i></span>',
                    '       <div class="btn-group" role="group" aria-label="Button group with nested dropdown">',
                    '           <div class="btn-group" role="group">',
                    '               <button id="btnGroupDrop1" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
                    '                   Solutions',
                    '               </button>',
                    '               <div class="dropdown-menu">',
                    '                   <a class="dropdown-item" href="#" ng-click="mergeSolutions()">Merge solutions</a>',
                    '               </div>',
                    '           </div>',
                    '           <div class="btn-group" role="group">',
                    '               <button id="btnGroupDrop1" type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
                    '                   Components',
                    '               </button>',
                    '               <div class="dropdown-menu">',
                    '                   <a class="dropdown-item" href="#" ng-click="showComponentDetailJson()">Show component detail in JSON</a>',
                    '                   <a class="dropdown-item" href="#" ng-click="removeComponentsFromSolution()">Remove component from solution (not from metadata)</a>',
                    '               </div>',
                    '           </div>',
                    '       </div>',
                    '   </div>',
                    '</div>', //container
    
    
    
                    //err message modal
                    '<div class="modal" tabindex="-1" role="dialog" id="errorModal">',
                    '   <div class="modal-dialog" role="document">',
                    '       <div class="modal-content">',
                    '           <div class="modal-header">',
                    '               <h5 class="modal-title">{{ errTitle }}</h5>',
                    '               <button type="button" class="close" data-dismiss="modal" aria-label="Close">',
                    '                   <span aria-hidden="true">&times;</span>',
                    '               </button>',
                    '           </div>',
                    '           <div class="modal-body">',
                    '               <p>{{ errText }}</p>',
                    '           </div>',
                    '           <div class="modal-footer">',
                    '               <button type="button" class="btn btn-primary"  ng-show="errOk!=null">{{ errOk }}</button>',
                    '               <button type="button" class="btn btn-secondary" data-dismiss="modal" ng-show="errCancel!=null">{{ errCancel }}</button>',
                    '           </div>',
                    '       </div>',
                    '   </div>',
                    '</div>',
                    '</div>',
                    '</div>'].join(""),
            replace: true
        };
    
    }]);