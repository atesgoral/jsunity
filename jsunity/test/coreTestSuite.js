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

function checkAssertions(scope) {
    for (var fn in jsUnity.assertions) {
        jsUnity.assertions.assertEquals(jsUnity.assertions[fn], scope[fn]);
    }
}

function coreTestSuite() {
    function checkResults(results, suiteName) {
        jsUnity.assertions.assertTrue(results instanceof jsUnity.TestResults);
        jsUnity.assertions.assertEquals(suiteName || "", results.suiteName);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(3, setUps);
        jsUnity.assertions.assertEquals(3, tearDowns);
    }

    function setUp() {
        origLog = jsUnity.log;
        jsUnity.log = function () {};
    }

    function tearDown() {
        jsUnity.log = origLog;
        delete origLog;
    }

    function testSetUpTearDown() {
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
        
        jsUnity.assertions.assertEquals("setUp,testDummy,tearDown",
            calls.join(","));
    }

    function testLog() {
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

        jsUnity.assertions.assertTrue(Boolean(results));
        jsUnity.assertions.assertEquals(
            "Running unnamed test suite\n"
            + "0 tests found\n"
            + "0 tests passed\n"
            + "0 tests failed\n"
            + "0 milliseconds elapsed",
            logStrs.join("\n"));
    }

    function testError() {
        var hijackedError = jsUnity.error;

        var errorStr;
        
        jsUnity.error = function (s) {
            errorStr = s;
        };
        
        var results = jsUnity.run(false);

        jsUnity.error = hijackedError;

        jsUnity.assertions.assertFalse(results);
        jsUnity.assertions.assertTrue(errorStr.length > 0);
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
        
        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertEquals("TestSuite", testSuite.suiteName);
        jsUnity.assertions.assertEquals(scope, testSuite.scope);
        jsUnity.assertions.assertEquals(global.setUp, testSuite.setUp);
        jsUnity.assertions.assertEquals(global.tearDown, testSuite.tearDown);
        jsUnity.assertions.assertEquals("testDummy", testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(testDummy, testSuite.tests[0].fn);
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

        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertEquals("namedTestSuite", testSuite.suiteName);
        jsUnity.assertions.assertEquals("object", typeof testSuite.scope);
        jsUnity.assertions.assertEquals(internals.setUp.toString(),
            testSuite.setUp.toString());
        jsUnity.assertions.assertEquals(internals.tearDown.toString(),
            testSuite.tearDown.toString());
        jsUnity.assertions.assertEquals("testDummy",
            testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(internals.testDummy.toString(),
            testSuite.tests[0].fn.toString());
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

        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertUndefined(testSuite.suiteName);
        jsUnity.assertions.assertEquals("object", typeof testSuite.scope);
        jsUnity.assertions.assertEquals(internals.setUp.toString(),
            testSuite.setUp.toString());
        jsUnity.assertions.assertEquals(internals.tearDown.toString(),
            testSuite.tearDown.toString());
        jsUnity.assertions.assertEquals("testDummy",
            testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(internals.testDummy.toString(),
            testSuite.tests[0].fn.toString());
    }

    function testCompileArrayOfFunctions() {
        var arrayTestSuite = [
            global.setUp,
            global.tearDown,
            testGlobalPass1
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertUndefined(testSuite.suiteName);
        jsUnity.assertions.assertEquals("object", typeof testSuite.scope);
        jsUnity.assertions.assertEquals(global.setUp, testSuite.setUp);
        jsUnity.assertions.assertEquals(global.tearDown, testSuite.tearDown);
        jsUnity.assertions.assertEquals("testGlobalPass1", testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileArrayOfStrings() {
        var arrayTestSuite = [
            "setUp",
            "tearDown",
            "testGlobalPass1"
        ];

        var testSuite = jsUnity.compile(arrayTestSuite);

        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertUndefined(testSuite.suiteName);
        jsUnity.assertions.assertEquals("object", typeof testSuite.scope);
        jsUnity.assertions.assertEquals(global.setUp, testSuite.setUp);
        jsUnity.assertions.assertEquals(global.tearDown, testSuite.tearDown);
        jsUnity.assertions.assertEquals("testGlobalPass1", testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileObject() {
        var objectTestSuite = {
            suiteName: "TestSuite",
            setUp: global.setUp,
            tearDown: global.tearDown,
            testGlobalPass1: testGlobalPass1
        };
        
        var testSuite = jsUnity.compile(objectTestSuite);
        
        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertEquals("TestSuite", testSuite.suiteName);
        jsUnity.assertions.assertEquals(objectTestSuite, testSuite.scope);
        jsUnity.assertions.assertEquals(global.setUp, testSuite.setUp);
        jsUnity.assertions.assertEquals(global.tearDown, testSuite.tearDown);
        jsUnity.assertions.assertEquals("testGlobalPass1", testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(testGlobalPass1, testSuite.tests[0].fn);
    }

    function testCompileString() {
        var stringTestSuite =
            [ global.setUp, global.tearDown, testGlobalPass1 ].join("\n");

        var testSuite = jsUnity.compile(stringTestSuite);

        jsUnity.assertions.assertTrue(testSuite instanceof jsUnity.TestSuite);
        jsUnity.assertions.assertUndefined(testSuite.suiteName);
        jsUnity.assertions.assertEquals("object", typeof testSuite.scope);
        jsUnity.assertions.assertEquals(global.setUp.toString(),
            testSuite.setUp.toString());
        jsUnity.assertions.assertEquals(global.tearDown.toString(),
            testSuite.tearDown.toString());
        jsUnity.assertions.assertEquals("testGlobalPass1",
            testSuite.tests[0].name);
        jsUnity.assertions.assertEquals(testGlobalPass1.toString(),
            testSuite.tests[0].fn.toString());
    }

    function testCompileNumber() {
        try {
            jsUnity.compile(42);
            jsUnity.assertions.fail();
        } catch (e) {
            // pass
        }
    }

    function testRunTestSuite() {
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

    function testRunNamedFunction() {
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

    function testRunAnonymousFunction() {
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

    function testRunArrayOfFunctions() {
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

    function testRunArrayOfStrings() {
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

    function testRunObject() {
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

    function testRunString() {
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

    function testRunNumber() {
        jsUnity.assertions.assertFalse(jsUnity.run(42));
    }
    
    function testRunMultiple() {
        function namedTestSuite1() {
            function testThatPasses() {}
        }
        
        function namedTestSuite2() {
            function testThatFails() { jsUnity.assertions.fail(); }
        }
        
        var anonymousTestSuite = function () {
        }

        var results = jsUnity.run(
            namedTestSuite1, namedTestSuite2, anonymousTestSuite);
        jsUnity.assertions.assertEquals("namedTestSuite1,namedTestSuite2,",
            results.suiteName);
        jsUnity.assertions.assertEquals(2, results.total);
        jsUnity.assertions.assertEquals(1, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    }
    
    function testRunTestSuiteBindsGivenScopeAsTestScope() {
        var testSuite = new jsUnity.TestSuite("TestSuite", { marker: true });
        testSuite.tests.push({
            name: "testMarker",
            fn: function () {
                jsUnity.assertions.assertTrue(this.marker);
            }
        });

        var results = jsUnity.run(testSuite);

        jsUnity.assertions.assertEquals(1, results.passed);
    }

    function testRunFunctionWontBindFunctionAsTestScope() {
        function testSuite() {
            function testMarker() {
                jsUnity.assertions.assertTrue(this.marker);
            }
        }

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        jsUnity.assertions.assertEquals(1, results.failed);
    }

    function testRunArrayWontBindArrayAsTestScope() {
        function testMarker() {
            jsUnity.assertions.assertTrue(this.marker);
        }

        var testSuite = [ testMarker ];

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        jsUnity.assertions.assertEquals(1, results.failed);
    }

    function testRunStringWontBindStringAsTestScope() {
        var testSuite = "function testMarker() {"
            + "jsUnity.assertions.assertTrue(this.marker);"
            + "}";

        testSuite.marker = true;

        var results = jsUnity.run(testSuite);

        jsUnity.assertions.assertEquals(1, results.failed);
    }

    function testRunObjectBindsObjectAsTestScope() {
        var results = jsUnity.run({
            marker: true,

            testMarker: function () {
                jsUnity.assertions.assertTrue(this.marker);
            }
        });

        jsUnity.assertions.assertEquals(1, results.passed);
    }
}
//%>
