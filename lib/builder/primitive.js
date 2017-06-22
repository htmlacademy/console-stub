'use strict';

(function () {
  var PrimitiveBuilder = function (buffer) {
    this.buffer = buffer;
  };

  PrimitiveBuilder.prototype = {
    add: function (value) {
      if (this.filled) {
        this.buffer.shift();
        this.buffer.indent();
        this.buffer.unshift();
      }
      this.filled = true;

      var html;
      var type = typeof value;
      // https://developer.mozilla.org/en-US/docs/Glossary/Primitive
      switch (type) {
        case 'undefined':
          html = '<span class="undefined">undefined</span>';
          break;

        case 'number':
          if (window.isNaN(value)) {
            html = '<span class="NaN">NaN</span>';
          } else if ((value === Infinity || value === -Infinity)) {
            html = '<span class="number">' + (value === -Infinity ? '-' : '') + 'Infinity</span>';
          } else {
            html = '<span class="' + type + '">' + value + '</span>';
          }
          break;

        case 'string':
          html = '<span class="' + type + '">"' + value + '"</span>';
          break;

        case 'null':
        case 'boolean':
          html = '<span class="' + type + '">' + value + '</span>';
          break;
        case 'symbol':
          html = '<span class="' + type + '">' + value.toString() + '</span>';
          break;

        case 'object':
          if (value === null) {
            html = '<span class="null">' + value + '</span>';
            break;
          }

        default:
          throw new Error('Unknown primitive type: ' + type);
      }
      this.buffer.push(html);
    }
  };

  window.PrimitiveBuilder = PrimitiveBuilder;
})();
