describe('MainViewDirective', function () {

    var settingsService;
    var xrmRepositoryService;
    var pdfService;
    var _$compile;
    var _$rootScope;
    var element;
    var $scope;

    beforeEach(module('ddApp'));
    beforeEach(module('myAppTestTemplates'));

    beforeEach(function () {
        inject(['settingsService', 'xrmRepositoryService', 'pdfService',
            function (_settingsService, _xrmRepositoryService, _pdfService) {
                settingsService = _settingsService;
                xrmRepositoryService = _xrmRepositoryService;
                pdfService = _pdfService;
            }
        ]);
    });

    beforeEach(inject(function ($rootScope, $compile) {
        _$rootScope = $rootScope;
        _$compile = $compile;

    }));

    describe('UnsetInfo', function () {
        it('Should unset info', function () {

            settingsService.triedParse = true;
            var pdfAnnotations = [];
            spyOn(xrmRepositoryService, 'webApiGet').and.callFake(function () { return Promise.resolve({ data: { value: pdfAnnotations } }) });

            var $scope = compileDirective(_$rootScope, _$compile, '<main-view></main-view>');

            $scope.infoMessage = "text";
            $scope.infoTitle = "title";
            $scope.isInfoMessage = true;
            $scope.unsetInfo();

            expect($scope.infoMessage).toBeNull();
            expect($scope.infoTitle).toBeNull();
            expect($scope.isInfoMessage).toBe(false);
        });
    });



    describe('UnsetError', function () {
        it('Should unset error', function () {

            settingsService.triedParse = true;
            var pdfAnnotations = [];
            spyOn(xrmRepositoryService, 'webApiGet').and.callFake(function () { return Promise.resolve({ data: { value: pdfAnnotations } }) });

            var $scope = compileDirective(_$rootScope, _$compile, '<main-view></main-view>');

            $scope.errorMessage = "text";
            $scope.errorTitle = "title";
            $scope.isErrorMessage = true;
            $scope.unsetError();

            expect($scope.errorMessage).toBeNull();
            expect($scope.errorTitle).toBeNull();
            expect($scope.isErrorMessage).toBe(false);
        });
    });

    describe('UnsetError', function () {
        it('Should unset error', function () {

            settingsService.triedParse = true;
            var pdfAnnotations = [];
            spyOn(xrmRepositoryService, 'webApiGet').and.callFake(function () { return Promise.resolve({ data: { value: pdfAnnotations } }) });

            var $scope = compileDirective(_$rootScope, _$compile, '<main-view></main-view>');

            $scope.errorMessage = "text";
            $scope.errorTitle = "title";
            $scope.isErrorMessage = true;
            $scope.unsetError();

            expect($scope.errorMessage).toBeNull();
            expect($scope.errorTitle).toBeNull();
            expect($scope.isErrorMessage).toBe(false);
        });
    });

    describe('Check null id parameter when is 0 or undefined or null', function () {
        it('Should return true', function () {

            settingsService.triedParse = true;
            var pdfAnnotations = [];
            spyOn(xrmRepositoryService, 'webApiGet').and.callFake(function () { return Promise.resolve({ data: { value: pdfAnnotations } }) });

            var $scope = compileDirective(_$rootScope, _$compile, '<main-view></main-view>');

            var response0 = $scope.checkNullIdParameter(0);
            var response02 = $scope.checkNullIdParameter('0');
            var responseUndefined = $scope.checkNullIdParameter();
            var responseNull = $scope.checkNullIdParameter(null);

            expect(response0).toBe(true);
            expect(response02).toBe(true);
            expect(responseUndefined).toBe(true);
            expect(responseNull).toBe(true);
        });
    });

});

function compileDirective($rootScope, $compile, tag) {
    var currentScope = $rootScope.$new();
    let elementData = angular.element(tag);
    var element = $compile(elementData)(currentScope);
    currentScope.$digest();
    var $scope = element.scope().$$childHead;
    return $scope;
}