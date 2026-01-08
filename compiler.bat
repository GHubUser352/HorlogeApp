@echo off
chcp 65001 >nul
echo ==========================================
echo  Compilation Horloge Temporelle
echo ==========================================
echo.
echo Installation des dépendances...
call npm install
if errorlevel 1 (
    echo ERREUR lors de l'installation !
    pause
    exit /b 1
)
echo.
echo Compilation de l'executable...
call npm run build
if errorlevel 1 (
    echo ERREUR lors de la compilation !
    pause
    exit /b 1
)
echo.
echo ==========================================
echo  BUILD TERMINE !
echo ==========================================
echo.
echo Fichiers dans le dossier "dist"
echo.
pause