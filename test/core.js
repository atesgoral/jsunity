//<%
function setUp() { global.setUps++; }
function tearDown() { global.tearDowns++; }
function testGlobalPass1() {}
function testGlobalPass2() {}
function testGlobalFail() { throw "fail"; }

var global = {
    setUp: setUp,
    tearDown: tearDown
};

function checkAssertions(scope) {
    for (var fn in jsUnity.assertions) {
        assert.is(jsUnity.assertions[fn], scope[fn]);
    }
}

function coreTestSuite() {
    function checkResults(results, suiteName) {
        assert.instanceOf(jsUnity.TestResults, results);
        assert.is(suiteName || "", results.suiteName);
        assert.is(3, results.total);
        assert.is(2, results.passed);
        assert.is(1, results.failed);

        assert.is(3, global.setUps);
        assert.is(3, global.tearDowns);
    }

    function setUp() {
        global.setUps = 0;
        global.tearDowns = 0;
        
        var sandbox = {
            dateGetter: jsUnity.env.getDate,
            logWriter: jsUnity.log.write,
            tapWriter: jsUnity.tap.write,
            logData: [],
            tapData: [],
        };

        jsUnity.env.getDate = function () { return 0; }
        jsUnity.log.write = function () {
            sandbox.logData.push(Array.prototype.slice.call(arguments, 0));
        };
        jsUnity.tap.write = function () {
            sandbox.tapData.push(arguments[0]);
        };
        
        this.sandbox = sandbox;
    }

    function tearDown() {
        jsUnity.env.getDate = this.sandbox.dateGetter;
        jsUnity.log.write = this.sandbox.logWriter;
        jsUnity.tap.write = this.sandbox.tapWriter;
    }

    function testSetUpTearDownCalledPassing() {
        var calls = [];
        
        jsUnity.run({
            setUp: function () {
                calls.push("setUp");
            },
            tearDown: function () {
                calls.push("tearDown");
            },
            testPassing: function () {
                calls.push("testPassing");
            }
        });
        
        assert.eq([ "setUp", "testPassing", "tearDown" ], calls);
    }

    function testSetUpTearDownCalledFailing() {
        var calls = [];
        
        jsUnity.run({
            setUp: function () {
                calls.push("setUp");
            },
            tearDown: function () {
                calls.push("tearDown");
            },
            testFailing: function () {
                calls.push("testFailing");
                assert.fail();
            }
        });
        
        assert.eq([ "setUp", "testFailing", "tearDown" ], calls);
    }

    function testArgumentsPassing() {
        var calls = [];
        
        jsUnity.run({
            setUp: function (testName) {
                calls.push(testName);
            },
            tearDown: function (testName) {
                calls.push(testName);
            },
            testPassing: function (testName) {
                calls.push(testName);
            }
        });
        
        assert.eq([ "testPassing", "testPassing", "testPassing" ], calls);
    }

    function testArgumentsFailing() {
        var calls = [];
        
        jsUnity.run({
            setUp: function (testName) {
                calls.push(testName);
            },
            tearDown: function (testName) {
                calls.push(testName);
            },
            testFailing: function (testName) {
                calls.push(testName);
                assert.fail();
            }
        });
        
        assert.eq([ "testFailing", "testFailing", "testFailing" ], calls);
    }

    function testLogCalled() {
        var results = jsUnity.run(function () {});

        assert.eq(
            [
                [ "Running unnamed test suite", "info" ],
                [ "0 tests found", "info" ],
                [ "0 tests passed", "info" ],
                [ "0 tests failed", "info" ],
                [ "0 milliseconds elapsed", "info" ]
            ],
            this.sandbox.logData);
    }

    function testErrorCalled() {
        var hijackedError = jsUnity.log.error;

        var errorCalled = false;
        
        jsUnity.log.error = function () { errorCalled = true; };
        
        var results = jsUnity.run(false);

        jsUnity.log.error = hijackedError;

        assert.is(false, results);
        assert.isTrue(errorCalled);
    }

    function testCompileTestSuite() {
        var scope = {};
        function testDummy() {}
        
        var origTestSuite = new jsUnity.TestSuite("TestSuite", scope);
        origTestSuite.setUp = global.setUp;
        origTestSuite.tearDown = global.tearDown;
        origTestSuite.tests.push({ name: "testDummy", fn: testDummy });
        
        var testSuite = jsUnity.compile(origTestSuite);
        
        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.is("TestSuite", testSuite.suiteName);
        assert.is(scope, testSuite.scope);
        assert.is(global.setUp, testSuite.setUp);
        assert.is(global.tearDown, testSuite.tearDown);
        assert.is("testDummy", testSuite.tests[0].name);
        assert.is(testDummy, testSuite.tests[0].fn);
    }

    function testCompileNamedFunction() {
        function namedTestSuite() {
            function setUp() { return 1; }
            function tearDown() { return 2; }
            function testDummy() { return 3; }
            
            return {
                setUp: setUp,
                tearDown: tearDown,
                testDummy: testDummy
            };
        }
        
        var internals = namedTestSuite();
        var testSuite = jsUnity.compile(namedTestSuite);

        assert.instanceOf(jsUnity.TestSuite, testSuite, "compiled test suite is instance of jsUnity.TestSuite");
        assert.is("namedTestSuite", testSuite.suiteName, "suiteName property is correctly set");
        assert.typeOf("object", testSuite.scope, "scope is assigned and object");
        assert.eq(internals.setUp, testSuite.setUp, "1");
        assert.eq(internals.tearDown, testSuite.tearDown, "2");
        assert.is("testDummy", testSuite.tests[0].name, "3");
        assert.eq(internals.testDummy, testSuite.tests[0].fn, "4");
    }

    function testCompileAnonymousFunction() {
        var anonymousTestSuite = function () {
            function setUp() { return 1; }
            function tearDown() { return 2; }
            function testDummy() { return 3; }
            
            return {
                setUp: setUp,
                tearDown: tearDown,
                testDummy: testDummy
            };
        };
        
        var internals = anonymousTestSuite();
        var testSuite = jsUnity.compile(anonymousTestSuite);

        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.isUndefined(testSuite.suiteName);
        assert.typeOf("object", testSuite.scope);
        assert.eq(internals.setUp, testSuite.setUp);
        assert.eq(internals.tearDown, testSuite.tearDown);
        assert.is("testDummy", testSuite.tests[0].name);
        assert.eq(internals.testDummy, testSuite.tests[0].fn);
    }

    function testCompileArrayOfFunctions() {
        var arrayTestSuite = [
            global.setUp,
            global.tearDown,
            testGlobalPass1
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.isUndefined(testSuite.suiteName);
        assert.typeOf("object", testSuite.scope);
        assert.is(global.setUp, testSuite.setUp);
        assert.is(global.tearDown, testSuite.tearDown);
        assert.is("testGlobalPass1", testSuite.tests[0].name);
        assert.is(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileArrayOfStrings() {
        var arrayTestSuite = [
            "setUp",
            "tearDown",
            "testGlobalPass1"
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.isUndefined(testSuite.suiteName);
        assert.typeOf("object", testSuite.scope);
        assert.is(global.setUp, testSuite.setUp);
        assert.is(global.tearDown, testSuite.tearDown);
        assert.is("testGlobalPass1", testSuite.tests[0].name);
        assert.is(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileObject() {
        var objectTestSuite = {
            suiteName: "TestSuite",
            setUp: global.setUp,
            tearDown: global.tearDown,
            testGlobalPass1: testGlobalPass1
        };
        
        var testSuite = jsUnity.compile(objectTestSuite);
        
        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.is("TestSuite", testSuite.suiteName);
        assert.is(objectTestSuite, testSuite.scope);
        assert.is(global.setUp, testSuite.setUp);
        assert.is(global.tearDown, testSuite.tearDown);
        assert.is("testGlobalPass1", testSuite.tests[0].name);
        assert.is(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileString() {
        var stringTestSuite =
            [ global.setUp, global.tearDown, testGlobalPass1 ].join("\n");

        var testSuite = jsUnity.compile(stringTestSuite);

        assert.instanceOf(jsUnity.TestSuite, testSuite);
        assert.isUndefined(testSuite.suiteName);
        assert.typeOf("object", testSuite.scope);
        assert.eq(global.setUp, testSuite.setUp);
        assert.eq(global.tearDown, testSuite.tearDown);
        assert.is("testGlobalPass1", testSuite.tests[0].name);
        assert.eq(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileNumber() {
        try {
            jsUnity.compile(42);
            assert.fail();
        } catch (e) {
            // pass
        }
    }

    function testRunTestSuiteReturnsResults() {
        var testSuite = new jsUnity.TestSuite("TestSuite");
        testSuite.setUp = global.setUp;
        testSuite.tearDown = global.tearDown;
        testSuite.tests.push({ name: "testGlobalPass1", fn: testGlobalPass1 });
        testSuite.tests.push({ name: "testGlobalPass2", fn: testGlobalPass2 });
        testSuite.tests.push({ name: "testGlobalFail", fn: testGlobalFail });
        
        checkResults(jsUnity.run(testSuite), "TestSuite");
    }

    function testRunNamedFunctionReturnsResults() {
        function namedTestSuite() {
            function setUp() { global.setUps++; }
            function tearDown() { global.tearDowns++; }
            function testNamedPass1() {}
            function testNamedPass2() {}
            function testNamedFail() { throw "fail"; }
        }
        
        checkResults(jsUnity.run(namedTestSuite), "namedTestSuite");
    }

    function testRunAnonymousFunctionReturnsResults() {
        var anonymousTestSuite = function () {
            function setUp() { global.setUps++; }
            function tearDown() { global.tearDowns++; }
            function testAnonymousPass1() {}
            function testAnonymousPass2() {}
            function testAnonymousFail() { throw "fail"; }
        };

        checkResults(jsUnity.run(anonymousTestSuite));
    }

    function testRunArrayOfFunctionsReturnsResults() {
        var arrayTestSuite = [
            global.setUp,
            global.tearDown,
            testGlobalPass1,
            testGlobalPass2,
            testGlobalFail
        ];

        checkResults(jsUnity.run(arrayTestSuite));
    }

    function testRunArrayOfStringsReturnsResults() {
        var arrayTestSuite = [
            "setUp",
            "tearDown",
            "testGlobalPass1",
            "testGlobalPass2",
            "testGlobalFail"
        ];

        checkResults(jsUnity.run(arrayTestSuite));
    }

    function testRunObjectReturnsResults() {
        var objectTestSuite = {
            suiteName: "objectTestSuite",
            setUp: function () { global.setUps++; },
            tearDown: function () { global.tearDowns++; },
            testObjectPass1: function () {},
            testObjectPass2: function () {},
            testObjectFail: function () { throw "fail"; }
        };

        checkResults(jsUnity.run(objectTestSuite), "objectTestSuite");
    }

    function testRunStringReturnsResults() {
        var stringTestSuite =
            "function setUp() { global.setUps++; }"
            + "function tearDown() { global.tearDowns++; }"
            + "function testStringPass1() {}"
            + "function testStringPass2() {}"
            + "function testStringFail() { throw \"fail\"; }";

        checkResults(jsUnity.run(stringTestSuite));
    }

    function testRunNumberFails() {
        assert.isFalse(jsUnity.run(42));
    }
    
    function testRunMultipleReturnsResults() {
        function namedTestSuite1() {
            function testThatPasses() {}
        }
        
        function namedTestSuite2() {
            function testThatFails() { assert.fail(); }
        }
        
        var anonymousTestSuite = function () {
        }

        var results = jsUnity.run(
            namedTestSuite1, namedTestSuite2, anonymousTestSuite);
        assert.is("namedTestSuite1,namedTestSuite2,",
            results.suiteName);
        assert.is(2, results.total);
        assert.is(1, results.passed);
        assert.is(1, results.failed);
    }
    
    function testRunTestSuiteBindsGivenScopeAsTestScope() {
        var testSuite = new jsUnity.TestSuite("TestSuite", { marker: true });
        testSuite.tests.push({
            name: "testMarker",
            fn: function () {
                assert.isTrue(this.marker);
            }
        });

        var results = jsUnity.run(testSuite);

        assert.is(1, results.passed);
    }

    function testRunFunctionWontBindFunctionAsTestScope() {
        function testSuite() {
            function testMarker() {
                assert.isTrue(this.marker);
            }
        }

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        assert.is(1, results.failed);
    }

    function testRunArrayWontBindArrayAsTestScope() {
        function testMarker() {
            assert.isTrue(this.marker);
        }

        var testSuite = [ testMarker ];

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        assert.is(1, results.failed);
    }

    function testRunStringWontBindStringAsTestScope() {
        var testSuite = "function testMarker() {"
            + "assert.isTrue(this.marker);"
            + "}";

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        assert.is(1, results.failed);
    }

    function testRunObjectBindsObjectAsTestScope() {
        var results = jsUnity.run({
            marker: true,

            testMarker: function () {
                assert.isTrue(this.marker);
            }
        });

        assert.is(1, results.passed);
    }
    
    function testRunObjectBindsObjectAsSetUpScope() {
        var results = jsUnity.run({
            setUp: function () {
                this.marker = true;
            },
            testMarker: function () {
                assert.isTrue(this.marker);
            }
        });

        assert.is(1, results.passed);
    }

    function testRunObjectBindsObjectAsPassingTearDownScope() {
        var results = jsUnity.run({
            tearDown: function () {
                this.marker = true;
            },
            testPassing: function () {},
            testMarker: function () {
                assert.isTrue(this.marker);
            }
        });

        assert.is(2, results.passed);
    }

    function testRunObjectBindsObjectAsFailingTearDownScope() {
        var results = jsUnity.run({
            tearDown: function () {
                this.marker = true;
            },
            testFailing: function () {
                assert.fail();
            },
            testMarker: function () {
                assert.isTrue(this.marker);
            }
        });

        assert.is(1, results.passed);
        assert.is(1, results.failed);
    }
}
//%>
