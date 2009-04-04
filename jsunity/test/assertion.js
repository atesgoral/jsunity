//<%
var a = {};
jsUnity.attachAssertions(a);

function AssertionTestSuite() {
    function checkMessageMarker(fn) {
        try {
            fn();
        } catch (e) {
            a.assertMatch(/marker/, e);
        }
    }

    function testAssertExceptionPositive() {
        a.assertException(function () {
            throw 1;
        });
    }

    function testAssertExceptionNegative() {
        a.assertException(function () {
            a.assertException(function () {});
        });
    }

    function testAssertExceptionMessage() {
        checkMessageMarker(function () {
            a.assertException(function () {}, "marker");
        });
    }
    
    function testAssertTruePositive() {
        a.assertTrue(true);
    }

    function testAssertTrueNegative() {
        a.assertException(function () {
            a.assertTrue(false);
        });
    }

    function testAssertTrueMessage() {
        checkMessageMarker(function () {
            a.assertTrue(false, "marker");
        });
    }

    function testAssertFalsePositive() {
        a.assertFalse(false);
    }

    function testAssertFalseNegative() {
        a.assertException(function () {
            a.assertFalse(true);
        });
    }

    function testAssertFalseMessage() {
        checkMessageMarker(function () {
            a.assertFalse(true, "marker");
        });
    }
    
    function testAssertIdenticalPositive() {
        a.assertIdentical(1, 1);
        a.assertIdentical(null, null);
        a.assertIdentical(undefined, undefined);
        var obj = {};
        a.assertIdentical(obj, obj);
    }

    function testAssertIdenticalNegative() {
        a.assertException(function () {
            a.assertIdentical(1, "1");
        });
        a.assertException(function () {
            a.assertIdentical(null, undefined);
        });
        a.assertException(function () {
            a.assertIdentical(false, 0);
        });
    }

    function testAssertIdenticalMessage() {
        checkMessageMarker(function () {
            a.assertIdentical(1, "1", "marker");
        });
    }

    function testAssertNotIdenticalPositive() {
        a.assertNotIdentical("1", 1);
        a.assertNotIdentical(undefined, null);
        a.assertNotIdentical(1, true);
        var obj1 = {};
        var obj2 = {};
        a.assertNotIdentical(obj1, obj2);
    }
        
    function testAssertNotIdenticalNegative() {
        a.assertException(function () {
            a.assertNotIdentical(1, 1);
        });
        a.assertException(function () {
            a.assertNotIdentical(null, null);
        });
        a.assertException(function () {
            a.assertNotIdentical(undefined, undefined);
        });
        var obj = {};
        a.assertException(function () {
            a.assertNotIdentical(obj, obj);
        });
    }

    function testAssertNotIdenticalMessage() {
        checkMessageMarker(function () {
            a.assertNotIdentical(1, 1, "marker");
        });
    }

    function testAssertEqualPositive() {
        a.assertEqual(1, "1");
        a.assertEqual({ a: 1, b: [ 2, 3 ] }, { a: 1, b: [ 2, 3 ] });
    }

    function testAssertEqualNegative() {
        a.assertException(function () {
            a.assertEqual("2", 1);
        });
        a.assertException(function () {
            a.assertEqual({}, null);
        });
        a.assertException(function () {
            a.assertEqual(undefined, null);
        });
    }

    function testAssertEqualMessage() {
        checkMessageMarker(function () {
            a.assertEqual("2", 1, "marker");
        });
    }

    function testAssertNotEqualPositive() {
        a.assertNotEqual(1, "2");
        a.assertNotEqual(null, {});
    }
        
    function testAssertNotEqualNegative() {
        a.assertException(function () {
            a.assertNotEqual("2", 2);
        });
        a.assertException(function () {
            a.assertNotEqual({ a: 1, b: [ 2, 3 ] }, { a: 1, b: [ 2, 3 ] });
        });
    }

    function testAssertNotEqualMessage() {
        checkMessageMarker(function () {
            a.assertNotEqual("2", 2, "marker");
        });
    }

    function testAssertMatchPositive() {
        a.assertMatch(/es/, "test");
    }

    function testAssertMatchNegative() {
        a.assertException(function () {
            a.assertMatch(/foo/, "test");
        });
    }

    function testAssertMatchMessage() {
        checkMessageMarker(function () {
            a.assertMatch(/foo/, "test", "marker");
        });
    }
    
    function testAssertNotMatchPositive() {
        a.assertNotMatch(/foo/, "test");
    }

    function testAssertNotMatchNegative() {
        a.assertException(function () {
            a.assertNotMatch(/es/, "test");
        });
    }

    function testAssertNotMatchMessage() {
        checkMessageMarker(function () {
            a.assertNotMatch(/es/, "test", "marker");
        });
    }
    
    function testAssertTypeOfPositive() {
        a.assertTypeOf("string", "test");
    }

    function testAssertTypeOfNegative() {
        a.assertException(function () {
            a.assertTypeOf("number", "test");
        });
    }

    function testAssertTypeOfMessage() {
        checkMessageMarker(function () {
            a.assertTypeOf("number", "test", "marker");
        });
    }
    
    function testAssertNotTypeOfPositive() {
        a.assertNotTypeOf("string", 1);
    }

    function testAssertNotTypeOfNegative() {
        a.assertException(function () {
            a.assertNotTypeOf("number", 1);
        });
    }

    function testAssertNotTypeOfMessage() {
        checkMessageMarker(function () {
            a.assertNotTypeOf("number", 1, "marker");
        });
    }

    function testAssertInstanceOfPositive() {
        a.assertInstanceOf(String, new String("test"));
    }

    function testAssertInstanceOfNegative() {
        a.assertException(function () {
            a.assertInstanceOf(Number, {});
        });
    }

    function testAssertInstanceOfMessage() {
        checkMessageMarker(function () {
            a.assertInstanceOf(Number, {}, "marker");
        });
    }
    
    function testAssertNotInstanceOfPositive() {
        a.assertNotInstanceOf(String, []);
    }

    function testAssertNotInstanceOfNegative() {
        a.assertException(function () {
            a.assertNotInstanceOf(Number, new Number(1));
        });
    }

    function testAssertNotInstanceOfMessage() {
        checkMessageMarker(function () {
            a.assertNotInstanceOf(Number, new Number(1), "marker");
        });
    }

    function testAssertNullPositive() {
        a.assertNull(null);
    }

    function testAssertNullNegative() {
        a.assertException(function () {
            a.assertNull(1);
        });
    }

    function testAssertNullMessage() {
        checkMessageMarker(function () {
            a.assertNull(1, "marker");
        });
    }

    function testAssertNotNullPositive() {
        a.assertNotNull(1);
    }

    function testAssertNotNullNegative() {
        a.assertException(function () {
            a.assertNotNull(null);
        });
    }

    function testAssertNotNullMessage() {
        checkMessageMarker(function () {
            a.assertNotNull(null, "marker");
        });
    }

    function testAssertUndefinedPositive() {
        a.assertUndefined(undefined);
    }

    function testAssertUndefinedNegative() {
        a.assertException(function () {
            a.assertUndefined(1);
        });
    }

    function testAssertUndefinedMessage() {
        checkMessageMarker(function () {
            a.assertUndefined(1, "marker");
        });
    }

    function testAssertNotUndefinedPositive() {
        a.assertNotUndefined(1);
    }

    function testAssertNotUndefinedNegative() {
        a.assertException(function () {
            a.assertNotUndefined(undefined);
        });
    }

    function testAssertNotUndefinedMessage() {
        checkMessageMarker(function () {
            a.assertNotUndefined(undefined, "marker");
        });
    }

    function testAssertNaNPositive() {
        a.assertNaN(NaN);
        a.assertNaN("test");
    }

    function testAssertNaNNegative() {
        a.assertException(function () {
            a.assertNaN(1);
        });
    }

    function testAssertNaNMessage() {
        checkMessageMarker(function () {
            a.assertNaN(1, "marker");
        });
    }

    function testAssertNotNaNPositive() {
        a.assertNotNaN(1);
    }

    function testAssertNotNaNNegative() {
        a.assertException(function () {
            a.assertNotNaN(NaN);
        });
        a.assertException(function () {
            a.assertNotNaN("test");
        });
    }

    function testAssertNotNaNMessage() {
        checkMessageMarker(function () {
            a.assertNotNaN(NaN, "marker");
        });
    }

    function testFail() {
        a.assertException(function () {
            a.fail();
        });
    }

    function testFailMessage() {
        checkMessageMarker(function () {
            a.fail("marker");
        });
    }
}
//%>
