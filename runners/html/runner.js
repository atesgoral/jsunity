function getQueryParams(qs) {
    function decode(s) {
        return decodeURIComponent(s.split("+").join(" "));
    }

    var params = {};
    var tokens;

    while (tokens = /[?&]?([^=]+)=([^&]*)/g.exec(qs)) {
        params[decode(tokens[1])] = decode(tokens[2]);
    }

    return params;
}

var postTargets = {
    rawResult: {
        name: "raw results",
        getData: function (data) {
            return data.results;
        }
    },
    xmlResult: {
        name: "XML results",
        getData: function (data) {
            return { results: resultsToXml(data.results) };
        }
    },
    tap: {
        name: "TAP data",
        getData: function (data) {
            return { tap: data.tap.join("\n") };
        }
    },
    log: {
        name: "log data",
        getData: function (data) {
            return { log: data.log.join("\n") };
        }
    }
};

function clearLog() {
    $("#log").html("Ready.");
}

function log(s, level) {
    $("#log").append("<div class=\"level_" + (level || "info") + "\">" + s
        + "</div>");
}

function testSuiteFetched(data, textStatus) {
    if (textStatus != "success") {
        log("", "error");
        return;
    }
    
    log("Test suite fetched");
    
    var testSuiteName = $("#testSuiteName").val();
    
    log("Compiling " + testSuiteName);

    var compile = new Function(data + "; return jsUnity.compile("
        + testSuiteName + ")");
    
    var suite = compile();

    if (!suite) {
        log("Invalid test suite", "error");
        return;
    }
    
    log("Test suite compiled");
    log(suite.tests.length + " tests found");
    
    var data = {
        log: [],
        tap: []
    };
    
    jsUnity.log.write = function (s) { data.log.push(s); };
    jsUnity.tap.write = function (s) { data.tap.push(s); };

    jsUnity.results.pass = function (index, name) {
        log("#" + index + " " + name + " passed", "debug");
    };

    jsUnity.results.fail = function (index, name, message) {
        log("#" + index + " " + name + " failed with message " + message,
            "debug");
    };

    jsUnity.results.end = function (passed, failed, duration) {
        log(passed + " passed");
        log(failed + " failed");
        log(duration + "ms elapsed");
    };

    log("Running test suite");

    data.results = jsUnity.run(suite);
    
    log("Done");
    log("Checking post targets");

    for (var targetName in postTargets) {
        var target = postTargets[targetName];
        var url = target.field.val();
        
        if (url) {
            log("Posting " + target.name + " to URL " + url);
            
            var data = target.getData(data);
            
            $.post(url, data, function (data, textStatus) {
                log("Post result: " + textStatus);
                log(data, "debug");
            });
        }
    }
}

function run() {
    var testSuiteUrl = $("#testSuiteUrl").val();
    
    $("#controls").addClass("running");

    log("Fetching test suite " + testSuiteUrl);

    $.get(testSuiteUrl, testSuiteFetched);
}

function stop() {
    $("#controls").removeClass("running");
}

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
            xml.elem("failure", { message: test.failureMessage })
                .elem("/testcase");
        }
    }

    xml.elem("/testsuite");

    return xml.join("");
}

function showMessage(s) {
}

function hideMessage() {
    //$("#message").addClass("hidden");
    $("#message").hide("blind");
}

function initialize() {
    try {
        $("#close").removeClass("hidden").click(hideMessage);
        
        $("span.input, span.select").each(function (idx, el) {
            var title = el.title;
            var id = $("input, select", el).get(0).id;
            var text = $("label[for='" + id + "']").html();

            $(el).tooltip({
                track: true,
                bodyHandler: function () {
                    return "<h3>" + text + "</h3>" + title
                        + "<hr/>Use the <strong>" + id + "</strong>"
                        + " parameter to specify this through the query string.";
                }
            })
        });
        $(".mandatory label").tooltip();
        
        $("#run").click(run);
        $("#stop").click(stop);

        var query = getQueryParams(document.location.search);

        $("input[type='text']").each(function (idx, e) {
            if (query[e.id]) {
                $(e).val(query[e.id]);
            };
        });
        
        if (query.autoRun) {
            $("#autoRun").attr("checked", "true");
        }

        for (var targetName in postTargets) {
            postTargets[targetName].field = $("#" + targetName + "Url");
        }

        clearLog();
        
        if ($("#autoRun").attr("checked")) {
            run();
        }
        
        if (!/https?:/.test(document.location.protocol)) {
            throw "AJAX is used for fetching test suites and submitting results. It is recommended that you access this page through HTTP or HTTPS.";
        }

        $("#message").addClass("hidden");
    } catch (e) {
        $("#txt").html(e);
    }
}

$(document).ready(initialize);

