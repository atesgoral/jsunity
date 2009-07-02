<%@LANGUAGE="JavaScript"%>
<%
var fso = Server.CreateObject("Scripting.FileSystemObject");
var filePath = Server.MapPath("tap.txt");
var txts = fso.CreateTextFile(filePath);

txts.Write(Request.Form("tap"));
txts.Close();

Response.Redirect("tap.txt");
%> 
