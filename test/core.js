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

var a = {};
jsUnity.attachAssertions(a);

function checkAssertions(scope) {
    for (var fn in jsUnity.assertions) {
        a.assertIdentical(jsUnity.assertions[fn], scope[fn]);
    }
}

function CoreTestSuite() {
    function checkResults(results, suiteName) {
        a.assertInstanceOf(jsUnity.TestResults, results);
        a.assertIdentical(suiteName || "", results.suiteName);
        a.assertIdentical(3, results.total);
        a.assertIdentical(2, results.passed);
        a.assertIdentical(1, results.failed);

        a.assertIdentical(3, global.setUps);
        a.assertIdentical(3, global.tearDowns);
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
        
        a.assertEqual([ "setUp", "testPassing", "tearDown" ], calls);
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
                a.fail();
            }
        });
        
        a.assertEqual([ "setUp", "testFailing", "tearDown" ], calls);
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
        
        a.assertEqual([ "testPassing", "testPassing", "testPassing" ], calls);
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
                a.fail();
            }
        });
        
        a.assertEqual([ "testFailing", "testFailing", "testFailing" ], calls);
    }

    function testLogCalled() {
        var results = jsUnity.run(function () {});

        a.assertEqual(
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

        a.assertIdentical(false, results);
        a.assertTrue(errorCalled);
    }

    function testAttachAssertionsDefaultScope() {
        var scope = {};
        var hijackedScope = jsUnity.env.defaultScope;

        jsUnity.env.defaultScope = scope;
        jsUnity.attachAssertions();
        jsUnity.env.defaultScope = hijackedScope;
        
        checkAssertions(scope);        
    }

    function testAttachAssertionsGivenScope() {
        var scope = {};
        jsUnity.attachAssertions(scope);
        checkAssertions(scope);
    }

    function testCompileTestSuite() {
        var scope = {};
        function testDummy() {}
        
        var origTestSuite = new jsUnity.TestSuite("TestSuite", scope);
        origTestSuite.setUp = global.setUp;
        origTestSuite.tearDown = global.tearDown;
        origTestSuite.tests.push({ name: "testDummy", fn: testDummy });
        
        var testSuite = jsUnity.compile(origTestSuite);
        
        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertIdentical("TestSuite", testSuite.suiteName);
        a.assertIdentical(scope, testSuite.scope);
        a.assertIdentical(global.setUp, testSuite.setUp);
        a.assertIdentical(global.tearDown, testSuite.tearDown);
        a.assertIdentical("testDummy", testSuite.tests[0].name);
        a.assertIdentical(testDummy, testSuite.tests[0].fn);
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

        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertIdentical("namedTestSuite", testSuite.suiteName);
        a.assertTypeOf("object", testSuite.scope);
        a.assertEqual(internals.setUp, testSuite.setUp);
        a.assertEqual(internals.tearDown, testSuite.tearDown);
        a.assertIdentical("testDummy", testSuite.tests[0].name);
        a.assertEqual(internals.testDummy, testSuite.tests[0].fn);
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

        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertUndefined(testSuite.suiteName);
        a.assertTypeOf("object", testSuite.scope);
        a.assertEqual(internals.setUp, testSuite.setUp);
        a.assertEqual(internals.tearDown, testSuite.tearDown);
        a.assertIdentical("testDummy", testSuite.tests[0].name);
        a.assertEqual(internals.testDummy, testSuite.tests[0].fn);
    }

    function testCompileArrayOfFunctions() {
        var arrayTestSuite = [
            global.setUp,
            global.tearDown,
            testGlobalPass1
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertUndefined(testSuite.suiteName);
        a.assertTypeOf("object", testSuite.scope);
        a.assertIdentical(global.setUp, testSuite.setUp);
        a.assertIdentical(global.tearDown, testSuite.tearDown);
        a.assertIdentical("testGlobalPass1", testSuite.tests[0].name);
        a.assertIdentical(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileArrayOfStrings() {
        var arrayTestSuite = [
            "setUp",
            "tearDown",
            "testGlobalPass1"
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertUndefined(testSuite.suiteName);
        a.assertTypeOf("object", testSuite.scope);
        a.assertIdentical(global.setUp, testSuite.setUp);
        a.assertIdentical(global.tearDown, testSuite.tearDown);
        a.assertIdentical("testGlobalPass1", testSuite.tests[0].name);
        a.assertIdentical(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileObject() {
        var objectTestSuite = {
            suiteName: "TestSuite",
            setUp: global.setUp,
            tearDown: global.tearDown,
            testGlobalPass1: testGlobalPass1
        };
        
        var testSuite = jsUnity.compile(objectTestSuite);
        
        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertIdentical("TestSuite", testSuite.suiteName);
        a.assertIdentical(objectTestSuite, testSuite.scope);
        a.assertIdentical(global.setUp, testSuite.setUp);
        a.assertIdentical(global.tearDown, testSuite.tearDown);
        a.assertIdentical("testGlobalPass1", testSuite.tests[0].name);
        a.assertIdentical(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileString() {
        var stringTestSuite =
            [ global.setUp, global.tearDown, testGlobalPass1 ].join("\n");

        var testSuite = jsUnity.compile(stringTestSuite);

        a.assertInstanceOf(jsUnity.TestSuite, testSuite);
        a.assertUndefined(testSuite.suiteName);
        a.assertTypeOf("object", testSuite.scope);
        a.assertEqual(global.setUp, testSuite.setUp);
        a.assertEqual(global.tearDown, testSuite.tearDown);
        a.assertIdentical("testGlobalPass1", testSuite.tests[0].name);
        a.assertEqual(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileNumber() {
        try {
            jsUnity.compile(42);
            a.fail();
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
        a.assertFalse(jsUnity.run(42));
    }
    
    function testRunMultipleReturnsResults() {
        function namedTestSuite1() {
            function testThatPasses() {}
        }
        
        function namedTestSuite2() {
            function testThatFails() { a.fail(); }
        }
        
        var anonymousTestSuite = function () {
        }

        var results = jsUnity.run(
            namedTestSuite1, namedTestSuite2, anonymousTestSuite);
        a.assertIdentical("namedTestSuite1,namedTestSuite2,",
            results.suiteName);
        a.assertIdentical(2, results.total);
        a.assertIdentical(1, results.passed);
        a.assertIdentical(1, results.failed);
    }
    
    function testRunTestSuiteBindsGivenScopeAsTestScope() {
        var testSuite = new jsUnity.TestSuite("TestSuite", { marker: true });
        testSuite.tests.push({
            name: "testMarker",
            fn: function () {
                a.assertTrue(this.marker);
            }
        });

        var results = jsUnity.run(testSuite);

        a.assertIdentical(1, results.passed);
    }

    function testRunFunctionWontBindFunctionAsTestScope() {
        function testSuite() {
            function testMarker() {
                a.assertTrue(this.marker);
            }
        }

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        a.assertIdentical(1, results.failed);
    }

    function testRunArrayWontBindArrayAsTestScope() {
        function testMarker() {
            a.assertTrue(this.marker);
        }

        var testSuite = [ testMarker ];

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        a.assertIdentical(1, results.failed);
    }

    function testRunStringWontBindStringAsTestScope() {
        var testSuite = "function testMarker() {"
            + "a.assertTrue(this.marker);"
            + "}";

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        a.assertIdentical(1, results.failed);
    }

    function testRunObjectBindsObjectAsTestScope() {
        var results = jsUnity.run({
            marker: true,

            testMarker: function () {
                a.assertTrue(this.marker);
            }
        });

        a.assertIdentical(1, results.passed);
    }
    
    function testRunObjectBindsObjectAsSetUpScope() {
        var results = jsUnity.run({
            setUp: function () {
                this.marker = true;
            },
            testMarker: function () {
                a.assertTrue(this.marker);
            }
        });

        a.assertIdentical(1, results.passed);
    }

    function testRunObjectBindsObjectAsPassingTearDownScope() {
        var results = jsUnity.run({
            tearDown: function () {
                this.marker = true;
            },
            testPassing: function () {},
            testMarker: function () {
                a.assertTrue(this.marker);
            }
        });

        a.assertIdentical(2, results.passed);
    }

    function testRunObjectBindsObjectAsFailingTearDownScope() {
        var results = jsUnity.run({
            tearDown: function () {
                this.marker = true;
            },
            testFailing: function () {
                a.fail();
            },
            testMarker: function () {
                a.assertTrue(this.marker);
            }
        });

        a.assertIdentical(1, results.passed);
        a.assertIdentical(1, results.failed);
    }
}
//%>
