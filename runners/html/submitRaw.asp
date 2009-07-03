<%@LANGUAGE="JavaScript"%>
<%
var fso = Server.CreateObject("Scripting.FileSystemObject");
var filePath = Server.MapPath("results.txt");
var txts = fso.CreateTextFile(filePath);

txts.Write(Request.Form("suiteName"));
txts.Close();

Response.Redirect("results.txt");
%> 
