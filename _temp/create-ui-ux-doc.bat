@echo off
setlocal enabledelayedexpansion

REM Create directories
mkdir _temp\ui-ux-docs\content 2>nul

REM Create the output file with a title
set "OUTPUT=_temp\ui-ux-docs\ui-ux-documentation.html"
echo ^<!DOCTYPE html^> > "%OUTPUT%"
echo ^<html^> >> "%OUTPUT%"
echo ^<head^> >> "%OUTPUT%"
echo ^<meta charset="UTF-8"^> >> "%OUTPUT%"
echo ^<title^>BillingPeriodAllocator UI/UX Documentation^</title^> >> "%OUTPUT%"
echo ^<style^> >> "%OUTPUT%"
echo body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; } >> "%OUTPUT%"
echo pre { background-color: #f5f5f5; padding: 10px; overflow-x: auto; border-radius: 4px; } >> "%OUTPUT%"
echo code { font-family: 'Courier New', monospace; } >> "%OUTPUT%"
echo h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 10px; } >> "%OUTPUT%"
echo .file-header { background-color: #e0e0e0; padding: 10px; margin-top: 30px; border-radius: 4px 4px 0 0; } >> "%OUTPUT%"
echo .file-content { margin-top: 0; border-radius: 0 0 4px 4px; } >> "%OUTPUT%"
echo hr { margin: 30px 0; } >> "%OUTPUT%"
echo @media print { pre { white-space: pre-wrap; } .page-break { page-break-before: always; } } >> "%OUTPUT%"
echo ^</style^> >> "%OUTPUT%"
echo ^</head^> >> "%OUTPUT%"
echo ^<body^> >> "%OUTPUT%"
echo ^<h1^>BillingPeriodAllocator UI/UX Documentation^</h1^> >> "%OUTPUT%"
echo ^<p^>Generated on %date% %time%^</p^> >> "%OUTPUT%"
echo ^<h2^>Table of Contents^</h2^> >> "%OUTPUT%"
echo ^<ol^> >> "%OUTPUT%"
echo ^<li^>^<a href="#theme-configuration"^>Theme Configuration^</a^>^</li^> >> "%OUTPUT%"
echo ^<li^>^<a href="#css-styles"^>CSS Styles^</a^>^</li^> >> "%OUTPUT%"
echo ^<li^>^<a href="#ui-components"^>UI Components^</a^>^</li^> >> "%OUTPUT%"
echo ^<li^>^<a href="#layout-components"^>Layout Components^</a^>^</li^> >> "%OUTPUT%"
echo ^<li^>^<a href="#all-components"^>All Components^</a^>^</li^> >> "%OUTPUT%"
echo ^<li^>^<a href="#configuration-files"^>Configuration Files^</a^>^</li^> >> "%OUTPUT%"
echo ^</ol^> >> "%OUTPUT%"
echo ^<hr^> >> "%OUTPUT%"

REM Function to append file with proper HTML formatting
call :AppendFile "src\styles\themes.css" "%OUTPUT%" "Theme Configuration"
call :AppendCssFiles "%OUTPUT%" "CSS Styles"
call :AppendUiComponents "%OUTPUT%" "UI Components"
call :AppendLayoutComponents "%OUTPUT%" "Layout Components"
call :AppendAllComponents "%OUTPUT%" "All Components"
call :AppendConfigFiles "%OUTPUT%" "Configuration Files"

echo ^</body^> >> "%OUTPUT%"
echo ^</html^> >> "%OUTPUT%"

echo Documentation generated: %OUTPUT%
echo Please open this HTML file in your browser and print to PDF.
start "" "%OUTPUT%"

goto :EOF

:AppendFile
set "file=%~1"
set "output=%~2"
set "section=%~3"

if not "%section%"=="" (
  echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"
)

echo ^<div class="file-header"^>File: %file%^</div^> >> "%output%"
echo ^<pre class="file-content"^>^<code^> >> "%output%"

for /f "delims=" %%a in ('type "%file%"') do (
    set "line=%%a"
    set "line=!line:<=&lt;!"
    set "line=!line:>=&gt;!"
    echo !line! >> "%output%"
)

echo ^</code^>^</pre^> >> "%output%"
echo ^<hr^> >> "%output%"
exit /b 0

:AppendCssFiles
set "output=%~1"
set "section=%~2"

echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"

for %%f in (base.css components.css forms.css animations.css calendar.css globals.css) do (
    call :AppendFile "src\styles\%%f" "%output%" ""
)
exit /b 0

:AppendUiComponents
set "output=%~1"
set "section=%~2"

echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"

for %%f in (src\components\ui\*.tsx) do (
    call :AppendFile "%%f" "%output%" ""
)
exit /b 0

:AppendLayoutComponents
set "output=%~1"
set "section=%~2"

echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"

for %%f in (theme-toggle.tsx language-toggle.tsx header.tsx footer.tsx force-dark-theme.tsx custom-cookie-banner.tsx) do (
    call :AppendFile "src\components\%%f" "%output%" ""
)
exit /b 0

:AppendAllComponents
set "output=%~1"
set "section=%~2"

echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"

REM Create a temporary file to store component files that should be included
set "tempfile=%temp%\components_list.txt"
dir /b src\components\*.tsx > "%tempfile%"

REM Remove already included layout components
findstr /v /i /c:"theme-toggle.tsx" /c:"language-toggle.tsx" /c:"header.tsx" /c:"footer.tsx" /c:"force-dark-theme.tsx" /c:"custom-cookie-banner.tsx" "%tempfile%" > "%tempfile%.tmp"
move /y "%tempfile%.tmp" "%tempfile%" > nul

REM Process the remaining components
for /f "delims=" %%f in ('type "%tempfile%"') do (
    call :AppendFile "src\components\%%f" "%output%" ""
)

del "%tempfile%" > nul
exit /b 0

:AppendConfigFiles
set "output=%~1"
set "section=%~2"

echo ^<h2 id="%section:-= %" class="page-break"^>%section%^</h2^> >> "%output%"

call :AppendFile "tailwind.config.js" "%output%" ""
call :AppendFile "postcss.config.mjs" "%output%" ""
call :AppendFile "components.json" "%output%" ""

exit /b 0 
