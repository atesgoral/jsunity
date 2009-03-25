//<%
function setUp() { setUps++; }
function tearDown() { tearDowns++; }
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

        a.assertIdentical(3, setUps);
        a.assertIdentical(3, tearDowns);
    }

    function setUp() {
        origLog = jsUnity.log;
        jsUnity.log = function () {};
    }

    function tearDown() {
        jsUnity.log = origLog;
        delete origLog;
    }

    function testSetUpTearDownCalled() {
        function setUpTearDownTestSuite() {
            function setUp() {
                calls.push("setUp");
            }
            
            function tearDown() {
                calls.push("tearDown");
            }
            
            function testDummy() {
                calls.push("testDummy");
            }
        }

        calls = [];
        
        jsUnity.run(setUpTearDownTestSuite);
        
        a.assertIdentical("setUp,testDummy,tearDown", calls.join(","));
    }

    function testLogCalled() {
        var hijackedLog = jsUnity.log;
        var hijackedGetDate = jsUnity.env.getDate;

        var logStrs = [];
        
        jsUnity.log = function (s) {
            logStrs.push(s);
        };
        
        jsUnity.env.getDate = function () {
            return 0;
        };
        
        var results = jsUnity.run(function () {});

        jsUnity.log = hijackedLog;
        jsUnity.env.getDate = hijackedGetDate;

        a.assertIdentical(
            "Running unnamed test suite\n"
            + "0 tests found\n"
            + "0 tests passed\n"
            + "0 tests failed\n"
            + "0 milliseconds elapsed",
            logStrs.join("\n"));
    }

    function testErrorCalled() {
        var hijackedError = jsUnity.error;

        var errorStr;
        
        jsUnity.error = function (s) {
            errorStr = s;
        };
        
        var results = jsUnity.run(false);

        jsUnity.error = hijackedError;

        a.assertIdentical(false, results);
        a.assertTrue(errorStr.length > 0);
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
        setUps = 0;
        tearDowns = 0;
        
        var testSuite = new jsUnity.TestSuite("TestSuite");
        testSuite.setUp = global.setUp;
        testSuite.tearDown = global.tearDown;
        testSuite.tests.push({ name: "testGlobalPass1", fn: testGlobalPass1 });
        testSuite.tests.push({ name: "testGlobalPass2", fn: testGlobalPass2 });
        testSuite.tests.push({ name: "testGlobalFail", fn: testGlobalFail });
        
        checkResults(jsUnity.run(testSuite), "TestSuite");
    }

    function testRunNamedFunctionReturnsResults() {
        setUps = 0;
        tearDowns = 0;

        function namedTestSuite() {
            function setUp() { setUps++; }
            function tearDown() { tearDowns++; }
            function testNamedPass1() {}
            function testNamedPass2() {}
            function testNamedFail() { throw "fail"; }
        }
        
        checkResults(jsUnity.run(namedTestSuite), "namedTestSuite");
    }

    function testRunAnonymousFunctionReturnsResults() {
        setUps = 0;
        tearDowns = 0;

        var anonymousTestSuite = function () {
            function setUp() { setUps++; }
            function tearDown() { tearDowns++; }
            function testAnonymousPass1() {}
            function testAnonymousPass2() {}
            function testAnonymousFail() { throw "fail"; }
        };

        checkResults(jsUnity.run(anonymousTestSuite));
    }

    function testRunArrayOfFunctionsReturnsResults() {
        setUps = 0;
        tearDowns = 0;

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
        setUps = 0;
        tearDowns = 0;

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
        setUps = 0;
        tearDowns = 0;

        var objectTestSuite = {
            suiteName: "objectTestSuite",
            setUp: function () { setUps++; },
            tearDown: function () { tearDowns++; },
            testObjectPass1: function () {},
            testObjectPass2: function () {},
            testObjectFail: function () { throw "fail"; }
        };

        checkResults(jsUnity.run(objectTestSuite), "objectTestSuite");
    }

    function testRunStringReturnsResults() {
        setUps = 0;
        tearDowns = 0;

        var stringTestSuite =
            "function setUp() { setUps++; }"
            + "function tearDown() { tearDowns++; }"
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
}
//%>
