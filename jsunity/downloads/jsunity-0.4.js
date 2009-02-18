//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.4
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
            /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}[\s\r\n]*$/
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
                && !probeOutside(token)) {
                    
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
        var suite = {
            suiteName: obj.suiteName,
            tests: []
        };

        for (var name in obj) {
            var fn = obj[name];
            
            if (obj.hasOwnProperty(name) && typeof fn === "function") {
                if (/^test/.test(name)) {
                    suite.tests.push({ name: name, fn: fn });
                } else if (/^setUp|tearDown$/.test(name)) {
                    suite[name] = fn;
                }
            }
        }
        
        return suite;
    }

    function parseSuite(v) {
        if (v instanceof Function) {
            return parseSuiteFunction(v);
        } else if (v instanceof Array) {
            return parseSuiteArray(v);
        } else if (v instanceof Object) {
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
            scope = scope || this.globalScope;

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

            this.log("Running " + (suite.suiteName || "unnamed test suite"));
            this.log(total + " tests found");

            for (var i = 0; i < total; i++) {
                var test = suite.tests[i];

                try {
                    suite.setUp && suite.setUp();
                    test.fn();
                    suite.tearDown && suite.tearDown();
                    passed++;
                    this.log("[PASSED] " + test.name);
                } catch (e) {
                    suite.tearDown && suite.tearDown();
                    this.log("[FAILED] " + test.name + ": " + e);
                }
            }

            var failed = total - passed;

            this.log(passed + " tests passed");
            this.log(failed + " tests failed");

            return {
                suiteName: suite.suiteName,
                total: total,
                passed: passed,
                failed: failed
            }
        }
    };
})();
//%>
