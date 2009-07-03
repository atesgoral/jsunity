//<%
function AssertionTestSuite() {
    function setUp() {
        jsUnity.attachAssertions(this);
    }
    
    function checkMessageMarker(fn) {
        try {
            fn.call(this);
        } catch (e) {
            this.assertMatch(/marker/, e);
        }
    }

    function testAssertExceptionPositive() {
        this.assertException(function () {
            throw 1;
        });
    }

    function testAssertExceptionNegative() {
        this.assertException(function () {
            this.assertException(function () {});
        });
    }

    function testAssertExceptionMessage() {
        checkMessageMarker.call(this, function () {
            this.assertException(function () {}, "marker");
        });
    }
    
    function testAssertTruePositive() {
        this.assertTrue(true);
    }

    function testAssertTrueNegative() {
        this.assertException(function () {
            this.assertTrue(false);
        });
    }

    function testAssertTrueMessage() {
        checkMessageMarker.call(this, function () {
            this.assertTrue(false, "marker");
        });
    }

    function testAssertFalsePositive() {
        this.assertFalse(false);
    }

    function testAssertFalseNegative() {
        this.assertException(function () {
            this.assertFalse(true);
        });
    }

    function testAssertFalseMessage() {
        checkMessageMarker.call(this, function () {
            this.assertFalse(true, "marker");
        });
    }
    
    function testAssertIdenticalPositive() {
        this.assertIdentical(1, 1);
        this.assertIdentical(null, null);
        this.assertIdentical(undefined, undefined);
        var obj = {};
        this.assertIdentical(obj, obj);
    }

    function testAssertIdenticalNegative() {
        this.assertException(function () {
            this.assertIdentical(1, "1");
        });
        this.assertException(function () {
            this.assertIdentical(null, undefined);
        });
        this.assertException(function () {
            this.assertIdentical(false, 0);
        });
    }

    function testAssertIdenticalMessage() {
        checkMessageMarker.call(this, function () {
            this.assertIdentical(1, "1", "marker");
        });
    }

    function testAssertNotIdenticalPositive() {
        this.assertNotIdentical("1", 1);
        this.assertNotIdentical(undefined, null);
        this.assertNotIdentical(1, true);
        var obj1 = {};
        var obj2 = {};
        this.assertNotIdentical(obj1, obj2);
    }
        
    function testAssertNotIdenticalNegative() {
        this.assertException(function () {
            this.assertNotIdentical(1, 1);
        });
        this.assertException(function () {
            this.assertNotIdentical(null, null);
        });
        this.assertException(function () {
            this.assertNotIdentical(undefined, undefined);
        });
        var obj = {};
        this.assertException(function () {
            this.assertNotIdentical(obj, obj);
        });
    }

    function testAssertNotIdenticalMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotIdentical(1, 1, "marker");
        });
    }

    function testAssertEqualPositive() {
        this.assertEqual(1, "1");
        this.assertEqual({ a: 1, b: [ 2, 3 ] }, { a: 1, b: [ 2, 3 ] });
    }

    function testAssertEqualNegative() {
        this.assertException(function () {
            this.assertEqual("2", 1);
        });
        this.assertException(function () {
            this.assertEqual({}, null);
        });
        this.assertException(function () {
            this.assertEqual(undefined, null);
        });
    }

    function testAssertEqualMessage() {
        checkMessageMarker.call(this, function () {
            this.assertEqual("2", 1, "marker");
        });
    }

    function testAssertNotEqualPositive() {
        this.assertNotEqual(1, "2");
        this.assertNotEqual(null, {});
    }
        
    function testAssertNotEqualNegative() {
        this.assertException(function () {
            this.assertNotEqual("2", 2);
        });
        this.assertException(function () {
            this.assertNotEqual({ a: 1, b: [ 2, 3 ] }, { a: 1, b: [ 2, 3 ] });
        });
    }

    function testAssertNotEqualMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotEqual("2", 2, "marker");
        });
    }

    function testAssertMatchPositive() {
        this.assertMatch(/es/, "test");
    }

    function testAssertMatchNegative() {
        this.assertException(function () {
            this.assertMatch(/foo/, "test");
        });
    }

    function testAssertMatchMessage() {
        checkMessageMarker.call(this, function () {
            this.assertMatch(/foo/, "test", "marker");
        });
    }
    
    function testAssertNotMatchPositive() {
        this.assertNotMatch(/foo/, "test");
    }

    function testAssertNotMatchNegative() {
        this.assertException(function () {
            this.assertNotMatch(/es/, "test");
        });
    }

    function testAssertNotMatchMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotMatch(/es/, "test", "marker");
        });
    }
    
    function testAssertTypeOfPositive() {
        this.assertTypeOf("string", "test");
    }

    function testAssertTypeOfNegative() {
        this.assertException(function () {
            this.assertTypeOf("number", "test");
        });
    }

    function testAssertTypeOfMessage() {
        checkMessageMarker.call(this, function () {
            this.assertTypeOf("number", "test", "marker");
        });
    }
    
    function testAssertNotTypeOfPositive() {
        this.assertNotTypeOf("string", 1);
    }

    function testAssertNotTypeOfNegative() {
        this.assertException(function () {
            this.assertNotTypeOf("number", 1);
        });
    }

    function testAssertNotTypeOfMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotTypeOf("number", 1, "marker");
        });
    }

    function testAssertInstanceOfPositive() {
        this.assertInstanceOf(String, new String("test"));
    }

    function testAssertInstanceOfNegative() {
        this.assertException(function () {
            this.assertInstanceOf(Number, {});
        });
    }

    function testAssertInstanceOfMessage() {
        checkMessageMarker.call(this, function () {
            this.assertInstanceOf(Number, {}, "marker");
        });
    }
    
    function testAssertNotInstanceOfPositive() {
        this.assertNotInstanceOf(String, []);
    }

    function testAssertNotInstanceOfNegative() {
        this.assertException(function () {
            this.assertNotInstanceOf(Number, new Number(1));
        });
    }

    function testAssertNotInstanceOfMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotInstanceOf(Number, new Number(1), "marker");
        });
    }

    function testAssertNullPositive() {
        this.assertNull(null);
    }

    function testAssertNullNegative() {
        this.assertException(function () {
            this.assertNull(1);
        });
    }

    function testAssertNullMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNull(1, "marker");
        });
    }

    function testAssertNotNullPositive() {
        this.assertNotNull(1);
    }

    function testAssertNotNullNegative() {
        this.assertException(function () {
            this.assertNotNull(null);
        });
    }

    function testAssertNotNullMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotNull(null, "marker");
        });
    }

    function testAssertUndefinedPositive() {
        this.assertUndefined(undefined);
    }

    function testAssertUndefinedNegative() {
        this.assertException(function () {
            this.assertUndefined(1);
        });
    }

    function testAssertUndefinedMessage() {
        checkMessageMarker.call(this, function () {
            this.assertUndefined(1, "marker");
        });
    }

    function testAssertNotUndefinedPositive() {
        this.assertNotUndefined(1);
    }

    function testAssertNotUndefinedNegative() {
        this.assertException(function () {
            this.assertNotUndefined(undefined);
        });
    }

    function testAssertNotUndefinedMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotUndefined(undefined, "marker");
        });
    }

    function testAssertNaNPositive() {
        this.assertNaN(NaN);
        this.assertNaN("test");
    }

    function testAssertNaNNegative() {
        this.assertException(function () {
            this.assertNaN(1);
        });
    }

    function testAssertNaNMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNaN(1, "marker");
        });
    }

    function testAssertNotNaNPositive() {
        this.assertNotNaN(1);
    }

    function testAssertNotNaNNegative() {
        this.assertException(function () {
            this.assertNotNaN(NaN);
        });
        this.assertException(function () {
            this.assertNotNaN("test");
        });
    }

    function testAssertNotNaNMessage() {
        checkMessageMarker.call(this, function () {
            this.assertNotNaN(NaN, "marker");
        });
    }

    function testFail() {
        this.assertException(function () {
            this.fail();
        });
    }

    function testFailMessage() {
        checkMessageMarker.call(this, function () {
            this.fail("marker");
        });
    }
}
//%>
