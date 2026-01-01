@echo off
echo.
echo ========================================
echo   LIMPIEZA Y REINICIO DE LA APP
echo ========================================
echo.

echo [1/3] Limpiando cache de Next.js...
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache de .next eliminada
) else (
    echo ✓ No hay cache de .next
)
echo.

echo [2/3] Limpiando cache de node_modules...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Cache de node_modules eliminada
) else (
    echo ✓ No hay cache de node_modules
)
echo.

echo [3/3] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo   SERVIDOR INICIANDO...
echo ========================================
echo.
echo Abre en tu navegador: http://localhost:3001
echo Presiona Ctrl+C para detener el servidor
echo.

npm run dev
