load('../jsunity.js');
load('jsUnityTestSuite.js');

jsUnity.log = function (s) { print(s) };
jsUnity.run(jsUnityTestSuite);
