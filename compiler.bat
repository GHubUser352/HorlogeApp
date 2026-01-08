@echo off
chcp 65001 >nul
cls
echo ==========================================
echo   COMPILATION - Horloge Temporelle
echo ==========================================
echo.

if not exist node_modules (
    echo Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERREUR: Installation échouée !
        pause
        exit /b 1
    )
)

echo.
echo Compilation en cours...
call npm run build

if errorlevel 1 (
    echo.
    echo ERREUR: Compilation échouée !
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   BUILD TERMINE !
echo ==========================================
echo.
echo Fichiers .exe dans le dossier "dist"
echo Pour lancer l'application, utilisez "lancer.bat"
echo.
pause