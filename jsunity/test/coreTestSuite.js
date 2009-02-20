//<%
function testArrayPass1() {}
function testArrayPass2() {}
function testArrayFail() { throw "fail"; }

function checkAssertions(scope) {
    for (var fn in jsUnity.assertions) {
        jsUnity.assertions.assertEquals(jsUnity.assertions[fn], scope[fn]);
    }
}

function coreTestSuite() {
    function setUp() {
        origLog = jsUnity.log;
        jsUnity.log = function () { /*origLog("    " + arguments[0]);*/ };
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
            + "0 milliseconds elapsed", // leap of faith!
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
        jsUnity.assertions.assertEquals("Invalid test suite: "
            + "Must be a function, array, object or string.",
            errorStr);
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

    function testRunFunctionNamed() {
        setUps = 0;
        tearDowns = 0;

        function namedTestSuite() {
            function setUp() { setUps++; }
            function tearDown() { tearDowns++; }
            function testNamedPass1() {}
            function testNamedPass2() {}
            function testNamedFail() { throw "fail"; }
        }
        
        var results = jsUnity.run(namedTestSuite);
        jsUnity.assertions.assertEquals("namedTestSuite", results.suiteName);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(3, setUps);
        jsUnity.assertions.assertEquals(3, tearDowns);
    }

    function testRunFunctionAnonymous() {
        setUps = 0;
        tearDowns = 0;

        var anonymousTestSuite = function () {
            function setUp() { setUps++; }
            function tearDown() { tearDowns++; }
            function testAnonymousPass1() {}
            function testAnonymousPass2() {}
            function testAnonymousFail() { throw "fail"; }
        };

        var results = jsUnity.run(anonymousTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(3, setUps);
        jsUnity.assertions.assertEquals(3, tearDowns);
    }

    function testRunArray() {
        setUps = 0;
        tearDowns = 0;

        var arrayTestSuite = [
            "testArrayPass1",
            "testArrayPass2",
            "testArrayFail"
        ];

        var results = jsUnity.run(arrayTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(0, setUps);
        jsUnity.assertions.assertEquals(0, tearDowns);
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

        var results = jsUnity.run(objectTestSuite);
        jsUnity.assertions.assertEquals("objectTestSuite", results.suiteName);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(3, setUps);
        jsUnity.assertions.assertEquals(3, tearDowns);
    }

    function testRunString() {
        setUps = 0;
        tearDowns = 0;

        var stringTestSuite = "\
                function setUp() { setUps++; }\
                function tearDown() { tearDowns++; }\
                function testStringPass1() {}\
                function testStringPass2() {}\
                function testStringFail() { throw \"fail\"; }\
            ";

        var results = jsUnity.run(stringTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);

        jsUnity.assertions.assertEquals(3, setUps);
        jsUnity.assertions.assertEquals(3, tearDowns);
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
}
//%>
