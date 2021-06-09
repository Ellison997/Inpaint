Set WshShell=WScript.CreateObject("WScript.Shell")
WshShell.AppActivate "hh"
for i=1 to 33
WScript.Sleep 200
WshShell.SendKeys "^v"
WshShell.SendKeys "%s"
Next