@echo off
echo 🚀 CONFIGURANDO API KEY DE GEMINI EN VERCEL
echo ==========================================

echo.
echo Agregando variable de entorno GOOGLE_GENERATIVE_AI_API_KEY...
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production
echo AIzaSyB2tbgvIDgHZs8GouIE0PCd8NkzvbvICLc

echo.
echo Agregando para preview...
vercel env add GOOGLE_GENERATIVE_AI_API_KEY preview
echo AIzaSyB2tbgvIDgHZs8GouIE0PCd8NkzvbvICLc

echo.
echo Agregando para development...
vercel env add GOOGLE_GENERATIVE_AI_API_KEY development
echo AIzaSyB2tbgvIDgHZs8GouIE0PCd8NkzvbvICLc

echo.
echo ✅ Variables configuradas. Ahora redeploy:
echo vercel --prod

pause