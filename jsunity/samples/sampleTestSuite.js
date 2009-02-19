//<%
function sampleTestSuite() {
    function setUp() {
        jsUnity.log("set up");
    }

    function tearDown() {
        jsUnity.log("tear down");
    }

    function testLessThan() {
        jsUnity.assertions.assertTrue(1 < 2);
    }
    
    function testPi() {
        jsUnity.assertions.assertEquals(Math.PI, 22 / 7);
    }
}
//%>
