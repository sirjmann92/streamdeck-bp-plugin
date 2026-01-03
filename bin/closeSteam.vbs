Set shell = CreateObject("WScript.Shell")
If shell.AppActivate("Steam") Then
    WScript.Sleep 100
    shell.SendKeys "%{F4}"
End If
