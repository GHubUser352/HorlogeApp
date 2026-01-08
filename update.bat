@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul

set "appTitle=Horloge Temporelle"

:: Couleurs ANSI
set "ESC="
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"
set "RED=%ESC%[91m"
set "GREEN=%ESC%[92m"
set "YELLOW=%ESC%[93m"
set "CYAN=%ESC%[96m"
set "RESET=%ESC%[0m"

cls
echo %CYAN%==================================================%RESET%
echo        MISE À JOUR AUTOMATIQUE : %appTitle%
echo %CYAN%==================================================%RESET%
echo.

:: --- 1. SÉCURITÉ : FERMETURE DE L'APP ---
:: Indispensable pour déverrouiller les fichiers .exe et .node
echo [%YELLOW%!%RESET%] Arrêt des processus actifs...
taskkill /F /IM electron.exe /T >nul 2>&1

:: --- 2. SYNCHRONISATION SILENCIEUSE ---
echo [%CYAN%*%RESET%] Comparaison avec GitHub...
git fetch origin main >nul 2>&1

:: Vérification si changement nécessaire
for /f %%i in ('git rev-parse HEAD') do set LOCAL_HASH=%%i
for /f %%i in ('git rev-parse @{u}') do set REMOTE_HASH=%%i

if "%LOCAL_HASH%"=="%REMOTE_HASH%" (
    echo %GREEN%[OK] Déjà à jour.%RESET%
    timeout /t 2 >nul
    exit /b
)

echo [%YELLOW%!%RESET%] Mise à jour détectée. Synchronisation...

:: Nettoie les fichiers locaux non présents sur GitHub (Suppression des anciens fichiers)
git clean -fd >nul 2>&1

:: Force le remplacement par les nouveaux fichiers
git reset --hard origin/main >nul 2>&1

if !errorlevel! neq 0 (
    echo %RED%[ERREUR] Échec de la synchronisation. Vérifiez votre connexion.%RESET%
    pause & exit /b
)

:: --- 3. MAINTENANCE DÉPENDANCES ---
echo [%CYAN%*%RESET%] Mise à jour des modules (Silencieux)...
:: npm install sans afficher tout le baratin de téléchargement
call npm install --no-audit --no-fund --loglevel error

echo [%CYAN%*%RESET%] Re-compilation des sources...
call npm run build >nul 2>&1

:: --- FIN ---
echo.
echo %GREEN%==================================================%RESET%
echo        SYSTÈME MIS À JOUR AVEC SUCCÈS
echo %GREEN%==================================================%RESET%
echo.
timeout /t 4 >nul