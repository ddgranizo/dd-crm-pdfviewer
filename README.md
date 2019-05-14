# dd-crm-pdfviewer
Pdf viewer for Dynamics CRM


#Install karma:
npm install -g yo generator-karma

For test directives
npm install karma-ng-html2js-preprocessor


#Configurar karma
yo karma --browsers "Chrome" --app-files "src/**/*.js" --test-files "test/**/*.js" --base-path ".."

#Karma.confg.js

files: [
    'src/thirds/js/pdf.js',
    'src/thirds/js/font-awesome.min.js',
    'src/thirds/js/jquery-3.3.1.slim.min.js',
    'src/thirds/js/popper.min.js',
    'src/thirds/js/bootstrap.min.js',
    'src/thirds/js/angular.min.js',
    './node_modules/angular-mocks/angular-mocks.js',
    'src/main.js',
    'test/**/*.js'
],

browsers: [
    'ChromeDebugging'
],

customLaunchers : {
    ChromeDebugging : {
    base: 'Chrome',
    flags: ['--remote-debugging-port=9333']
    }
},



#Launch with Karma
{
    "type": "chrome",
    "request": "attach",
    "name": "Attach Karma Chrome",
    "address": "127.0.0.1",
    "port": 9333,
    "pathMapping": {
        "/": "${workspaceRoot}",
        "/base/":  "${workspaceRoot}",
    }
}



#Test execution

npm test