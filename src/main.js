var defaultSettings = {
    crmVersion: "9.1",
    scale: 1,
    messages: {
        saveFirstTitle: "Can't load any PDF",
        saveFirstText: "Save first the record. Then reload the page.",
        foundZeroDocuments: "Can't find any PDF in this record. Use annotations to attach PDFs",
        loadingFiles: "Loading PDFs...",
        errorTitle: "Error",
    }
}

var app = angular.module("ddApp", [])
    .controller("pdfVieweController", ["$scope", ($scope) => { }]);

app.service('settingsService', ['$window',
    function ($window) {

        this.triedParse = false;
        this.userData = null;

        this.parseUserData = function () {
            let rawData = this.getQueryParam("data");
            let decoded = decodeURIComponent(rawData);
            try {
                this.userData = JSON.parse(decoded);
            } catch (error) {
                console.log("Error parsing context data. Is not valid json.");
                console.log(decoded);
                console.error(error);
            }
        }

        this.getSetting = function (settingName) {
            if (this.triedParse == false) {
                this.triedParse = true;
                this.parseUserData();
            }
            if (this.userData != null) {
                let userValue = this.getPropertyFromString(this.userData, settingName);
                if (userValue != null) {
                    return userValue;
                }
            }
            return this.getPropertyFromString($window.defaultSettings, settingName);
        }

        this.getQueryParam = function (name) {
            var searchParams = this.getSearchParams();
            var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                .exec(searchParams);
            return (results !== null) ? results[1] || 0 : false;
        }

        this.getSearchParams = function () {
            return window.location.search;
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

app.service('pdfService', ['$window', 'settingsService',
    function ($window, settingsService) {
        this.setPdf = function (encoded) {
            var pdfjsLib = $window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.js';
            var loadingTask = pdfjsLib.getDocument({ data: atob(encoded) });
            loadingTask.promise.then(function (pdf) {
                var pageNumber = 1;
                pdf.getPage(pageNumber).then(function (page) {
                    var initialScale = settingsService.getSetting("scale");
                    var scale = initialScale;
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

app.service('xrmRepositoryService', ['$window', '$http', '$q', '$rootScope', 'settingsService',
    function ($window, $http, $q, $rootScope, settingsService) {

        this.getPdfAnnotations = function (entity, id) {
            return this.webApiGet(`annotations?$filter=objecttypecode eq '${entity}' and _objectid_value eq ${id} and mimetype eq 'application/pdf'`)
                .then(response => { return response.data.value; })
        }

        this.webApiGet = function (options) {
            const url = this.getApiUrl() + options;
            return $http({
                method: 'GET',
                url: url
            }).then(response => {
                return response;
            })
        }

        this.getApiUrl = function () {
            let crmVersion = settingsService.getSetting("crmVersion");
            return `${this.getUrl()}/api/data/v${crmVersion}/`;
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


                    $scope.loadingPdfMessage = null;
                    $scope.saveFirstTitleMessage = null;
                    $scope.saveFirstTextMessage = null;
                    $scope.foundZeroDocumentsMessage = null;
                    $scope.errorTitleMessage = null;
                    initialize = function () {

                        $scope.setMessages();

                        var contextId = settingsService.getQueryParam("id");
                        var contextTypeName = settingsService.getQueryParam("typename");

                        if (checkNullIdParameter(contextId)) {
                            $scope.notContextId = true;
                            $scope.setInfo($scope.saveFirstTitleMessage, $scope.saveFirstTextMessage);
                            return;
                        }
                        $scope.contextEntityName = contextTypeName;
                        $scope.contextId = contextId;
                        $scope.reloadAnnotations();
                    }

                    $scope.setMessages = function () {
                        $scope.loadingPdfMessage = settingsService.getSetting("messages.loadingFiles");
                        $scope.saveFirstTitleMessage = settingsService.getSetting("messages.saveFirstTitle");
                        $scope.saveFirstTextMessage = settingsService.getSetting("messages.saveFirstText");
                        $scope.foundZeroDocumentsMessage = settingsService.getSetting("messages.foundZeroDocuments");
                        $scope.errorTitleMessage = settingsService.getSetting("messages.errorTitle");
                    }

                    $scope.reloadAnnotations = function () {
                        $scope.unsetInfo();
                        $scope.unsetError();
                        $scope.clearArray($scope.contextPdfs);
                        $scope.selectedPdf = null;
                        $scope.loadingAnnotations = true;
                        xrmRepositoryService.getPdfAnnotations($scope.contextEntityName, $scope.contextId)
                            .then(pdfs => {
                                if (pdfs.length > 0) {
                                    $scope.selectedPdf = pdfs[0];
                                    $scope.contextPdfs = pdfs;
                                } else {
                                    $scope.setInfo($scope.saveFirstTitleMessage, $scope.foundZeroDocumentsMessage);
                                }
                                $scope.loadingAnnotations = false;
                            })
                            .catch(error => {
                                $scope.loadingAnnotations = false;
                                let stringfy = $scope.stringfyError(error, null, '\t');
                                $scope.setError($scope.errorTitleMessage, stringfy);
                            });
                    }


                    $scope.stringfyError = function (err, filter, space) {
                        var plainObject = {};
                        Object.getOwnPropertyNames(err).forEach(function (key) {
                            plainObject[key] = err[key];
                        });
                        return JSON.stringify(plainObject, filter, space);
                    };

                    $scope.clearArray = function (arr) {
                        arr.splice(0, arr.length);
                    }

                    $scope.getPdfTitle = function (annotation) {
                        return annotation["filename"];
                    }

                    $scope.$watch('selectedPdf', function (newValue, oldValue) {
                        if (newValue !== null
                            && newValue["annotationid"] !== null) {
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


                    $scope.unsetError = function () {
                        $scope.errorMessage = null;
                        $scope.errorTitle = null;
                        $scope.isErrorMessage = false;
                    }

                    $scope.setError = function (title, message) {
                        $scope.errorMessage = message;
                        $scope.errorTitle = title;
                        $scope.isErrorMessage = true;
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