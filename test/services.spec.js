

describe('XrmRepositoryService', function () {

    var settingsService;
    var xrmRepositoryService;

    beforeEach(module('ddApp'));

    beforeEach(function () {
        inject(['settingsService', 'xrmRepositoryService',
            function (_settingsService, _xrmRepositoryService) {
                settingsService = _settingsService;
                xrmRepositoryService = _xrmRepositoryService;
            }
        ]);
    });


    describe('Obtain URL', function () {
        var endpoint = "http://www.crm.com/";
        var crmVersion = "9.1";
        it('should return valid api URL', function () {
            spyOn(settingsService, 'getSetting').and.callFake(function () { return crmVersion; });
            spyOn(xrmRepositoryService, 'getUrl').and.callFake(function () { return endpoint; });
            var result = xrmRepositoryService.getApiUrl();
            expect(result).toBe(`${endpoint}/api/data/v${crmVersion}/`);
        });
    });

    describe('Get annotations', function () {
        it('should return path of the json', function () {
            let responseArray = [1, 2, 3];
            spyOn(xrmRepositoryService, 'webApiGet').and.callFake(function () { return Promise.resolve({ data: { value: responseArray } }) });
            xrmRepositoryService.getPdfAnnotations(null, null)
                .then(response => {
                    var result = response.length;
                    expect(result).toBe(responseArray.length);
                })
        });
    });

});





describe('SettingsService', function () {

    var settingsService;

    beforeEach(module('ddApp'));

    beforeEach(function () {
        inject(['settingsService', function (_settingsService) {
            settingsService = _settingsService;
        }
        ]);
    });

    describe('Obtain setting', function () {
        var userSettings = { crmVersion: "1.1", messages: { saveFirstTitle: "No se puede cargar PDF" } };

        it('should return user setting when exists', function () {
            settingsService.triedParse = true;
            settingsService.userData = userSettings;
            var dataParam = settingsService.getSetting("crmVersion");
            expect(dataParam).toBe(userSettings.crmVersion);
        });
        it('should return user setting subproperty when exists', function () {
            settingsService.triedParse = true;
            settingsService.userData = userSettings;
            var dataParam = settingsService.getSetting("messages.saveFirstTitle");
            expect(dataParam).toBe(userSettings.messages.saveFirstTitle);
        });
        it('should return default setting when user setting does not exists', function () {
            settingsService.triedParse = true;
            settingsService.userData = userSettings;
            var dataParam = settingsService.getSetting("scale");
            expect(dataParam).toBe(defaultSettings.scale);
        });
        it('should return default setting when user setting subproperty does not exists', function () {
            settingsService.triedParse = true;
            settingsService.userData = userSettings;
            var dataParam = settingsService.getSetting("messages.saveFirstText");
            expect(dataParam).toBe(defaultSettings.messages.saveFirstText);
        });
    });


    describe('Obtain sub property from object', function () {
        var data = { data1: { data2: 7 } };
        it('should get the value when is defined', function () {
            var dataParam = settingsService.getPropertyFromString(data, "data1.data2");
            expect(dataParam).toBe(7);
        });
        it('should get undefined when is undefined', function () {
            var dataParam = settingsService.getPropertyFromString(data, "data1.data9");
            expect(dataParam).toBeUndefined();
        });
    });

    describe('Obtain query params', function () {

        it('should get false when is defined', function () {

            spyOn(settingsService, 'getSearchParams').and.callFake(function () { return '?data=abc'; });
            var dataParam = settingsService.getQueryParam("nodata");
            expect(dataParam).toBe(false);
        });
        it('should get param when is defined', function () {

            spyOn(settingsService, 'getSearchParams').and.callFake(function () { return '?data=abc'; });
            var dataParam = settingsService.getQueryParam("data");
            expect(dataParam).toBe('abc');
        });
    });

    describe('Parse user data', function () {
        it('should be null when invalid json', function () {

            spyOn(settingsService, 'getQueryParam').and.callFake(function () { return '{a:b}'; });

            settingsService.parseUserData();
            var userData = settingsService.userData;

            expect(userData).toBeNull();
        });
    });

    describe('Parse user data', function () {
        it('should not be null when valid json', function () {

            spyOn(settingsService, 'getQueryParam').and.callFake(function () { return '{"a":"b"}'; });

            settingsService.parseUserData();
            var userData = settingsService.userData;

            expect(userData).not.toBeNull();
        });
    });
});

