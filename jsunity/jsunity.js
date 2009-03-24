//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.5
 * http://jsunity.com/
 *
 * Copyright (c) 2009 Ates Goral
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

jsUnity = (function () {
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
    
    function plural(cnt, unit) {
        return cnt + " " + unit + (cnt == 1 ? "" : "s");
    }

    function splitFunction(fn) {
        var tokens =
            /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}[\s\r\n]*$/
            .exec(fn);
        
        if (!tokens) {
            throw "Invalid function.";
        }
        
        return {
            name: tokens[1].length ? tokens[1] : undefined,
            body: tokens[2]
        };
    }
    
    var probeOutside = function () {
        try {
            return eval(
                [ "typeof ", " === \"function\" && ", "" ].join(arguments[0]));
        } catch (e) {
            return false;
        }
    };

    function parseSuiteString(str) {
        var obj = {};

        var probeInside = new Function(
            splitFunction(probeOutside).body + str);

        var tokenRe = /(\w+)/g; // todo: wiser regex
        var tokens;

        while ((tokens = tokenRe.exec(str))) {
            var token = tokens[1];
            var fn;
    
            if (!obj[token]
                && (fn = probeInside(token))
                && fn != probeOutside(token)) {

                obj[token] = fn;
            }
        }

        return parseSuiteObject(obj);
    }

    function parseSuiteFunction(fn) {
        var fnParts = splitFunction(fn);
        var suite = parseSuiteString(fnParts.body);

        suite.suiteName = fnParts.name;

        return suite;
    }

    function parseSuiteArray(tests) {
        var obj = {};

        for (var i = 0; i < tests.length; i++) {
            var item = tests[i];
            
            if (!obj[item]) {
                switch (typeof item) {
                case "function":
                    var fnParts = splitFunction(item);
                    obj[fnParts.name] = item;
                    break;
                case "string":
                    var fn;
                    
                    if (fn = probeOutside(item)) {
                        obj[item] = fn;
                    }
                }
            }
        }

        return parseSuiteObject(obj);
    }

    function parseSuiteObject(obj) {
        var suite = new jsUnity.TestSuite(obj.suiteName, obj);

        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                var fn = obj[name];

                if (typeof fn === "function") {
                    if (/^test/.test(name)) {
                        suite.tests.push({ name: name, fn: fn });
                    } else if (/^setUp|tearDown$/.test(name)) {
                        suite[name] = fn;
                    }
                }
            }
        }
        
        return suite;
    }

    return {
        TestSuite: function (suiteName, scope) {
            this.suiteName = suiteName;
            this.scope = scope;
            this.tests = [];
            this.setUp = undefined;
            this.tearDown = undefined;
        },

        TestResults: function () {
            this.suiteName = undefined;
            this.total = 0;
            this.passed = 0;
            this.failed = 0;
            this.duration = 0;
        },

        assertions: defaultAssertions,

        env: {
            defaultScope: this,

            getDate: function () {
                return new Date();
            }
        },
        
        attachAssertions: function (scope) {
            scope = scope || this.env.defaultScope;

            for (var fn in jsUnity.assertions) {
                scope[fn] = jsUnity.assertions[fn];
            }
        },

        log: function () {},

        error: function (s) { this.log("[ERROR] " + s); },

        compile: function (v) {
            if (v instanceof jsUnity.TestSuite) {
                return v;
            } else if (v instanceof Function) {
                return parseSuiteFunction(v);
            } else if (v instanceof Array) {
                return parseSuiteArray(v);
            } else if (v instanceof Object) {
                return parseSuiteObject(v);
            } else if (typeof v === "string") {
                return parseSuiteString(v);
            } else {
                throw "Argument must be a function, array, object, string or "
                    + "TestSuite instance.";
            }
        },

        run: function () {
            var results = new jsUnity.TestResults();

            var suiteNames = [];
            var start = jsUnity.env.getDate();

            for (var i = 0; i < arguments.length; i++) {
                try {
                    var suite = jsUnity.compile(arguments[i]);
                } catch (e) {
                    this.error("Invalid test suite: " + e);
                    return false;
                }

                var cnt = suite.tests.length;

                this.log("Running "
                    + (suite.suiteName || "unnamed test suite"));
                this.log(plural(cnt, "test") + " found");
    
                suiteNames.push(suite.suiteName);
                results.total += cnt;

                for (var j = 0; j < cnt; j++) {
                    var test = suite.tests[j];
    
                    try {
                        suite.setUp && suite.setUp();
                        test.fn.call(suite.scope);
                        suite.tearDown && suite.tearDown();

                        results.passed++;

                        this.log("[PASSED] " + test.name);
                    } catch (e) {
                        suite.tearDown && suite.tearDown();

                        this.log("[FAILED] " + test.name + ": " + e);
                    }
                }
            }

            results.suiteName = suiteNames.join(",");
            results.failed = results.total - results.passed;
            results.duration = jsUnity.env.getDate() - start;

            this.log(plural(results.passed, "test") + " passed");
            this.log(plural(results.failed, "test") + " failed");
            this.log(plural(results.duration, "millisecond") + " elapsed");

            return results;
        }
    };
})();
//%>
