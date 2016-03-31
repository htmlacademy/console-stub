// http://mochajs.org/
// @see http://chaijs.com/api/bdd/

/* global describe, beforeEach, afterEach, it, expect */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "test*" }]*/

describe('Console', function() {
  var testDomContext;
  var jsConsoleInit = window.jsConsoleInit;
  var jsConsole;
  var consoleContainer;


  beforeEach(function() {
    // Load html context
    document.body.innerHTML = window.__html__['tests/test-context.html'];
    testDomContext = document.querySelector('.test-context');

    consoleContainer = document.createElement('div');
    testDomContext.appendChild(consoleContainer);

    jsConsole = jsConsoleInit(consoleContainer);
  });

  afterEach(function() {
    testDomContext.innerHTML = '';
    document.body.innerHTML = '';
    jsConsole = null;
    testDomContext = null;
  });

  it('init: should create console stub with API methods', function() {
    expect(jsConsole).to.have.all.keys('log', 'clean', 'getLogSource');
  });

  it('init: should create HTML console stub ', function() {
    expect(consoleContainer.innerHTML).to.equal(
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code"></pre>'
    );
  });

  it('API: should log undefined', function() {
    var codeToLog = undefined;
    var reference = '' +
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\n' +
      'log:  <span class="undefined">undefined</span>\n</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log NaN', function() {
    var codeToLog = NaN;
    var reference = '' +
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\n' +
      'log:  <span class="NaN">NaN</span>\n</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log empty string', function() {
    var codeToLog = '';
    var reference = '' +
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\n' +
      'log:  <span class="string">""</span>\n</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log boolean', function() {
    var codeToLog = true;
    var reference = '' +
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\n' +
      'log:  <span class="boolean">true</span>\n</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log number', function() {
    var codeToLog = 100;
    var reference = '' +
      '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\n' +
      'log:  <span class="number">100</span>\n</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log array', function() {
    var codeToLog = [0, 1, 2];
    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\nlog:  [\n  ' +
      '<span class="number">0</span>,\n  ' +
      '<span class="number">1</span>,\n  ' +
      '<span class="number">2</span>' +
      '\n]\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log object', function() {
    var codeToLog = {key: 'value'};
    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\nlog:  {\n  ' +
      '<span class="key">"key":</span> ' +
      '<span class="string">"value"</span>' +
      '\n}\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log function', function() {
    var codeToLog = function() {
      var testVariable = 'method code';
    };

    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">\n\nlog:  ' +
      '<span class="function">function () {\n      var testVariable = \'method code\';\n    }</span>' +
      '\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log object method: function', function() {
    var codeToLog = {
      method: function() {
        var testVariable = 'method code';
      }
    };
    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\nlog:  {\n  ' +
      '<span class="key">"method":</span> ' +
      '<span class="string">"function () {\\n        var testVariable = \'method code\';\\n      }"' +
      '</span>' +
      '\n}\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log array item: function', function() {
    var codeToLog = {
      method: function() {
        var testVariable = 'method code';
      }
    };
    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\nlog:  {\n  ' +
      '<span class="key">"method":</span> ' +
      '<span class="string">"function () {\\n        var testVariable = \'method code\';\\n      }"' +
      '</span>' +
      '\n}\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });

  it('API: should log array of objects', function() {
    var codeToLog = [
      {key1: 'value1'},
      {key2: 'value2'}
    ];

    var reference = '<h3 class="console-container__header">Демо–Консоль</h3>' +
      '<pre class="console-container__code">' +
      '\n\nlog:  [\n  {\n    ' +
      '<span class="key">"key1":</span> ' +
      '<span class="string">"value1"</span>\n  },\n  {\n    ' +
      '<span class="key">"key2":</span> ' +
      '<span class="string">"value2"</span>' +
      '\n  }\n]\n' +
      '</pre>';

    jsConsole.log(codeToLog);

    expect(jsConsole.getLogSource()).to.equal(reference);
  });
});
