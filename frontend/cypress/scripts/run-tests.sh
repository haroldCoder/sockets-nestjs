#!/bin/bash

# Script para ejecutar los tests de Cypress del módulo de autenticación
# Uso: ./cypress/scripts/run-tests.sh [modo]
# Modos: open, run, headless

MODE=${1:-open}

echo "🚀 Ejecutando tests de Cypress para el módulo de autenticación..."
echo "📁 Directorio: $(pwd)"
echo "🎯 Modo: $MODE"

# Verificar que el servidor de desarrollo esté corriendo
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  El servidor de desarrollo no está corriendo en http://localhost:5173"
    echo "💡 Ejecuta 'npm run dev' en otra terminal antes de correr los tests"
    exit 1
fi

# Ejecutar los tests según el modo
case $MODE in
    "open")
        echo "🖥️  Abriendo Cypress en modo interactivo..."
        npm run e2e:open
        ;;
    "run")
        echo "🏃 Ejecutando tests en modo headless..."
        npm run e2e
        ;;
    "headless")
        echo "🤖 Ejecutando tests en modo headless (sin interfaz)..."
        npm run cypress:run:headless
        ;;
    *)
        echo "❌ Modo no válido: $MODE"
        echo "💡 Modos disponibles: open, run, headless"
        exit 1
        ;;
esac

echo "✅ Tests completados!"
