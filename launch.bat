@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

:: --- CONFIGURATION ---
set "appTitle=Horloge Temporelle"
:: Mise à jour de l'URL selon votre demande
set "installUrl=https://github.com/GHubUser352/HorlogeAppInstall/"

:: Activation des couleurs ANSI
reg add "HKEY_CURRENT_USER\Console" /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1

:: Couleurs
set "ESC="
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "CYAN=%ESC%[96m"
set "MAGENTA=%ESC%[95m"
set "RESET=%ESC%[0m"

:MENU
cls
echo %CYAN%==================================================%RESET%
echo        %MAGENTA%CENTRE DE CONTRÔLE : %appTitle%%RESET%
echo %CYAN%==================================================%RESET%
echo.
echo  [1] %GREEN%LANCER L'APPLICATION%RESET%
echo  [2] %CYAN%METTRE À JOUR%RESET% (Update.bat)
echo  [3] %YELLOW%RÉINSTALLER%RESET% (Lien externe / Install.bat)
echo  [4] %RED%DÉSINSTALLER%RESET% (Uninstall.bat)
echo  [5] Quitter
echo.
set "choice=1"
set /p "choice=Votre choix [1-5] (Défaut: 1) : "

if "!choice!"=="1" goto START_APP
if "!choice!"=="2" goto UPDATE_APP
if "!choice!"=="3" goto REINSTALL_MENU
if "!choice!"=="4" goto UNINSTALL_APP
if "!choice!"=="5" exit /b
goto MENU

:START_APP
cls
echo [%GREEN%*%RESET%] Lancement de l'application...
echo %YELLOW%(Gardez cette console ouverte pour voir les logs)%RESET%
echo %CYAN%(Fermez la fenêtre de l'app pour revenir ici)%RESET%
echo.

call npm start

echo.
echo %CYAN%--------------------------------------------------%RESET%
echo  L'application a été fermée.
echo  [1] %GREEN%Relancer%RESET%
echo  [2] Retour au Menu Principal
echo.
set "postChoice=1"
set /p "postChoice=Action [1/2] : "
if "!postChoice!"=="1" goto START_APP
goto MENU

:REINSTALL_MENU
cls
echo %YELLOW%==================================================%RESET%
echo        RÉINSTALLATION
echo %YELLOW%==================================================%RESET%
echo.
echo  [1] Lancer l'installateur local (install.bat)
echo  [2] Télécharger via l'URL (GitHub)
echo  [3] Retour
echo.
set "reChoice=1"
set /p "reChoice=Choix [1-3] : "

if "!reChoice!"=="1" (
    if exist "install.bat" ( call "install.bat" ) else ( echo %RED%Fichier local introuvable.%RESET% & pause )
)
if "!reChoice!"=="2" (
    echo [%CYAN%*%RESET%] Ouverture de la page GitHub...
    start %installUrl%
    pause
)
goto MENU

:UPDATE_APP
cls
if exist "update.bat" ( call "update.bat" ) else ( echo %RED%Update.bat introuvable.%RESET% & pause )
goto MENU

:UNINSTALL_APP
cls
if exist "uninstall.bat" ( call "uninstall.bat" ) else ( echo %RED%Uninstall.bat introuvable.%RESET% & pause )
goto MENU