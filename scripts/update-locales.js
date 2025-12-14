const fs = require('fs');
const path = require('path');

const localesDir = path.join(process.cwd(), 'public', 'locales');

const newKeys = {
    es: {
        currency_converter: {
            title: "Conversor de Moneda",
            subtitle: "Tasas de cambio en tiempo real",
            amount: "Cantidad",
            from: "De",
            to: "A",
            result: "Resultado",
            calculating: "Calculando...",
            updated: "Actualizado: {{time}}",
            regional_rates: "Tasas de Cambio Regionales (En vivo)"
        },
        payment_selector: {
            title: "Métodos de Pago Globales",
            subtitle: "Selecciona tu método preferido",
            recommended: "Recomendado",
            processing_time: "Tiempo de proceso",
            instant: "Instantáneo",
            minutes: "minutos",
            days: "días",
            success_rate: "Tasa de éxito",
            gateway: "Pasarela"
        }
    },
    en: {
        currency_converter: {
            title: "Currency Converter",
            subtitle: "Real-time exchange rates",
            amount: "Amount",
            from: "From",
            to: "To",
            result: "Result",
            calculating: "Calculating...",
            updated: "Updated: {{time}}",
            regional_rates: "Regional Exchange Rates (Live)"
        },
        payment_selector: {
            title: "Global Payment Methods",
            subtitle: "Select your preferred method",
            recommended: "Recommended",
            processing_time: "Processing time",
            instant: "Instant",
            minutes: "minutes",
            days: "days",
            success_rate: "Success rate",
            gateway: "Gateway"
        }
    }
};

function updateLocale(lang) {
    const filePath = path.join(localesDir, lang, 'common.json');
    try {
        let content = {};
        if (fs.existsSync(filePath)) {
            content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }

        // Merge new keys
        content = { ...content, ...newKeys[lang] };

        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`Updated ${lang}/common.json`);
    } catch (error) {
        console.error(`Error updating ${lang}:`, error);
    }
}

updateLocale('es');
updateLocale('en');
