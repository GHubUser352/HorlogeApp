@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: --- CONFIGURATION DYNAMIQUE ---
set "targetDir=%~dp0"
set "targetDir=%targetDir:~0,-1%"
for %%f in ("%targetDir%") do set "folderName=%%~nxf"

:: Formatage du nom de sauvegarde
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%h%dt:~10,2%m"
set "backupName=Backup_%folderName%_%timestamp%.zip"
set "backupPath=%USERPROFILE%\Desktop\%backupName%"

:: Couleurs ANSI
set "ESC="
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "CYAN=%ESC%[96m"
set "RESET=%ESC%[0m"

:: --- GESTION DES PRIVILÈGES ---
set "adminSuffix="
net session >nul 2>&1
if %errorLevel% == 0 (
    set "adminSuffix= (ADMIN)"
) else (
    echo %YELLOW%[RECOMMANDATION] Ce script n'est pas lancé en Administrateur.%RESET%
    set /p "runAsAdmin=Relancer en tant qu'Administrateur ? [y/N] : "
    if /i "!runAsAdmin!"=="Y" (
        powershell -Command "Start-Process '%~f0' -Verb RunAs"
        exit /b
    )
)

:MENU
cls
echo %CYAN%==================================================%RESET%
echo        MAINTENANCE : %folderName%%adminSuffix%
echo %CYAN%==================================================%RESET%
echo.
echo  [1] %YELLOW%CLEAR CACHE%RESET%   : node_modules, dist, lockfiles
echo  [2] %RED%RESET COMPLET%RESET% : Backup + Vider le dossier
echo  [3] QUITTER
echo.
set "choice=3"
set /p "choice=Votre choix [3] : "

if "%choice%"=="1" goto CLEAR_CACHE
if "%choice%"=="2" goto TOTAL_RESET
if "%choice%"=="3" exit /b
goto MENU

:CLEAR_CACHE
echo.
echo [%YELLOW%!%RESET%] Fermeture des processus (Node, Git)...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM git.exe >nul 2>&1

echo.
set "confirm=N"
set /p "confirm=Confirmer le CLEAR CACHE ? [y/N] : "
if /i "!confirm!" neq "Y" goto MENU

echo %YELLOW%Calcul de l'espace et suppression...%RESET%
powershell -Command "$size = (Get-ChildItem -Path '%targetDir%' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB; $f = @('node_modules', 'dist', 'package-lock.json'); foreach($item in $f){ if(Test-Path '%targetDir%\$item'){ Remove-Item -LiteralPath '\\?\%targetDir%\$item' -Recurse -Force -ErrorAction SilentlyContinue } }; Write-Host ('[OK] Environ ' + [math]::Round($size, 2) + ' Mo libérés.') -ForegroundColor Green"

echo.
echo %GREEN%[SUCCÈS] Cache nettoyé.%RESET%
pause
goto MENU

:TOTAL_RESET
echo.
echo %RED%[DANGER] Vous allez vider TOUT le contenu du dossier.%RESET%
set "confirm=N"
set /p "confirm=Êtes-vous ABSOLUMENT certain ? [y/N] : "
if /i "!confirm!" neq "Y" goto MENU

:: BACKUP OPTIONNELLE (Par défaut : Y)
echo.
set "doBackup=Y"
set /p "doBackup=Voulez-vous créer une sauvegarde .zip sur le Bureau ? [Y/n] : "
if /i "!doBackup!"=="Y" (
    echo %CYAN%Création de la sauvegarde...%RESET%
    powershell -Command "$files = Get-ChildItem -Path '%targetDir%\*' -Exclude '%~nx0'; if($files){ Compress-Archive -Path $files -DestinationPath '%backupPath%' -Force } else { Write-Warning 'Dossier vide, rien à sauvegarder.' }"
    if exist "%backupPath%" (echo %GREEN%Sauvegarde créée sur le Bureau.%RESET%)
)

:: SUPPRESSION DU CONTENU
echo %YELLOW%Nettoyage intégral du dossier...%RESET%
powershell -Command "Get-ChildItem -Path '%targetDir%' | Where-Object { $_.Name -ne '%~nx0' } | ForEach-Object { Remove-Item -LiteralPath ('\\?\' + $_.FullName) -Recurse -Force -ErrorAction SilentlyContinue }"

:: AUTO-SUPPRESSION DU SCRIPT ET NOTIFICATION FINALE (Par défaut : Y)
echo.
set "delSelf=Y"
set /p "delSelf=%RED%Voulez-vous supprimer ce script (uninstall.bat) ? [Y/n] : %RESET%"

if /i "!delSelf!"=="Y" (
    echo %YELLOW%Suppression finale et notification...%RESET%
    :: Le processus détaché supprime le fichier PUIS envoie la notification
    start /b "" powershell -Command "Start-Sleep -s 1; Remove-Item -Path '%~f0' -Force; [reflection.assembly]::loadwithpartialname('System.Windows.Forms'); $notify = new-object system.windows.forms.notifyicon; $notify.icon = [system.drawing.systemicons]::Information; $notify.visible = $true; $notify.showballoontip(3000, 'Désinstallation terminée', 'Le dossier %folderName% a été vidé et le script supprimé.', [system.windows.forms.tooltipicon]::Info); Start-Sleep -s 3"
    exit /b
)

echo %GREEN%Opération terminée. Le script est conservé.%RESET%
pause
goto MENU
