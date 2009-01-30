//<%
function sampleTestSuite() {
	function setUp() {
		jsUnity.log("set up");
	}

	function tearDown() {
		jsUnity.log("tear down");
	}

	function testLessThan() {
		assertTrue(1 < 2);
	}
	
	function testPi() {
		assertEquals(Math.PI, 22 / 7);
	}
}
//%>
