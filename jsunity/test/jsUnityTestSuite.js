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

function jsUnityTestSuite() {
    function setUp() {
        origLog = jsUnity.log;
        jsUnity.log = function () {};
    }

    function tearDown() {
        jsUnity.log = origLog;
        delete origLog;
    }

    function testSetUp() {
        // todo
    }
    
    function testTearDown() {
        // todo
    }

    function testLog() {
        // todo
    }

    function testError() {
        // todo
    }

    function testRunFunctionNamed() {
        var results = jsUnity.run(namedTestSuite);
        //assertEquals("namedTestSuite", results.name);
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
        assertFalse(results);
    } 

    function testRunObject() {
        var results = jsUnity.run(objectTestSuite);
        assertFalse(results);
    } 

    function testRunString() {
        var results = jsUnity.run(stringTestSuite);
        assertFalse(results);
    }

    function testRunNumber() {
        assertFalse(jsUnity.run(42));
    } 
}