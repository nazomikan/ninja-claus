/*!
 * Copyright (c) 2013 nazomikan
 * https://github.com/nazomikan/NamespaceJS
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function (name, global, definition) {
  if (typeof module !== 'undefined') {
    module.exports = definition();
  } else if (typeof require !== 'undefined' && typeof require.amd === 'object') {
    define(definition);
  } else {
    global[name] = definition();
  }
})('Namespace', this, function () {
  var arrayProto = Array.prototype
    , slice = arrayProto.slice
    , global = this
    , local = {}
    ;

  function Namespace(namespaceStr, context) {
    var spaces = namespaceStr.split('.')
      , name = spaces.pop()
      , context = context || global
      ;

    this.namespace = local.createNamespace(spaces, context);
    this.name = name;
  }

  Namespace.create = function () {
    var namespace = createObject(Namespace.prototype)
      , args = slice.call(arguments)
      ;

    Namespace.apply(namespace, args);
    return namespace;
  };

  Namespace.prototype.means = function (entity) {
    var namespace = this.namespace
      , name = this.name
      ;

    namespace[name] = entity;
  };

  local.createNamespace = function (spaces, context) {
    var space
      , i
      , l
      ;

    for (i = 0, l = spaces.length; i < l; i++) {
      space = spaces[i];
      if (isPrimitive(context[space])) {
        throw new Error('namespace ' + spaces.join('.') + ' already exist and '+ space +' is primitive');
      }
      context[space] = (context[space] == null) ? {} : context[space];
      context = context[space];
    }

    return context;
  };

  function createObject(obj) {
    if (Object.create) {
      return Object.create(obj);
    }

    if (arguments.length > 1) {
      throw new Error('Object.create implementation only accepts the first parameter.');
    }
    function F() {}
    F.prototype = obj;
    return new F();
  }

  function isPrimitive(value) {
    var result
      ;

    switch(typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        result = true;
        break;
      default:
        result = false;
    }

    return result;
  }

  return Namespace;
});
