// Be SSJS-module-friendly; populate exports if exists, otherwise define a new
// global object.
assert = typeof exports === "undefined" ? {} : exports;

assert.not = {};
    
// AssertionError constructor that is also callable as a function
assert.AssertionError = function (message, actual, expected) {
    if (this instanceof assert.AssertionError) {
        this.message = message;
        this.actual = actual;
        this.expected = expected;
    } else {
        return new assert.AssertionError(message, actual, expected);
    }
};

assert.error = function (block, message) {
    try {
        block();
    } catch (e) {
        return;
    }

    throw new assert.AssertionError(message, block);
};

assert.fail = function (message) {
    throw new assert.AssertionError(message);
};

(function (name, checkFn) {
    var scope = assert;
    var failVal = true;
    
    do {
        scope[name] = function (fv) {
            return function () {
                if (checkFn.apply(this, arguments) === fv) {
                    throw assert.AssertionError.apply(null,
                        Array.prototype.slice.call(arguments).reverse());
                }
            };
        }(failVal = !failVal);
    } while (scope = scope.not);
    
    return arguments.callee;
})
("is", function () { return arguments[0] === arguments[1]; })
("isTrue", function () { return arguments[0] === true; })
("isFalse", function () { return arguments[0] === false; })
("match", function () { return arguments[0].test(arguments[1]); })
("typeOf", function () { return typeof arguments[1] === arguments[0]; })
("instanceOf", function () { return arguments[0] instanceof arguments[1]; })
("isNull", function () { return arguments[0] === null; })
("isUndefined", function () { return arguments[0] === undefined; })
("isNaN", function () { return isNaN(arguments[0]); })
("eq", function () { return equiv(arguments[0], arguments[1]); });
