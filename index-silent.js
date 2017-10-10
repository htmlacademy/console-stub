"use strict";

(function() {
    var ArrayBuilder = function(buffer) {
        this.buffer = buffer;
    };
    ArrayBuilder.prototype = {
        begin: function() {
            this.buffer.push("[").shift();
            return this;
        },
        newItem: function() {
            if (this.filled) {
                this.buffer.push(",");
            }
            this.buffer.newline().indent();
            this.filled = true;
            return this;
        },
        add: function(value) {
            this.buffer.push(value instanceof ArrayBuilder ? value.buffer : value);
            return this;
        },
        end: function() {
            this.buffer.unshift();
            if (this.filled) {
                this.buffer.newline().indent();
            }
            this.buffer.push("]");
            return this;
        }
    };
    window.ArrayBuilder = ArrayBuilder;
})();

"use strict";

(function() {
    var INDENT_SYMBOL = "  ";
    var StreamBuffer = function() {
        this.buffer = [];
        this._indent = [];
    };
    StreamBuffer.prototype = {
        indent: function() {
            this.buffer.push(this._indent.join(""));
            return this;
        },
        shift: function() {
            this._indent.push(INDENT_SYMBOL);
            return this;
        },
        unshift: function() {
            this._indent.pop();
            return this;
        },
        getIndentLevel: function() {
            return this._indent.length;
        },
        push: function(entry) {
            if (this === entry) {
                return entry;
            } else {
                this.pushValue(entry);
            }
            return this;
        },
        pushValue: function(value) {
            this.buffer.push(value);
            return this;
        },
        newline: function() {
            this.buffer.push("\n");
            return this;
        },
        print: function() {
            return this.buffer.join("");
        }
    };
    window.StreamBuffer = StreamBuffer;
})();

"use strict";

(function() {
    var parseParams = function(funString) {
        var paramsStart = funString.indexOf("(");
        var paramsEnd = funString.indexOf(")");
        var paramsContent = funString.substring(paramsStart + 1, paramsEnd).trim();
        if (!paramsContent) {
            return [];
        }
        return paramsContent.split(",").map(function(it) {
            return it.trim();
        });
    };
    var parseBody = function(funString) {
        var bodyStart = funString.indexOf("{");
        var bodyEnd = funString.indexOf("}");
        var bodyContent = funString.substring(bodyStart + 1, bodyEnd).trim();
        if (!bodyContent) {
            return [];
        }
        return bodyContent.split("\n").map(function(it) {
            return it.trim();
        });
    };
    var parse = function(funString) {
        return {
            params: parseParams(funString),
            lines: parseBody(funString)
        };
    };
    window.functionParseUtils = {
        parse: parse,
        parseBody: parseBody,
        parseParams: parseParams
    };
})();

"use strict";

(function() {
    var FunctionBuilder = function(buffer) {
        this.buffer = buffer;
    };
    FunctionBuilder.prototype = {
        begin: function() {
            this.buffer.push("function (");
            return this;
        },
        params: function(params) {
            this.buffer.push(params.join(","));
            return this;
        },
        body: function(lines) {
            this.buffer.push(") {");
            this.buffer.shift();
            var _this = this;
            lines.forEach(function(it) {
                _this.bodyLine(it);
            });
            return this;
        },
        bodyLine: function(line) {
            this.filled = true;
            this.buffer.newline().indent().push(line);
            return this;
        },
        end: function() {
            this.buffer.unshift();
            if (this.filled) {
                this.buffer.newline().indent();
            }
            this.buffer.push("}");
            return this;
        }
    };
    var HtmlFunctionBuilder = function(buffer) {
        FunctionBuilder.call(this, buffer);
    };
    HtmlFunctionBuilder.prototype = Object.create(FunctionBuilder.prototype);
    HtmlFunctionBuilder.prototype.begin = function() {
        this.buffer.push('<span class="function">');
        return FunctionBuilder.prototype.begin.call(this);
    };
    HtmlFunctionBuilder.prototype.end = function() {
        FunctionBuilder.prototype.end.call(this);
        this.buffer.push("</span>");
        return this;
    };
    window.FunctionBuilder = FunctionBuilder;
    window.HtmlFunctionBuilder = HtmlFunctionBuilder;
})();

"use strict";

(function() {
    var ObjectBuilder = function(buffer) {
        this.buffer = buffer;
    };
    ObjectBuilder.prototype = {
        begin: function() {
            this.buffer.push("{").shift();
            return this;
        },
        _printKey: function(key) {
            this.buffer.push(key.toString());
            return this;
        },
        key: function(key) {
            if (this.filled) {
                this.buffer.push(",");
            }
            this.buffer.newline().indent();
            this.filled = true;
            this._printKey(key);
            this.buffer.push(": ");
            return this;
        },
        value: function(value) {
            this.buffer.push(value instanceof ObjectBuilder ? value.buffer : value);
            return this;
        },
        add: function(key, value) {
            return this.key(key).value(value);
        },
        end: function() {
            this.buffer.unshift();
            if (this.filled) {
                this.buffer.newline().indent();
            }
            this.buffer.push("}");
            return this;
        }
    };
    var HtmlObjectBuilder = function(buffer) {
        ObjectBuilder.call(this, buffer);
    };
    HtmlObjectBuilder.prototype = Object.create(ObjectBuilder.prototype);
    HtmlObjectBuilder.prototype._printKey = function(key) {
        this.buffer.push('<span class="key">').push(key.toString()).push("</span>");
        return this;
    };
    window.ObjectBuilder = ObjectBuilder;
    window.HtmlObjectBuilder = HtmlObjectBuilder;
})();

"use strict";

(function() {
    var PrimitiveBuilder = function(buffer) {
        this.buffer = buffer;
    };
    PrimitiveBuilder.prototype = {
        add: function(value) {
            if (this.filled) {
                this.buffer.shift();
                this.buffer.indent();
                this.buffer.unshift();
            }
            this.filled = true;
            var html;
            var type = typeof value;
            switch (type) {
              case "undefined":
                html = '<span class="undefined">undefined</span>';
                break;

              case "number":
                if (window.isNaN(value)) {
                    html = '<span class="NaN">NaN</span>';
                } else if (value === Infinity || value === -Infinity) {
                    html = '<span class="number">' + (value === -Infinity ? "-" : "") + "Infinity</span>";
                } else {
                    html = '<span class="' + type + '">' + value + "</span>";
                }
                break;

              case "string":
                html = '<span class="' + type + '">"' + value + '"</span>';
                break;

              case "null":
              case "boolean":
                html = '<span class="' + type + '">' + value + "</span>";
                break;

              case "symbol":
                html = '<span class="' + type + '">' + value.toString() + "</span>";
                break;

              case "object":
                if (value === null) {
                    html = '<span class="null">' + value + "</span>";
                    break;
                }

              default:
                throw new Error("Unknown primitive type: " + type);
            }
            this.buffer.push(html);
        }
    };
    window.PrimitiveBuilder = PrimitiveBuilder;
})();

"use strict";

(function(global) {
    var MAX_DEPTH_LEVEL = 5;
    var STRIP_SYMBOL = "...";
    var MAX_BUFFER_SIZE = 1024 * 10;
    var printError = function(error) {
        if (error instanceof Error) {
            error = error.message;
        }
        return '<span class="error">' + error.toString() + "</span>";
    };
    var printValue = function(value, buffer) {
        var builder = new window.PrimitiveBuilder(buffer);
        builder.add(value);
    };
    var printArrayLike = function(array, buffer) {
        var builder = new window.ArrayBuilder(buffer);
        builder.begin();
        for (var i = 0; i < array.length; i++) {
            builder.newItem().add(print(array[i], buffer));
        }
        builder.end();
    };
    var printPlainObject = function(value, buffer) {
        var builder = new window.HtmlObjectBuilder(buffer);
        builder.begin();
        for (var key in value) {
            builder.key(key).value(print(value[key], buffer));
        }
        builder.end();
    };
    var printObject = function(value, buffer) {
        if (Array.isArray(value)) {
            return printArrayLike(value, buffer);
        }
        return printPlainObject(value, buffer);
    };
    function printFunction(value, buffer) {
        var builder = new window.HtmlFunctionBuilder(buffer);
        var parsed = window.functionParseUtils.parse(value.toString());
        builder.begin().params(parsed.params).body(parsed.lines).end();
    }
    var print = function(value, buffer) {
        buffer = buffer || new window.StreamBuffer();
        if (buffer.getIndentLevel() >= MAX_DEPTH_LEVEL) {
            value = STRIP_SYMBOL;
        }
        if (buffer.buffer.length > MAX_BUFFER_SIZE) {
            return buffer;
        }
        var type = typeof value;
        switch (type) {
          case "function":
            printFunction(value, buffer);
            break;

          case "object":
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
    var printEntries = function(entries, error) {
        var html = "log: ";
        if (error) {
            html += printError(entries[0]);
        } else {
            entries.forEach(function(code, i) {
                if (code instanceof Error) {
                    html += printError(entries[0]);
                } else {
                    html += print(code).print();
                }
                if (i < entries.length - 1) {
                    html += "\t";
                }
            });
        }
        return html + "\n\n\n";
    };
    var jsConsoleInit = function(consoleContainer) {
        consoleContainer.classList.add("console-container");
        consoleContainer.innerHTML = '<pre class="console-container__code"></pre>';
        var codeContainer = consoleContainer.querySelector(".console-container__code");
        if (!codeContainer) {
            throw Error("Console is not inited!");
        }
        var logger = {};
        logger.log = function() {
            var args = Array.prototype.slice.call(arguments);
            codeContainer.innerHTML += printEntries(args);
            if (typeof logger.onlog === "function") {
                logger.onlog(args);
            }
        };
        logger.error = function(errorMessage) {
            codeContainer.innerHTML += printEntries([ errorMessage ], true);
        };
        logger.clean = function() {
            codeContainer.innerHTML = "";
        };
        logger.getLogSource = function() {
            return consoleContainer.innerHTML;
        };
        logger.logDeep = function(obj, level) {
            level = level || MAX_DEPTH_LEVEL;
            var oldLevel = MAX_DEPTH_LEVEL;
            try {
                MAX_DEPTH_LEVEL = level;
                logger.log(obj);
            } finally {
                MAX_DEPTH_LEVEL = oldLevel;
            }
        };
        logger.extend = function(consoleObject) {
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

"use strict";

(function(global) {
    var CSS_URL = "//htmlacademy.github.io/demo-console/index.css";
    var errors = [];
    var collectErr = function() {
        errors.push(arguments);
    };
    global.onerror = collectErr;
    global.console.warn = collectErr;
    global.console.error = collectErr;
    var messages = [];
    var collectMsg = function() {
        messages.push(arguments);
    };
    global.console.info = collectMsg;
    global.console.log = collectMsg;
    global.console.debug = collectMsg;
    var init = function() {
        var div = global.document.createElement("div");
        var jsConsole = global.jsConsoleInit(div);
        global.document.body.appendChild(div);
        jsConsole.extend(global.console);
        errors.forEach(function(args) {
            jsConsole.error.apply(jsConsole, args);
        });
        messages.forEach(function(args) {
            jsConsole.log.apply(jsConsole, args);
        });
        global.onerror = function(error) {
            jsConsole.error(error);
        };
    };
    var loadStyles = function() {
        var link = global.document.createElement("link");
        link.rel = "stylesheet";
        link.href = CSS_URL;
        global.document.head.appendChild(link);
    };
    window.addEventListener("DOMContentLoaded", function() {
        init();
        loadStyles();
    });
})(window);