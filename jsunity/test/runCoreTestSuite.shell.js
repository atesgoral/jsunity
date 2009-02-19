load('../jsunity.js');
load('coreTestSuite.js');

jsUnity.log = function (s) { print(s) };
jsUnity.run(coreTestSuite);
