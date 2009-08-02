//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.6
 * http://jsunity.com/
 *
 * Copyright (c) 2009 Ates Goral
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

jsUnity = (function () {
    function empty() {}

    function fmt(str) {
        var a = Array.prototype.slice.call(arguments, 1);
        return str.replace(/\{(\d+)\}/g, function (s, i) { return a[i]; });
    }

    function bind(fn, scope) {
        return fn
            ? function () {
                fn.apply(scope, arguments);
            }
            : empty;
    }
    
    function plural(cnt, unit) {
        return cnt + " " + unit + (cnt == 1 ? "" : "s");
    }

    function splitFunction(fn) {
        var tokens =
            /^[\s\r\n]*function[\s\r\n]*([^\(\s\r\n]*?)[\s\r\n]*\([^\)\s\r\n]*\)[\s\r\n]*\{((?:[^}]*\}?)+)\}[\s\r\n]*$/
            .exec(fn);
        
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

    var logLevels = {
        error: 1,
        warn: 2,
        info: 3,
        debug: 4
    };
    
    var logStream = {
        write: empty,
        level: "info"
    };

    for (var level in logLevels) {
        logStream[level] = (function () {
            var strLevel = level;
            var numLevel = logLevels[level];

            return function (s) {
                if (numLevel >= logLevels[this.level] ) {
                    this.write(s, strLevel);
                }
            };
        })();
    }

    var tapStream = {
        write: empty
    };

    var resultsStream = {
        begin: empty,
        pass: empty,
        fail: empty,
        end: empty
    };

    function resultsBegin(total, suiteName) {
        resultsStream.begin.apply(this, arguments);
        
        tapStream.write("TAP version 13");
        tapStream.write("# " + suiteName);
        tapStream.write("1.." + total);

        logStream.info("Running "
            + (suiteName || "unnamed test suite"));
        logStream.info(plural(total, "test") + " found");
    }

    function resultsPass(index, testName) {
        resultsStream.pass.apply(this, arguments);

        tapStream.write(fmt("ok {0} - {1}", index, testName));
        logStream.info("[PASSED] " + testName);
    }

    function resultsFail(index, testName, error) {
        resultsStream.fail.apply(this, arguments);

        tapStream.write(fmt("not ok {0} - {1}", index, testName));
        tapStream.write("  ---");
        tapStream.write("  " + error.message);
        tapStream.write("  ...");
        logStream.info(fmt("[FAILED] {0}: {1}", testName, error.message));
    }

    function resultsEnd(passed, failed, duration) {
        resultsStream.end.apply(this, arguments);

        logStream.info(plural(passed, "test") + " passed");
        logStream.info(plural(failed, "test") + " failed");
        logStream.info(plural(duration, "millisecond") + " elapsed");
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
            this.tests = [];
        },

        env: {
            getDate: function () {
                return new Date();
            }
        },

        results: resultsStream,
        log: logStream,
        tap: tapStream,

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

        step: function () {
            //return runtime;
        },
        
        run: function () {
            var results = new jsUnity.TestResults();

            var suiteNames = [];
            var start = jsUnity.env.getDate();

            for (var i = 0; i < arguments.length; i++) {
                try {
                    var suite = jsUnity.compile(arguments[i]);
                } catch (e) {
                    this.log.error("Invalid test suite: " + e);
                    return false;
                }

                var cnt = suite.tests.length;

                resultsBegin(cnt, suite.suiteName);
                // when running multiple suites, report counts at end?
    
                suiteNames.push(suite.suiteName);
                results.total += cnt;
                
                var runtime = {
                    //suite: suite
                };
                
                for (var util in { "setUp": 1, "tearDown": 1 }) {
                    runtime[util] = bind(suite[util], suite.scope); 
                }

                for (var j = 0; j < cnt; j++) {
                    var test = suite.tests[j];
                    var testOutcome = {
                        name: test.name
                    };
                    var testStart = jsUnity.env.getDate();
    
                    var tearDownCalled = false;
                    
                    try {
                        runtime.setUp(test.name);
                        bind(test.fn, suite.scope)(test.name);
                        tearDownCalled = true;
                        runtime.tearDown(test.name);

                        resultsPass(j + 1, test.name);

                        results.passed++;
                        testOutcome.passed = true;
                    } catch (e) {
                        if (!tearDownCalled) {
                            runtime.tearDown(test.name);
                        }

                        resultsFail(j + 1, test.name, e);

                        testOutcome.passed = false;
                        testOutcome.error = e;
                    }

                    testOutcome.duration = jsUnity.env.getDate() - testStart;
                    results.tests.push(testOutcome);
                }
            }

            results.suiteName = suiteNames.join(",");
            results.failed = results.total - results.passed;
            results.duration = jsUnity.env.getDate() - start;

            resultsEnd(results.passed, results.failed, results.duration);

            return results;
        }
    };
})();
//%>
