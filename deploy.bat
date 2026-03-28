@echo off
REM Deploy Supabase Edge Function via REST API
REM Requer token de acesso do Supabase

setlocal enabledelayedexpansion

set "PROJECT_ID=buavxdpzdckkhtzdggnq"
set "FUNCTION_NAME=create-user"
set "FUNCTION_FILE=supabase\functions\create-user\index.ts"

if not exist "%FUNCTION_FILE%" (
    echo Error: Arquivo nao encontrado: %FUNCTION_FILE%
    exit /b 1
)

if not defined SUPABASE_ACCESS_TOKEN (
    echo.
    echo ==================================================
    echo ERROR: SUPABASE_ACCESS_TOKEN nao esta configurado!
    echo ==================================================
    echo.
    echo Como obter seu token:
    echo 1. Acesse: https://app.supabase.com
    echo 2. Clique em seu avatar (canto superior direito)
    echo 3. Vá em "Access Tokens"
    echo 4. Clique em "Create new token"
    echo 5. Copie o token gerado
    echo.
    echo Então execute:
    echo set SUPABASE_ACCESS_TOKEN=seu_token_aqui
    echo.
    echo Ou adicione permanentemente em Variáveis de Ambiente do Windows
    echo.
    exit /b 1
)

echo Deployando funcao: %FUNCTION_NAME%
echo Projeto: %PROJECT_ID%
echo.

REM Ler arquivo da funcao
for /f "delims=" %%A in ('type "%FUNCTION_FILE%"') do set "FUNCTION_CODE=!FUNCTION_CODE!%%A"

REM Fazer deploy via curl (Se tiver curl instalado)
if exist "C:\Windows\System32\curl.exe" (
    echo Enviando para Supabase API...
    
    REM Estrutura do payload é complexa em batch, então vamos salvar em arquivo JSON temporário
    (
        echo {
        echo   "name": "%FUNCTION_NAME%"
        echo }
    ) > temp_deploy.json
    
    curl -X POST ^
      "https://api.supabase.com/v1/projects/%PROJECT_ID%/functions" ^
      -H "Authorization: Bearer !SUPABASE_ACCESS_TOKEN!" ^
      -H "Content-Type: application/json" ^
      -d @temp_deploy.json
    
    del temp_deploy.json
) else (
    echo curl nao encontrado. Use o Supabase Dashboard para fazer deploy.
)

echo.
echo Para deploy manual, acesse: https://app.supabase.com
echo Vá em: Edge Functions ^> Create new function
echo.
