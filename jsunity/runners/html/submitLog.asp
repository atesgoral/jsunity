<%@LANGUAGE="JavaScript"%>
<%
var fso = Server.CreateObject("Scripting.FileSystemObject");
var filePath = Server.MapPath("log.txt");
var txts = fso.CreateTextFile(filePath);

txts.Write(Request.Form("log"));
txts.Close();

Response.Redirect("log.txt");
%> 
