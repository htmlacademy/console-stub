'use strict';

(function (global) {

  var MAX_DEPTH_LEVEL = 5;
  var STRIP_SYMBOL = '...';

  var MAX_BUFFER_SIZE = 1024 * 10;

  var printError = function (error) {
    if (error instanceof Error) {
      error = error.message;
    }
    return '<span class="error">' + error.toString() + '</span>';
  };

  var printValue = function (value, buffer) {
    var builder = new window.PrimitiveBuilder(buffer);
    builder.add(value);
  };

  var printArrayLike = function (array, buffer) {
    var builder = new window.ArrayBuilder(buffer);
    builder.begin();
    for (var i = 0; i < array.length; i++) {
      builder.newItem().add(print(array[i], buffer));
    }
    builder.end();
  };

  var printPlainObject = function (value, buffer) {
    var builder = new window.HtmlObjectBuilder(buffer);
    builder.begin();
    for (var key in value) {
      builder.key(key).value(print(value[key], buffer));
    }
    builder.end();
  };

  var printObject = function (value, buffer) {
    if (Array.isArray(value)) {
      return printArrayLike(value, buffer);
    }
    return printPlainObject(value, buffer);
  };

  function printFunction(value, buffer) {
    var builder = new window.HtmlFunctionBuilder(buffer);
    var parsed = window.functionParseUtils.parse(value.toString());
    builder.begin().
      params(parsed.params).
      body(parsed.lines).
      end();
  }

  var print = function (value, buffer) {
    buffer = buffer || new window.StreamBuffer();

    if (buffer.getIndentLevel() >= MAX_DEPTH_LEVEL) {
      value = STRIP_SYMBOL;
    }

    if (buffer.buffer.length > MAX_BUFFER_SIZE) {
      // Do not insert if buffer too big
      return buffer;
    }

    var type = typeof value;
    switch (type) {
      case 'function':
        printFunction(value, buffer);
        break;

      case 'object':
        if (value !== null) {
          printObject(value, buffer);
          break;
        }

      default:
        printValue(value, buffer);
        break;
    }

    return buffer;
  };

  var printEntries = function (entries, error) {
    /* TODO: add Time stamp */
    var html = 'log: ';

    if (error) {
      html += printError(entries[0]);

    } else {
      entries.forEach(function (code, i) {

        if (code instanceof Error) {
          html += printError(entries[0]);
        } else {
          html += print(code).print();
        }


        if (i < entries.length - 1) {
          html += '\t';
        }

      });
    }

    return html + '\n\n\n';
  };

  /**
   * Init Console
   *
   * @param {HTMLElement} consoleContainer
   * @return {{log: log}}
   */
  var jsConsoleInit = function (consoleContainer) {
    consoleContainer.classList.add('console-container');
    consoleContainer.innerHTML = '<pre class="console-container__code"></pre>';

    var codeContainer = consoleContainer.querySelector('.console-container__code');

    if (!codeContainer) {
      throw Error('Console is not inited!');
    }

    // Public interface
    var logger = {};

    /**
     * Show formatted & highlighted code into `consoleContainer`
     */
    logger.log = function () {
      var args = Array.prototype.slice.call(arguments);

      codeContainer.innerHTML += printEntries(args);

      if (typeof logger.onlog === 'function') {
        logger.onlog(args);
      }
    };

    logger.error = function (errorMessage) {
      codeContainer.innerHTML += printEntries([errorMessage], true);
    };

    logger.clean = function () {
      codeContainer.innerHTML = '';
    };

    logger.getLogSource = function () {
      return consoleContainer.innerHTML;
    };

    logger.logDeep = function (obj, level) {
      level = level || MAX_DEPTH_LEVEL;
      var oldLevel = MAX_DEPTH_LEVEL;
      try {
        MAX_DEPTH_LEVEL = level;
        logger.log(obj);
      } finally {
        MAX_DEPTH_LEVEL = oldLevel;
      }
    };

    logger.extend = function (consoleObject) {
      consoleObject.log = logger.log;
      consoleObject.info = logger.log;

      consoleObject.error = logger.error;
      consoleObject.warn = logger.error;

      consoleObject.dir = logger.logDeep;

      return consoleObject;
    };

    return logger;
  };

  global.jsConsoleInit = jsConsoleInit;

})(window);
