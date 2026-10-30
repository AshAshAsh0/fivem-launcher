; ตัวติดตั้ง FiveM Launcher แบบ Inno Setup
; สร้างผ่าน GitHub Actions:  iscc /DAppVer=2.3.0 /DSrcExe="..\out\FiveM Launcher.exe" FiveMLauncher.iss

#ifndef AppVer
  #define AppVer "0.0.0"
#endif
#ifndef SrcExe
  #define SrcExe "..\out\FiveM Launcher.exe"
#endif
#define AppName "FiveM Launcher"
#define AppExe "FiveM Launcher.exe"

[Setup]
AppId={{6F3B8C2E-4D7A-4B1E-9A55-2C8E7F1D3A90}
AppName={#AppName}
AppVersion={#AppVer}
AppVerName={#AppName} {#AppVer}
AppPublisher=FiveM Launcher
AppPublisherURL=https://github.com/AshAshAsh0/fivem-launcher
AppSupportURL=https://github.com/AshAshAsh0/fivem-launcher/issues
AppUpdatesURL=https://ashashash0.github.io/fivem-launcher/
VersionInfoVersion={#AppVer}.0
VersionInfoDescription={#AppName} Setup
VersionInfoProductName={#AppName}
; ติดตั้งเฉพาะผู้ใช้ ไม่ต้องใช้สิทธิ์ Admin (ที่เดียวกับเวอร์ชันก่อนหน้า จึงอัปเดตทับได้)
PrivilegesRequired=lowest
DefaultDirName={localappdata}\Programs\{#AppName}
DisableProgramGroupPage=yes
UsePreviousAppDir=yes
LicenseFile=license.txt
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\{#AppExe}
UninstallDisplayName={#AppName}
WizardStyle=modern
OutputDir=..\out
OutputBaseFilename=FiveM-Launcher-Setup
Compression=lzma2/max
SolidCompression=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
CloseApplications=force
RestartApplications=no
AppMutex=Local\FiveMLauncherSingleInstance

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[InstallDelete]
; ตัวถอนการติดตั้งของเวอร์ชันก่อนหน้า (ตัวติดตั้งแบบเก่า)
Type: files; Name: "{app}\Uninstall.exe"

[Files]
Source: "{#SrcExe}"; DestDir: "{app}"; DestName: "{#AppExe}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Registry]
; ลบรายการถอนการติดตั้งของตัวติดตั้งแบบเก่า (กันขึ้นซ้ำ 2 รายการใน Settings > Apps)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Uninstall\FiveMLauncher"; Flags: deletekey dontcreatekey

[Run]
Filename: "{app}\{#AppExe}"; Description: "{cm:LaunchProgram,{#AppName}}"; Flags: nowait postinstall skipifsilent
; อัปเดตอัตโนมัติจากในโปรแกรม (/silent) → เปิดโปรแกรมกลับมาให้เอง
Filename: "{app}\{#AppExe}"; Flags: nowait; Check: WizardSilent

[UninstallDelete]
; แคชของ WebView2
Type: filesandordirs; Name: "{localappdata}\{#AppName}"

[Code]
const
  WV2Guid = '{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function HasWebView2(): Boolean;
var v: String;
begin
  Result :=
    (RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\' + WV2Guid, 'pv', v) and (v <> '') and (v <> '0.0.0.0')) or
    (RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\' + WV2Guid, 'pv', v) and (v <> '') and (v <> '0.0.0.0')) or
    (RegQueryStringValue(HKCU, 'Software\Microsoft\EdgeUpdate\Clients\' + WV2Guid, 'pv', v) and (v <> '') and (v <> '0.0.0.0'));
end;

function InitializeSetup(): Boolean;
var code: Integer;
begin
  Result := True;
  if (not WizardSilent()) and (not HasWebView2()) then
  begin
    if MsgBox('FiveM Launcher needs the Microsoft Edge WebView2 Runtime, which is not installed on this computer.'
      + #13#10#13#10 + 'Click Yes to open the download page (run this Setup again afterwards), or No to continue anyway.',
      mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://go.microsoft.com/fwlink/p/?LinkId=2124703', '', '', SW_SHOWNORMAL, ewNoWait, code);
      Result := False;
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if (CurUninstallStep = usPostUninstall) and (not UninstallSilent()) then
    if MsgBox('Also delete your saved servers and settings?', mbConfirmation, MB_YESNO or MB_DEFBUTTON2) = IDYES then
      DelTree(ExpandConstant('{userappdata}\{#AppName}'), True, True, True);
end;
