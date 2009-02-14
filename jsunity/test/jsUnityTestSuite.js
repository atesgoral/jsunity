//function setUp() {}
//function tearDown() {}
function testArrayPass1() {}
function testArrayPass2() {}
function testArrayFail() { throw "fail"; }

function checkAssertions(scope) {
    for (var fn in jsUnity.assertions) {
        jsUnity.assertions.assertEquals(jsUnity.assertions[fn], scope[fn]);
    }
}

var jsUnityTestSuite = {
    setUp: function () {
        origLog = jsUnity.log;
        jsUnity.log = function () {};
    },

    tearDown: function () {
        jsUnity.log = origLog;
        delete origLog;
    },

    testSetUpTearDown: function () {
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
    },

    testLog: function () {
        var hijacked = jsUnity.log;

        var logStrs = [];
        
        jsUnity.log = function (s) {
            logStrs.push(s);
        };
        
        var results = jsUnity.run(function () {});

        jsUnity.log = hijacked;

        jsUnity.assertions.assertTrue(Boolean(results));
        jsUnity.assertions.assertEquals(
            "0 tests found\n0 tests passed\n0 tests failed",
            logStrs.join("\n"));
    },

    testError: function () {
        var hijacked = jsUnity.error;

        var errorStr;
        
        jsUnity.error = function (s) {
            errorStr = s;
        };
        
        var results = jsUnity.run(false);

        jsUnity.error = hijacked;

        jsUnity.assertions.assertFalse(results);
        jsUnity.assertions.assertEquals("Invalid test suite: "
            + "Must be a function, array, object or string.",
            errorStr);
    },

    testAttachAssertionsDefaultScope: function () {
        jsUnity.attachAssertions();
        checkAssertions(window);
    },

    testAttachAssertionsGivenScope: function () {
        var scope = {};
        jsUnity.attachAssertions(scope);
        checkAssertions(scope);
    },

    testRunFunctionNamed: function () {
        function namedTestSuite() {
            function setUp() {}
            function tearDown() {}
            function testNamedPass1() {}
            function testNamedPass2() {}
            function testNamedFail() { throw "fail"; }
        }
        
        var results = jsUnity.run(namedTestSuite);
        jsUnity.assertions.assertEquals("namedTestSuite", results.name);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    },

    testRunFunctionAnonymous: function () {
        var anonymousTestSuite = function () {
            function setUp() {}
            function tearDown() {}
            function testAnonymousPass1() {}
            function testAnonymousPass2() {}
            function testAnonymousFail() { throw "fail"; }
        };

        var results = jsUnity.run(anonymousTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    },

    testRunArray: function () {
        var arrayTestSuite = [
            "testArrayPass1",
            "testArrayPass2",
            "testArrayFail"
        ];

        var results = jsUnity.run(arrayTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    },

    testRunObject: function () {
        var objectTestSuite = {
            name: "objectTestSuite",
            setUp: function () {},
            tearDown: function () {},
            testObjectPass1: function () {},
            testObjectPass2: function () {},
            testObjectFail: function () { throw "fail"; }
        };

        var results = jsUnity.run(objectTestSuite);
        jsUnity.assertions.assertEquals("objectTestSuite", results.name);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    },

    testRunString: function () {
        var stringTestSuite = "\
                function setUp() {}\
                function tearDown() {}\
                function testStringPass1() {}\
                function testStringPass2() {}\
                function testStringFail() { throw \"fail\"; }\
            ";

        var results = jsUnity.run(stringTestSuite);
        jsUnity.assertions.assertEquals(3, results.total);
        jsUnity.assertions.assertEquals(2, results.passed);
        jsUnity.assertions.assertEquals(1, results.failed);
    },

    testRunNumber: function () {
        jsUnity.assertions.assertFalse(jsUnity.run(42));
    }
};
