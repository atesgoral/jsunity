//<%
function assertionTestSuite() {
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

    function testAssertTrue() {
        jsUnity.assertions.assertTrue(true);

        assertException(function () { jsUnity.assertions.assertTrue(false); });
    }

    function testAssertFalse() {
        jsUnity.assertions.assertFalse(false);

        assertException(function () { jsUnity.assertions.assertFalse(true); });
    }

    function testAssertEquals() {
        jsUnity.assertions.assertEquals(1, 1);
        var n = new Number(5);
        jsUnity.assertions.assertEquals(n, n);
        jsUnity.assertions.assertEquals(undefined, undefined);
        
        assertException(function () { jsUnity.assertions.assertEquals("foo", "bar"); });
        assertException(function () { jsUnity.assertions.assertEquals(undefined, new Date()); });
        assertException(function () { jsUnity.assertions.assertEquals([42], undefined); });
    }

    function testAssertNotEquals() {
        jsUnity.assertions.assertNotEquals(1, 2);
        jsUnity.assertions.assertNotEquals(new Number(5), new Number(6));
        jsUnity.assertions.assertNotEquals(undefined, "foo");
        jsUnity.assertions.assertNotEquals([42], undefined);
        
        assertException(function () { jsUnity.assertions.assertNotEquals(1, 1); });
        assertException(function () { jsUnity.assertions.assertNotEquals(undefined, undefined); });
    }

    function testAssertNull() {
        jsUnity.assertions.assertNull(null);

        assertException(function () { jsUnity.assertions.assertNull(5); });
    }

    function testAssertNotNull() {
        jsUnity.assertions.assertNotNull(3);

        assertException(function () { jsUnity.assertions.assertNotNull(null); });
    }

    function testAssertUndefined() {
        jsUnity.assertions.assertUndefined(undefined);

        assertException(function () { jsUnity.assertions.assertUndefined(5); });
    }

    function testAssertNotUndefined() {
        jsUnity.assertions.assertNotUndefined(3);

        assertException(function () { jsUnity.assertions.assertNotUndefined(undefined); });
    }

    function testAssertNaN() {
        jsUnity.assertions.assertNaN(NaN);

        assertException(function () { jsUnity.assertions.assertNaN(42); });
    }

    function testAssertNotNaN() {
        jsUnity.assertions.assertNotNaN(42);

        assertException(function () { jsUnity.assertions.assertNotNaN(NaN); });
    }

    function testFail() {
        var pass = true;

        assertException(function () { jsUnity.assertions.fail(); });
    }
}
//%>
