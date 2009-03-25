load("../jsunity.js");
load("assertionTestSuite.js");
load("coreTestSuite.js");

jsUnity.log = function (s) { print(s); };
jsUnity.run(AssertionTestSuite, CoreTestSuite);
