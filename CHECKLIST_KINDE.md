# ✅ Checklist Kinde - 3 Pasos Simples

## Paso 1: Agregar URLs en Kinde
En la página de Kinde donde estás ahora:

### Campo: "Allowed callback URLs"
- [ ] `https://redcreativa.pro/api/auth/kinde_callback` (ya lo tienes ✓)
- [ ] `http://localhost:3000/api/auth/kinde_callback` (agregar)

### Campo: "Allowed logout redirect URLs"  
- [ ] `https://redcreativa.pro` (agregar)
- [ ] `http://localhost:3000` (agregar)

## Paso 2: Guardar
- [ ] Hacer clic en el botón **"Save"** en Kinde

## Paso 3: Probar
- [ ] Ir a https://redcreativa.pro
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] Debería funcionar ✓

---

## ¿Dónde estás ahora?
Estás en la página correcta de Kinde. Solo necesitas:
1. Buscar el campo "Allowed logout redirect URLs" (está más abajo en la misma página)
2. Agregar las URLs de logout
3. Hacer clic en "Save"

## ¿Qué pasa si no encuentras "Allowed logout redirect URLs"?
No te preocupes, el callback URL es el más importante. Guarda lo que tienes y prueba el login. Si funciona, perfecto. Si no, vuelve y busca el campo de logout.
