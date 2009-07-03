load("../jsunity.js");
load("assertion.js");
load("core.js");

jsUnity.log = function (s) { print(s); };
jsUnity.run(AssertionTestSuite, CoreTestSuite);
