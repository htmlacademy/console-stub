// http://mochajs.org/
// @see http://chaijs.com/api/bdd/

/* global describe, beforeEach, afterEach, it, expect */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "test*" }]*/

'use strict';

var CONSOLE_BEGIN = '<pre class="console-container__code">';
var CONSOLE_END = '</pre>';

describe('Console', function () {
  var testDomContext;
  var jsConsoleInit = window.jsConsoleInit;
  var jsConsole;
  var consoleContainer;

  var html = function () {
    var elements = [];

    return {
      append: function (element) {
        elements.push(element);
        return this;
      },
      build: function () {
        var result = [CONSOLE_BEGIN];
        result.push(elements.join('\n\n\n'));
        if (elements.length > 0) {
          result.push('\n\n\n');
        }
        result.push(CONSOLE_END);
        return result.join('');
      }
    };
  };

  var assert = function (elements) {
    var result = html();

    if (elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      elements.forEach(function (el) {
        result.append(el);
      });
    }

    expect(jsConsole.getLogSource()).not.differentFrom(result.build(), {showSpace: true, context: 5});
  };

  chai.use(chaiDiff);

  beforeEach(function () {
    // Load html context
    document.body.innerHTML = '<div class="test-context"></div>';
    testDomContext = document.querySelector('.test-context');

    consoleContainer = document.createElement('div');
    testDomContext.appendChild(consoleContainer);

    jsConsole = jsConsoleInit(consoleContainer);
  });

  afterEach(function () {
    testDomContext.innerHTML = '';
    document.body.innerHTML = '';
    jsConsole = null;
    testDomContext = null;
  });

  describe('#init:', function () {
    it('should create console stub with API methods', function () {
      expect(jsConsole).to.have.all.keys('log', 'error', 'clean', 'getLogSource', 'logDeep');
    });

    it('should create HTML console stub ', function () {
      assert();
    });

    it('should add log handler', function () {
      var codeToLog = 'this code should pass to log handler';
      var reference;

      // TODO: refactor with https://github.com/chaijs/chai-spies
      jsConsole.onlog = function (logData) {
        reference = logData[0]; // logData is arguments array
      };

      jsConsole.log(codeToLog);

      expect(codeToLog).to.equal(reference);
    });
  });

  describe('API: primitive types:', function () {
    it('should log undefined', function () {
      jsConsole.log(void 0);

      assert('log: <span class="undefined">undefined</span>');
    });

    it('should log NaN', function () {
      jsConsole.log(NaN);
      assert('log: <span class="NaN">NaN</span>');
    });

    it('should log empty string', function () {
      jsConsole.log('');
      assert('log: <span class="string">""</span>');
    });

    it('should log boolean', function () {
      jsConsole.log(true);
      assert('log: <span class="boolean">true</span>');
    });

    it('should log number', function () {
      jsConsole.log(100);
      assert('log: <span class="number">100</span>');
    });

    it('should log Infinity', function () {
      jsConsole.log(Infinity);
      assert('log: <span class="number">Infinity</span>');
    });

    it('should log -Infinity', function () {
      jsConsole.log(-Infinity);

      assert('log: <span class="number">-Infinity</span>');
    });

    it('should log error', function () {
      jsConsole.error('You shall not pass!');

      assert('log: <span class="error">You shall not pass!</span>');
    });

    it('should log error', function () {
      jsConsole.log(new Error('You shall not pass!'));

      assert('log: <span class="error">You shall not pass!</span>');
    });

    it('should log several entries', function () {
      jsConsole.log(-Infinity);
      jsConsole.log(0);
      jsConsole.log(Infinity);

      assert([
        'log: <span class="number">-Infinity</span>',
        'log: <span class="number">0</span>',
        'log: <span class="number">Infinity</span>'
      ]);
    });

    it('should log several values', function () {
      jsConsole.log(-Infinity, 0);

      assert([
        'log: <span class="number">-Infinity</span>' + '\t<span class="number">0</span>'
      ]);
    });

  });

  it('API: should log array', function () {
    jsConsole.log([0, 1, 2]);
    assert('log: [\n  ' +
      '<span class="number">0</span>,\n  ' +
      '<span class="number">1</span>,\n  ' +
      '<span class="number">2</span>' +
      '\n]');
  });

  it('API: should log object', function () {
    jsConsole.log({key: 'value'});

    assert('log: {\n  ' +
      '<span class="key">key</span>: ' +
      '<span class="string">"value"</span>' +
      '\n}');
  });

  it('API: should log deeply', function () {
    jsConsole.logDeep({key: 'value'}, 10);

    assert('log: {\n  ' +
      '<span class="key">key</span>: ' +
      '<span class="string">"value"</span>' +
      '\n}');
  });

  it('API: should print recursive object', function () {
    var a = {};
    a.b = {a: a};

    expect(function () {
      jsConsole.log(a);
      jsConsole.getLogSource();
    }).not.to.throw();
  });

  it('API: should log function', function () {
    var codeToLog = function () {
      var testVariable = 'method code';
    };

    jsConsole.log(codeToLog);

    var funCode = 'function () {\n  var testVariable = \'method code\';\n}';
    assert('log: <span class="function">' + funCode + '</span>');
  });

  it('API: should log object method: function', function () {
    var codeToLog = {
      method: function () {
        var testVariable = 'method code';
      }
    };

    var funCode = 'function () {\n    var testVariable = \'method code\';\n  }';

    jsConsole.log(codeToLog);

    assert('log: {\n  ' +
      '<span class="key">method</span>: ' +
      '<span class="function">' + funCode + '</span>' +
      '\n}');
  });

  it('API: should log array item: function', function () {
    var codeToLog = [
      function () {
        var testVariable = 'method code';
      }
    ];

    var funCode = 'function () {\n    var testVariable = \'method code\';\n  }';

    jsConsole.log(codeToLog);

    assert('log: [\n  <span class="function">' + funCode + '</span>\n]');
  });

  it('API: should log array of objects', function () {
    var codeToLog = [
      {key1: 'value1'},
      {key2: 'value2'}
    ];

    jsConsole.log(codeToLog);

    assert('log: [\n  {\n    ' +
      '<span class="key">key1</span>: ' +
      '<span class="string">"value1"</span>\n  },\n  {\n    ' +
      '<span class="key">key2</span>: ' +
      '<span class="string">"value2"</span>' +
      '\n  }\n]');
  });

});
