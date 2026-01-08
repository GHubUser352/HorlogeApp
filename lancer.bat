@echo off
cls
echo ==========================================
echo   LANCEMENT - Horloge Temporelle
echo ==========================================
echo.
echo Demarrage de l'application...
echo.

if not exist node_modules (
    echo ERREUR: Dependances manquantes !
    echo Veuillez lancer "compiler.bat" d'abord.
    echo.
    pause
    exit /b 1
)

call npm start