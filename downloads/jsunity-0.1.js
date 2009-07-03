//<%
/**
 * jsUnity Universal JavaScript Testing Framework v0.1
 * http://code.google.com/p/jsunity/
 *
 * Copyright (c) 2009 Ates Goral
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
 
/**
 * Assert that the given Boolean expression evaluates to <code>true</code>
 *
 * @param expr The Boolean expression
 */
function assertTrue(expr) {
	if (!expr) {
		throw "Expression does not evaluate to true";
	}
}

/**
 * Assert that the given Boolean expression evaluates to <code>false</code>
 *
 * @param expr The Boolean expression
 */
function assertFalse(expr) {
	if (expr) {
		throw "Condition does not evaluate to false";
	}
}

/**
 * Assert that the given value matches what's expected
 *
 * @param expected The expected value
 * @param actual The actual given value
 */
function assertEquals(expected, actual) {
	if (expected !== actual) {
		throw "Actual value does not match what's expected: [expected] "
			+ expected + ", [actual] " + actual;
	}
}

/**
 * Assert that the given value doesn't match the given unexpected value
 *
 * @param unexpected The unexpected value
 * @param actual The actual given value
 */
function assertNotEquals(unexpected, actual) {
	if (unexpected === actual) {
		throw "Actual value matches the unexpected value: " + actual;
	}
}

/**
 * Assert that the given object is <code>null</code>
 *
 * @param object The given object
 */
function assertNull(object) {
	if (object !== null) {
		throw "Object is not null";
	}
}

/**
 * Assert that the given object is not <code>null</code>
 *
 * @param object The given object
 */
function assertNotNull(object) {
	if (object === null) {
		throw "Object is null";
	}
}

/**
 * Assert that the given object is <code>undefined</code>
 *
 * @param object The given object
 */
function assertUndefined(value) {
	if (value !== undefined) {
		throw "Value is not undefined";
	}
}

/**
 * Assert that the given object is not <code>undefined</code>
 *
 * @param object The given object
 */
function assertNotUndefined(value) {
	if (value === undefined) {
		throw "Value is undefined";
	}
}

/**
 * Assert that the given object is <code>NaN</code>
 *
 * @param object The given object
 */
function assertNaN(value) {
	if (!isNaN(value)) {
		throw "Value is not NaN";
	}
}

/**
 * Assert that the given object is not <code>NaN</code>
 *
 * @param object The given object
 */
function assertNotNaN(value) {
	if (isNaN(value)) {
		throw "Value is NaN";
	}
}

/**
 * Fail the test by throwing an exception
 */
function fail() {
	throw "Test failed";
}

(function () {
	function parseSuiteFunction(suite) {
		var tokens = /^function\s+.+?\{((?:[^}]*}?)+)}$/.exec(
			suite.toString().split(/[\r\n]/).join(" "));

		if (!tokens) {
			throw "Invalid function.";
		}

		var runnerBody = tokens[1];

		var ret = {
			runner: new Function("f", runnerBody + "eval(f).call();"),
			//name: "",
			tests: []
		};

		var fns = runnerBody.match(/function\s+[^(]+/g);

		if (fns) {
			for (var i = 0; i < fns.length; i++) {
				var tokens = /\s(.+)$/.exec(fns[i]);

				if (tokens) {
					var name = tokens[1];

					if (/^test/.test(name)) {
						ret.tests.push(name);
					} else if (/^setUp|tearDown$/.test(name)) {
						ret[name] = true;
					}
				}
			}
		}

		return ret;
	}

	function parseSuite(suite) {
		if (suite instanceof Function) {
			// functions inside function
			return parseSuiteFunction(suite);
		} else if (suite instanceof Array) {
			// array of test function names
			throw "Not implemented";
		} else if (suite instanceof Object) {
			// functions as properties
			throw "Not implemented";
		} else if (typeof suite === "string") {
			// source code of functions
			throw "Not implemented";
		} else {
			throw "Must be a function, array, object or string.";
		}
	}

	jsUnity = {
		log: function () {},

		error: function (s) { this.log("[ERROR] " + s); },

		run: function (s) {
			try {
				var suite = parseSuite(s);
			} catch (e) {
				this.error("Invalid test suite: " + e);
				return false;
			}

			var total = suite.tests.length;
			var passed = 0;

			this.log(total + " tests found");

			for (var i = 0; i < total; i++) {
				var test = suite.tests[i];

				try {
					if (suite.setUp) {
						suite.runner("setUp");
					}
					suite.runner(test); // suite.run(i)?
					if (suite.tearDown) {
						suite.runner("tearDown");
					}
					passed++;
					this.log("[PASSED] " + test);
				} catch (e) {
					if (suite.tearDown) {
						suite.runner("tearDown");
					}
					this.log("[FAILED] " + test + ": " + e);
				}
			}

			var failed = total - passed;

			this.log(passed + " tests passed");
			this.log(failed + " tests failed");

			return {
				total: total,
				passed: passed,
				failed: failed
			}
		}
	};
})();
//%>