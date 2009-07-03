<%@LANGUAGE="JavaScript"%>
<%
var fso = Server.CreateObject("Scripting.FileSystemObject");
var filePath = Server.MapPath("results.xml");
var txts = fso.CreateTextFile(filePath);

txts.Write(Request.Form("results"));
txts.Close();

Response.Redirect("results.xml");
%> 
