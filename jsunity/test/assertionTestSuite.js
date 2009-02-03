function assertionTestSuite() {
    /**
     * Assert that the call to the given function results in an exception
     *
     * @param fn The function to call
     */
    function assertException(fn) {
        var fail = false;

        try {
            fn();
            fail = true;
        } catch (e) {
            // Eat the exception
        }
        
        if (fail) {
            throw "An exception wasn't thrown";
        }
    }

    /**
     * Test the <code>assertTrue()</code> function
     */
    function testAssertTrue() {
        assertTrue(true);

        assertException(function () { assertTrue(false); });
    }

    /**
     * Test the <code>assertFalse()</code> function
     */
    function testAssertFalse() {
        assertFalse(false);

        assertException(function () { assertFalse(true); });
    }

    /**
     * Test the <code>assertEquals()</code> function
     */
    function testAssertEquals() {
        assertEquals(1, 1);
        var n = new Number(5);
        assertEquals(n, n);
        assertEquals(undefined, undefined);
        
        assertException(function () { assertEquals("foo", "bar"); });
        assertException(function () { assertEquals(undefined, new Date()); });
        assertException(function () { assertEquals([42], undefined); });
    }

    /**
     * Test the <code>assertNotEquals()</code> function
     */
    function testAssertNotEquals() {
        assertNotEquals(1, 2);
        assertNotEquals(new Number(5), new Number(6));
        assertNotEquals(undefined, "foo");
        assertNotEquals([42], undefined);
        
        assertException(function () { assertNotEquals(1, 1); });
        assertException(function () { assertNotEquals(undefined, undefined); });
    }

    /**
     * Test the <code>assertNull()</code> function
     */
    function testAssertNull() {
        assertNull(null);

        assertException(function () { assertNull(5); });
    }

    /**
     * Test the <code>assertNotNull()</code> function
     */
    function testAssertNotNull() {
        assertNotNull(3);

        assertException(function () { assertNotNull(null); });
    }

    /**
     * Test the <code>assertUndefined()</code> function
     */
    function testAssertUndefined() {
        assertUndefined(undefined);

        assertException(function () { assertUndefined(5); });
    }

    /**
     * Test the <code>assertNotUndefined()</code> function
     */
    function testAssertNotUndefined() {
        assertNotUndefined(3);

        assertException(function () { assertNotUndefined(undefined); });
    }

    /**
     * Test the <code>assertNaN()</code> function
     */
    function testAssertNaN() {
        assertNaN(NaN);

        assertException(function () { assertNaN(42); });
    }

    /**
     * Test the <code>assertNotNaN()</code> function
     */
    function testAssertNotNaN() {
        assertNotNaN(42);

        assertException(function () { assertNotNaN(NaN); });
    }

    /**
     * Test the <code>testFail()</code> function
     */
    function testFail() {
        var pass = true;

        assertException(function () { fail(); });
    }
}
