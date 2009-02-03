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
        /**
         * Assert that the given Boolean expression evaluates to
         * <code>true</code>
         *
         * @param expr The Boolean expression
         */
        assertTrue: function (expr) {
            if (!expr) {
                throw "Expression does not evaluate to true";
            }
        },
        
        /**
         * Assert that the given Boolean expression evaluates to
         * <code>false</code>
         *
         * @param expr The Boolean expression
         */
        assertFalse: function (expr) {
            if (expr) {
                throw "Condition does not evaluate to false";
            }
        },
        
        /**
         * Assert that the given value matches what's expected
         *
         * @param expected The expected value
         * @param actual The actual given value
         */
        assertEquals: function (expected, actual) {
            if (expected !== actual) {
                throw "Actual value does not match what's expected: [expected] "
                    + expected + ", [actual] " + actual;
            }
        },
        
        /**
         * Assert that the given value doesn't match the given unexpected value
         *
         * @param unexpected The unexpected value
         * @param actual The actual given value
         */
        assertNotEquals: function (unexpected, actual) {
            if (unexpected === actual) {
                throw "Actual value matches the unexpected value: " + actual;
            }
        },
        
        /**
         * Assert that the given object is <code>null</code>
         *
         * @param object The given object
         */
        assertNull: function (object) {
            if (object !== null) {
                throw "Object is not null";
            }
        },
        
        /**
         * Assert that the given object is not <code>null</code>
         *
         * @param object The given object
         */
        assertNotNull: function (object) {
            if (object === null) {
                throw "Object is null";
            }
        },
        
        /**
         * Assert that the given object is <code>undefined</code>
         *
         * @param object The given object
         */
        assertUndefined: function (value) {
            if (value !== undefined) {
                throw "Value is not undefined";
            }
        },
        
        /**
         * Assert that the given object is not <code>undefined</code>
         *
         * @param object The given object
         */
        assertNotUndefined: function (value) {
            if (value === undefined) {
                throw "Value is undefined";
            }
        },
        
        /**
         * Assert that the given object is <code>NaN</code>
         *
         * @param object The given object
         */
        assertNaN: function (value) {
            if (!isNaN(value)) {
                throw "Value is not NaN";
            }
        },
        
        /**
         * Assert that the given object is not <code>NaN</code>
         *
         * @param object The given object
         */
        assertNotNaN: function (value) {
            if (isNaN(value)) {
                throw "Value is NaN";
            }
        },
        
        /**
         * Fail the test by throwing an exception
         */
        fail: function () {
            throw "Test failed";
        }
    };

    function parseSuiteFunction(suite) {
        var tokens = /^\s*function\s*([^( \t]*?)\s*\(.*?\)\s*\{((?:[^}]*\}?)+)\}\s*$/.exec(
            suite.toString().split(/[\r\n]/).join(" "));

        if (!tokens) {
            throw "Invalid function.";
        }

        var runnerBody = tokens[2];

        var ret = {
            runner: new Function(
                "with (jsUnity.assertions) {"
                + runnerBody
                + "} eval(this.fn).call();"),
            name: tokens[1],
            tests: []
        };

        var fns = runnerBody.match(/function\s+[^(]+/g);

        if (fns) {
            for (var i = 0; i < fns.length; i++) {
                var tokens = /\s(.+)$/.exec(fns[i]);

                if (tokens) {
                    var name = tokens[1];

                    if (/^test/.test(name)) {
                        ret.tests.push(name);
                    } else if (/^setUp|tearDown$/.test(name)) {
                        ret[name] = true;
                    }
                }
            }
        }

        return ret;
    }

    function parseSuite(suite) {
        if (suite instanceof Function) {
            // functions inside function
            return parseSuiteFunction(suite);
        } else if (suite instanceof Array) {
            // array of test function names
            throw "Not implemented";
        } else if (suite instanceof Object) {
            // functions as properties
            throw "Not implemented";
        } else if (typeof suite === "string") {
            // source code of functions
            throw "Not implemented";
        } else {
            throw "Must be a function, array, object or string.";
        }
    }

    jsUnity = {
        assertions: defaultAssertions,
        
        attachAssertions: function (scope) {
            scope = scope || this; // Default to current scope

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