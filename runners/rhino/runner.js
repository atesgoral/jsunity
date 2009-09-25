function resultsToXml(results) {
    function xmlEscape(s) {
        return s.replace(/[<>&"]/g, function (c) {
            return "&"
                + { "<": "lt", ">": "gt", "&": "amp", "\"": "quot" }[c]
                + ";";
        });
    }

    var xml = [ "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" ];

    xml.text = function (s) {
        Array.prototype.push.call(this, s);
        return this;
    };
    
    xml.elem = function (tagName, attrs, close) {
        this.text("<").text(tagName);

        for (var a in attrs || {}) {
            this.text(" ").text(a).text("=\"")
                .text(xmlEscape(String(attrs[a]))).text("\"");
        }

        close && this.text("/");
        this.text(">\n");

        return this;
    };

    xml.elem("testsuite", {
        errors: 0,
        failures: results.failed,
        name: results.suiteName,
        tests: results.total,
        time: results.duration
    });

    for (var i = 0; i < results.tests.length; i++) {
        var test = results.tests[i];

        xml.elem("testcase", {
            name: test.name,
            time: test.duration
        }, test.passed);

        if (!test.passed) {
            xml.elem("failure", { message: test.failureMessage }, true)
                .elem("/testcase");
        }
    }

    xml.elem("/testsuite");

    return xml.join("");
}

load(arguments[0]);

load("../../jsunity.js");

jsUnity.log = print;
jsUnity.attachAssertions(this);

var results = jsUnity.run(testSuite);

if (results) {
    print(resultsToXml(results));
}
