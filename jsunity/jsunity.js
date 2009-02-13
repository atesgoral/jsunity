//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.2
 * http://jsunity.com/
 *
 * Copyright (c) 2009 Ates Goral
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function () {
    var defaultAssertions = {
        assertTrue: function (expr) {
            if (!expr) {
                throw "Expression does not evaluate to true";
            }
        },
        
        assertFalse: function (expr) {
            if (expr) {
                throw "Condition does not evaluate to false";
            }
        },
        
        assertEquals: function (expected, actual) {
            if (expected !== actual) {
                throw "Actual value does not match what's expected: [expected] "
                    + expected + ", [actual] " + actual;
            }
        },
        
        assertNotEquals: function (unexpected, actual) {
            if (unexpected === actual) {
                throw "Actual value matches the unexpected value: " + actual;
            }
        },
        
        assertNull: function (object) {
            if (object !== null) {
                throw "Object is not null";
            }
        },
        
        assertNotNull: function (object) {
            if (object === null) {
                throw "Object is null";
            }
        },
        
        assertUndefined: function (value) {
            if (value !== undefined) {
                throw "Value is not undefined";
            }
        },
        
        assertNotUndefined: function (value) {
            if (value === undefined) {
                throw "Value is undefined";
            }
        },
        
        assertNaN: function (value) {
            if (!isNaN(value)) {
                throw "Value is not NaN";
            }
        },
        
        assertNotNaN: function (value) {
            if (isNaN(value)) {
                throw "Value is NaN";
            }
        },
        
        fail: function () {
            throw "Test failed";
        }
    };

    var functionToStringHasComments = /PROBE/.test(function () {/*PROBE*/});

    function parseSuiteFunction(fn) {
        var s = fn.toString();

        var tokens =
            /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}\s*$/
            .exec(s);
        
        if (!tokens) {
            throw "Invalid function.";
        }

        var suite = parseSuiteString(tokens[2]);

        suite.name = tokens[1];

        return suite;
    }
    
    function $isNameFunctionTmp() {
        return typeof $name$ !== "undefined" && $name$ instanceof Function;
    }

    function isNameFunction(name) {
        eval($isNameFunctionTmp.toString().split("$name$").join(name))();
    }

    // items as strings or functions
    function parseSuiteArray(tests) {
        var scope = this;

        var suite = {
            tests: []
        };
        // filter items by isNameFunction

        return {
            tests: tests,
            setUp: scope.setUp instanceof Function,
            tearDown: scope.tearDown instanceof Function,
            runner: function () { scope[this.fn](); }
        };
    }

    function parseSuiteObject(obj) {
        var tests = [];

        for (var name in obj) {
            if (obj.hasOwnProperty(name) && obj[name] instanceof Function) {
                if (/^test/.test(name)) {
                    tests.push(name);
                }
            }
        }

        var suite = parseSuiteArray.call(obj, tests);

        suite.name = obj.name;

        return suite;
    }

    function parseSuiteString(str) {
        var suite = {
            tests: []
        };

        var fns = str.match(/function[\s\r\n]+[^(]+/g);

        if (fns) {
            for (var i = 0; i < fns.length; i++) {
                var name = fns[i].split(/function[\s\r\n]+/)[1];

                if (/^test/.test(name)) {
                    suite.tests.push(name);
                } else if (/^setUp|tearDown$/.test(name)) {
                    suite[name] = true;
                }
            }
        }

        suite.runner = new Function(
            "with (jsUnity.assertions) {"
            + str
            + "} if (eval(this.fn).call();");

        return suite;
    }

    function parseSuite(v) {
        if (v instanceof Function) {
            // functions inside function
            return parseSuiteFunction(v);
        } else if (v instanceof Array) {
            // array of test function names
            return parseSuiteArray(v);
        } else if (v instanceof Object) {
            // functions as properties
            return parseSuiteObject(v);
        } else if (typeof v === "string") {
            return parseSuiteString(v);
        } else {
            throw "Must be a function, array, object or string.";
        }
    }

    jsUnity = {
        globalScope: this,
        assertions: defaultAssertions,
        
        attachAssertions: function (scope) {
            scope = scope || this.globalScope; // Default to global scope

            for (var fn in jsUnity.assertions) {
                scope[fn] = jsUnity.assertions[fn];
            }
        },

        log: function () {},

        error: function (s) { this.log("[ERROR] " + s); },

        run: function () {
            try {
                var suite = parseSuite(arguments[0]);
            } catch (e) {
                this.error("Invalid test suite: " + e);
                return false;
            }

            var total = suite.tests.length;
            var passed = 0;

            this.log(total + " tests found");

            for (var i = 0; i < total; i++) {
                var test = suite.tests[i];

                try {
                    if (suite.setUp) {
                        suite.runner.call({ fn: "setUp" });
                    }
                    suite.runner.call({ fn: test });
                    if (suite.tearDown) {
                        suite.runner.call({ fn: "tearDown" });
                    }
                    passed++;
                    this.log("[PASSED] " + test);
                } catch (e) {
                    if (suite.tearDown) {
                        suite.runner.call({ fn: "tearDown" });
                    }
                    this.log("[FAILED] " + test + ": " + e);
                }
            }

            var failed = total - passed;

            this.log(passed + " tests passed");
            this.log(failed + " tests failed");

            return {
                name: suite.name,
                total: total,
                passed: passed,
                failed: failed
            }
        }
    };
})();
//%>
