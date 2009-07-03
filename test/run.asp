<%@LANGUAGE="JavaScript"%>
<% Response.Buffer = true; %>
<!--#include file="../jsunity.js"-->
<!--#include file="assertion.js"-->
<!--#include file="core.js"-->
<% Response.Clear(); %>
<html>
<head>
    <title>Core + Assertion Test Suite Runner</title>
</head>
<body>
<%
jsUnity.log = function (s) { Response.Write("<div>" + s + "</div>"); }
jsUnity.run(AssertionTestSuite, CoreTestSuite);
%>
</body>
</html>
