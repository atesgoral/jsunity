function namedTestSuite() {
    function setUp() {}
    function tearDown() {}
    function testNamedPass1() {}
    function testNamedPass2() {}
    function testNamedFail() { throw "fail"; }
}

var anonymousTestSuite = function () {
    function setUp() {}
    function tearDown() {}
    function testAnonymousPass1() {}
    function testAnonymousPass2() {}
    function testAnonymousFail() { throw "fail"; }
};

var objectTestSuite = {
    setUp: function () {},
    tearDown: function () {},
    testObjectPass1: function () {},
    testObjectPass2: function () {},
    testObjectFail: function () { throw "fail"; }
};

function setUp() {}
function tearDown() {}
function testArrayPass1() {}
function testArrayPass2() {}
function testArrayFail() { throw "fail"; }

var arrayTestSuite = [
    "testArrayPass1",
    "testArrayPass2",
    "testArrayFail"
];

var stringTestSuite = "\
        function setUp() {}\
        function tearDown() {}\
        function testStringPass1() {}\
        function testStringPass2() {}\
        function testStringFail() { throw \"fail\"; }\
    ";

with (jsUnity.assertions) {
    function checkAssertions(scope) {
        for (var fn in jsUnity.assertions) {
            assertEquals(jsUnity.assertions[fn], scope[fn]);
        }
    }
}

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

function jsUnityTestSuite() {
    function setUp() {
        origLog = jsUnity.log;
        jsUnity.log = function () {};
    }

    function tearDown() {
        jsUnity.log = origLog;
        delete origLog;
    }

    function testSetUpTearDown() {
        calls = [];
        
        jsUnity.run(setUpTearDownTestSuite);
        
        assertEquals("setUp,testDummy,tearDown", calls.join(","));
    }

    function testLog() {
        var hijacked = jsUnity.log;

        var logStrs = [];
        
        jsUnity.log = function (s) {
            logStrs.push(s);
        };
        
        var results = jsUnity.run(function () {});

        jsUnity.log = hijacked;

        assertTrue(Boolean(results));
        assertEquals("0 tests found\n0 tests passed\n0 tests failed",
            logStrs.join("\n"));
    }

    function testError() {
        var hijacked = jsUnity.error;

        var errorStr;
        
        jsUnity.error = function (s) {
            errorStr = s;
        };
        
        var results = jsUnity.run(false);

        jsUnity.error = hijacked;

        assertFalse(results);
        assertEquals("Invalid test suite: "
            + "Must be a function, array, object or string.",
            errorStr);
    }

    function testAttachAssertionsDefaultScope() {
        jsUnity.attachAssertions();
        checkAssertions(window);
    }

    function testAttachAssertionsGivenScope() {
        var scope = {};
        jsUnity.attachAssertions(scope);
        checkAssertions(scope);
    }

    function testRunFunctionNamed() {
        var results = jsUnity.run(namedTestSuite);
        assertEquals("namedTestSuite", results.name);
        assertEquals(3, results.total);
        assertEquals(2, results.passed);
        assertEquals(1, results.failed);
    } 

    function testRunFunctionAnonymous() {
        var results = jsUnity.run(anonymousTestSuite);
        assertEquals(3, results.total);
        assertEquals(2, results.passed);
        assertEquals(1, results.failed);
    } 

    function testRunArray() {
        var results = jsUnity.run(arrayTestSuite);
        assertEquals(3, results.total);
        assertEquals(2, results.passed);
        assertEquals(1, results.failed);
    } 

    function testRunObject() {
        var results = jsUnity.run(objectTestSuite);
        assertEquals(3, results.total);
        assertEquals(2, results.passed);
        assertEquals(1, results.failed);
    } 

    function testRunString() {
        var results = jsUnity.run(stringTestSuite);
        assertEquals(3, results.total);
        assertEquals(2, results.passed);
        assertEquals(1, results.failed);
    }

    function testRunNumber() {
        assertFalse(jsUnity.run(42));
    } 
}
