load('../jsunity.js');
load('sampleTestSuite.js');

jsUnity.log = function (s) { print(s) };
jsUnity.run(sampleTestSuite);
