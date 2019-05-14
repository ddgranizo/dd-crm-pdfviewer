
describe('SettingsService', function () {

    var settingsService;

    beforeEach(module('ddApp'));

    beforeEach(function () {
        inject(['settingsService', function (service) {
            settingsService = service;
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

