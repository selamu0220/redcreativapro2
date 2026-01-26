#!/bin/bash

# Script para configurar variables de entorno de Kinde en Vercel
# Requiere: vercel CLI instalado (npm i -g vercel)

echo "🔐 Configurando variables de Kinde en Vercel..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables de Kinde para producción
KINDE_CLIENT_ID="5065812b70004d75809f8d535cb0daa6"
KINDE_CLIENT_SECRET="KzUrUzfBKlHWq0n7GPmOOEO2IjzHGB3z8I3K6yDVaxr03wCfE42"
KINDE_ISSUER_URL="https://selamu.kinde.com"
KINDE_SITE_URL="https://redcreativa.pro"
KINDE_POST_LOGOUT_REDIRECT_URL="https://redcreativa.pro"
KINDE_POST_LOGIN_REDIRECT_URL="https://redcreativa.pro/dashboard"

echo -e "${YELLOW}Este script configurará las siguientes variables en Vercel:${NC}"
echo "  - KINDE_CLIENT_ID"
echo "  - KINDE_CLIENT_SECRET"
echo "  - KINDE_ISSUER_URL"
echo "  - KINDE_SITE_URL"
echo "  - KINDE_POST_LOGOUT_REDIRECT_URL"
echo "  - KINDE_POST_LOGIN_REDIRECT_URL"
echo ""

read -p "¿Continuar? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Cancelado${NC}"
    exit 1
fi

# Verificar si vercel CLI está instalado
if ! command -v vercel &> /dev/null
then
    echo -e "${RED}Error: vercel CLI no está instalado${NC}"
    echo "Instálalo con: npm i -g vercel"
    exit 1
fi

echo ""
echo -e "${GREEN}Configurando variables...${NC}"
echo ""

# Configurar variables en Vercel (solo producción)
vercel env add KINDE_CLIENT_ID production <<< "$KINDE_CLIENT_ID"
vercel env add KINDE_CLIENT_SECRET production <<< "$KINDE_CLIENT_SECRET"
vercel env add KINDE_ISSUER_URL production <<< "$KINDE_ISSUER_URL"
vercel env add KINDE_SITE_URL production <<< "$KINDE_SITE_URL"
vercel env add KINDE_POST_LOGOUT_REDIRECT_URL production <<< "$KINDE_POST_LOGOUT_REDIRECT_URL"
vercel env add KINDE_POST_LOGIN_REDIRECT_URL production <<< "$KINDE_POST_LOGIN_REDIRECT_URL"

echo ""
echo -e "${GREEN}✅ Variables configuradas correctamente${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Ve a Kinde Dashboard (https://selamu.kinde.com)"
echo "2. Agrega las callback URLs:"
echo "   - https://redcreativa.pro/api/auth/kinde_callback"
echo "3. Agrega las logout redirect URLs:"
echo "   - https://redcreativa.pro"
echo "4. Redeploy tu aplicación en Vercel"
echo ""
echo -e "${GREEN}Lee KINDE_SETUP_COMPLETO.md para más detalles${NC}"
