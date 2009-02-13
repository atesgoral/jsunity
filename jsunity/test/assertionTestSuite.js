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

var assertionTestSuite = {
    testAssertTrue: function () {
        jsUnity.assertions.assertTrue(true);

        assertException(function () { jsUnity.assertions.assertTrue(false); });
    },

    testAssertFalse: function () {
        jsUnity.assertions.assertFalse(false);

        assertException(function () { jsUnity.assertions.assertFalse(true); });
    },

    testAssertEquals: function () {
        jsUnity.assertions.assertEquals(1, 1);
        var n = new Number(5);
        jsUnity.assertions.assertEquals(n, n);
        jsUnity.assertions.assertEquals(undefined, undefined);
        
        assertException(function () { jsUnity.assertions.assertEquals("foo", "bar"); });
        assertException(function () { jsUnity.assertions.assertEquals(undefined, new Date()); });
        assertException(function () { jsUnity.assertions.assertEquals([42], undefined); });
    },

    testAssertNotEquals: function () {
        jsUnity.assertions.assertNotEquals(1, 2);
        jsUnity.assertions.assertNotEquals(new Number(5), new Number(6));
        jsUnity.assertions.assertNotEquals(undefined, "foo");
        jsUnity.assertions.assertNotEquals([42], undefined);
        
        assertException(function () { jsUnity.assertions.assertNotEquals(1, 1); });
        assertException(function () { jsUnity.assertions.assertNotEquals(undefined, undefined); });
    },

    testAssertNull: function () {
        jsUnity.assertions.assertNull(null);

        assertException(function () { jsUnity.assertions.assertNull(5); });
    },

    testAssertNotNull: function () {
        jsUnity.assertions.assertNotNull(3);

        assertException(function () { jsUnity.assertions.assertNotNull(null); });
    },

    testAssertUndefined: function () {
        jsUnity.assertions.assertUndefined(undefined);

        assertException(function () { jsUnity.assertions.assertUndefined(5); });
    },

    testAssertNotUndefined: function () {
        jsUnity.assertions.assertNotUndefined(3);

        assertException(function () { jsUnity.assertions.assertNotUndefined(undefined); });
    },

    testAssertNaN: function () {
        jsUnity.assertions.assertNaN(NaN);

        assertException(function () { jsUnity.assertions.assertNaN(42); });
    },

    testAssertNotNaN: function () {
        jsUnity.assertions.assertNotNaN(42);

        assertException(function () { jsUnity.assertions.assertNotNaN(NaN); });
    },

    testFail: function () {
        assertException(function () { jsUnity.assertions.fail(); });
    }
};
