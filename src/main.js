var defaultSettings = {
    crmVersion: "9.1",
    messages: {
        saveFirstTitle: "Can't load any PDF",
        saveFirstText: "Save first the record. Then reload the page.",
        foundZeroDocuments: "Can't find any PDF in this record. Use annotations to attach PDFs",
    }
}


var app = angular.module("ddApp", [])
    .controller("pdfVieweController", ["$scope", ($scope) => { }]);

app.service('pdfService', ['$window',
    function ($window) {
        this.setPdf = function (encoded) {
            var pdfjsLib = $window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';
            var loadingTask = pdfjsLib.getDocument({ data: atob(encoded) });
            loadingTask.promise.then(function (pdf) {
                var pageNumber = 1;
                pdf.getPage(pageNumber).then(function (page) {
                    var scale = 1.5;
                    var viewport = page.getViewport({ scale: scale });
                    var canvas = document.getElementById('pdf-canvas');
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);
                    renderTask.promise.then(function () {
                        //completed
                    });
                });
            }, function (reason) {
                console.error(reason);
            });
            return loadingTask;
        }
    }]);

app.service('settingsService', ['$window',
    function ($window) {
        this.getSetting = function (settingName) {
            //todo: get settig from data pased from CRM context
            return this.getPropertyFromString($window.defaultSettings, settingName);
        }

        this.getQueryParam = function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                .exec(window.location.search);
            return (results !== null) ? results[1] || 0 : false;
        }

        this.getPropertyFromString = function (o, s) {
            s = s.replace(/\[(\w+)\]/g, '.$1');
            s = s.replace(/^\./, '');
            var a = s.split('.');
            for (var i = 0, n = a.length; i < n; ++i) {
                var k = a[i];
                if (k in o) {
                    o = o[k];
                } else {
                    return;
                }
            }
            return o;
        }
    }]);


app.service('xrmRepositoryService', ['$window', '$http', '$q', '$rootScope', 'settingsService',
    function ($window, $http, $q, $rootScope, settingsService) {

        this.getPdfAnnotations = function (entity, id) {
            return webApiGet(`annotations?$filter=objecttypecode eq '${entity}' and _objectid_value eq ${id} and mimetype eq 'application/pdf'`)
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


app.directive('mainView',
    ['xrmRepositoryService', 'settingsService', 'pdfService',
        (xrmRepositoryService, settingsService, pdfService) => {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    context: '=',
                },
                controller: function ($scope, $element) {

                    $scope.contextEntityName = null;
                    $scope.contextId = null;
                    $scope.contextPdfs = [];
                    
                    $scope.selectedPdf = null;
                    $scope.isInfoMessage = false;
                    $scope.notContextId = false;
                    initialize = function () {

                        $scope.setMessages();
                        
                        var contextId = settingsService.getQueryParam("id");
                        var contextTypeName = settingsService.getQueryParam("typename");

                        if (checkNullIdParameter(contextId)) {
                            $scope.notContextId = true;
                            $scope.setInfo($scope.messages.saveFirstTitle, $scope.messages.saveFirstText);
                            return;
                        }
                        $scope.contextEntityName = contextTypeName;
                        $scope.contextId = contextId;
                        $scope.reloadAnnotations();
                    }

                    $scope.setMessages = function(){
                        var messages = settingsService.getSetting("messages");
                        $scope.messages = messages;
                    }

                    $scope.reloadAnnotations = function () {
                        $scope.unsetInfo();
                        $scope.contextPdfs.splice(0, $scope.contextPdfs.length);
                        $scope.selectedPdf = null;
                        $scope.loadingAnnotations = true;
                        xrmRepositoryService.getPdfAnnotations($scope.contextEntityName, $scope.contextId)
                            .then(pdfs => {
                                console.log(pdfs);
                                if (pdfs.length > 0) {
                                    $scope.selectedPdf = pdfs[0];
                                    $scope.contextPdfs = pdfs;
                                } else {
                                    $scope.setInfo($scope.messages.saveFirstTitle, $scope.messages.foundZeroDocuments);
                                }
                                $scope.loadingAnnotations = false;
                            })
                            .catch(error => {
                                console.log("Error:");
                                console.log(error);
                                $scope.loadingAnnotations = false;
                                $scope.setInfo($scope.messages.saveFirstTitle, $scope.messages.foundZeroDocuments);
                            });
                    }

                    $scope.getPdfTitle = function (annotation) {
                        return annotation["filename"];
                    }

                    $scope.$watch('selectedPdf', function (newValue, oldValue) {
                        if (newValue != null
                            && newValue["annotationid"] != null) {
                            const encoded = newValue["documentbody"];
                            pdfService.setPdf(encoded);
                        }
                    })

                    $scope.unsetInfo = function () {
                        $scope.infoMessage = null;
                        $scope.infoTitle = null;
                        $scope.isInfoMessage = false;
                    }

                    $scope.setInfo = function (title, message) {
                        $scope.infoMessage = message;
                        $scope.infoTitle = title;
                        $scope.isInfoMessage = true;
                    }

                    $scope.raiseMessage = function (title, text, ok, cancel) {
                        $scope.errTitle = title;
                        $scope.errText = text;
                        $scope.errOk = ok;
                        $scope.errCancel = cancel;

                        $('#errorModal').modal(null);
                    }

                    checkNullIdParameter = function (id) {
                        return typeof id === 'undefined' || id === null || id === 0 || id === '0';
                    }

                    initialize();

                },
                templateUrl: 'template/main.html',
                replace: true
            };

        }]);