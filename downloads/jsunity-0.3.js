//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.3
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

    function splitFunction(fn) {
        var tokens =
            /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}\s*$/
            .exec(fn);
        
        if (!tokens) {
            throw "Invalid function.";
        }
        
        return {
            name: tokens[1],
            body: tokens[2]
        };
    }
    
    var probeOutside = function () {
        return eval(
            "typeof $fn$ !== \"undefined\" && $fn$ instanceof Function"
            .split("$fn$")
            .join(arguments[0]));
    };

    function parseSuiteString(str) {
        var suite = {
            tests: []
        };

        var probeInside = new Function(
            splitFunction(probeOutside).body + str);
        
        var tokenRe = /(\w+)/g;
        var tokens;
        var tests = {};
        
        while ((tokens = tokenRe.exec(str))) {
            var token = tokens[1];
    
            try {
                if (probeInside(token) && !probeOutside(token)) {
                    if (/^test/.test(token)) {
                        if (!tests[token]) {
                            suite.tests.push(token);
                            tests[token] = true;
                        }
                    } else if (/^setUp|tearDown$/.test(token)) {
                        suite[token] = true;
                    }
                }
            } catch (e) {
                // ignore token
            }
        }

        suite.runner = new Function(
            "with (jsUnity.assertions) {"
            + str
            + "}"
            + "eval(this.fn).call();");

        return suite;
    }

    function parseSuiteFunction(fn) {
        var fnParts = splitFunction(fn);
        var suite = parseSuiteString(fnParts.body);

        suite.name = fnParts.name;

        return suite;
    }

    // items as strings or functions
    function parseSuiteArray(tests) {
        var scope = this;

        var suite = {
            tests: []
        };
        // filter items by probeOutside?

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
