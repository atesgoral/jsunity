<%@LANGUAGE="JavaScript"%>
<% Response.Buffer = true; %>
<!--#include file="../jsunity.js"-->
<!--#include file="sampleTestSuite.js"-->
<% Response.Clear(); %>
<pre>
<%
jsUnity.log = function (s) { Response.Write(s + "<br/>"); }
jsUnity.run(sampleTestSuite);
%>
</pre>
