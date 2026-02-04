// SEO Validation Script for redcreativa.pro

// SEO Validation Script for redcreativa.pro
const fs = require('fs');
const path = require('path');

class SEOValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  async validateSite() {
    console.log('🔍 Iniciando validación SEO completa...\n');

    // 1. Validate Sitemap
    await this.validateSitemap();

    // 2. Validate Structured Data
    await this.validateStructuredData();

    // 3. Validate Hreflang
    await this.validateHreflang();

    // 4. Validate H1 Tags
    await this.validateH1Tags();

    // 5. Validate Markup
    await this.validateMarkup();

    // Generate report
    this.generateReport();
  }

  async validateSitemap() {
    console.log('📍 Validando sitemap...');

    try {
      const sitemapPath = path.join(process.cwd(), 'app', 'sitemap.ts');
      if (fs.existsSync(sitemapPath)) {
        const content = fs.readFileSync(sitemapPath, 'utf8');

        // Check for correct domain
        if (content.includes('https://redcreativa.pro') && !content.includes('www.redcreativa.pro')) {
          this.passed.push('✅ Sitemap usa dominio correcto (sin www)');
        } else {
          this.issues.push('❌ Sitemap contiene URLs incorrectas');
        }

        // Check for valid structure
        if (content.includes('MetadataRoute.Sitemap')) {
          this.passed.push('✅ Estructura de sitemap válida');
        } else {
          this.issues.push('❌ Estructura de sitemap inválida');
        }
      } else {
        this.issues.push('❌ Archivo sitemap.ts no encontrado');
      }
    } catch (error) {
      this.issues.push(`❌ Error validando sitemap: ${error.message}`);
    }
  }

  async validateStructuredData() {
    console.log('📊 Validando datos estructurados...');

    try {
      const structuredDataPath = path.join(process.cwd(), 'lib', 'structured-data.ts');
      if (fs.existsSync(structuredDataPath)) {
        const content = fs.readFileSync(structuredDataPath, 'utf8');

        if (content.includes('@context') && content.includes('schema.org')) {
          this.passed.push('✅ Datos estructurados configurados correctamente');
        } else {
          this.issues.push('❌ Configuración de datos estructurados incompleta');
        }

        if (content.includes('validateSchema')) {
          this.passed.push('✅ Sistema de validación de schema implementado');
        } else {
          this.warnings.push('⚠️ Falta sistema de validación de schema');
        }
      } else {
        this.issues.push('❌ Archivo structured-data.ts no encontrado');
      }
    } catch (error) {
      this.issues.push(`❌ Error validando datos estructurados: ${error.message}`);
    }
  }

  async validateHreflang() {
    console.log('🌍 Validando hreflang...');

    try {
      const hreflangPath = path.join(process.cwd(), 'lib', 'hreflang-config.js');
      if (fs.existsSync(hreflangPath)) {
        const content = fs.readFileSync(hreflangPath, 'utf8');

        if (content.includes('x-default')) {
          this.passed.push('✅ Configuración hreflang x-default presente');
        } else {
          this.issues.push('❌ Falta configuración hreflang x-default');
        }

        if (content.includes('validateHreflang')) {
          this.passed.push('✅ Sistema de validación hreflang implementado');
        } else {
          this.warnings.push('⚠️ Falta validación de hreflang');
        }
      } else {
        this.warnings.push('⚠️ Configuración hreflang no encontrada');
      }
    } catch (error) {
      this.issues.push(`❌ Error validando hreflang: ${error.message}`);
    }
  }

  async validateH1Tags() {
    console.log('📝 Validando tags H1...');

    try {
      const h1ManagerPath = path.join(process.cwd(), 'lib', 'h1-manager.js');
      if (fs.existsSync(h1ManagerPath)) {
        const content = fs.readFileSync(h1ManagerPath, 'utf8');

        if (content.includes('validateH1') && content.includes('generateH1FromTitle')) {
          this.passed.push('✅ Sistema de gestión H1 implementado');
        } else {
          this.issues.push('❌ Sistema de gestión H1 incompleto');
        }

        if (content.includes('generatePageH1Config')) {
          this.passed.push('✅ Configuración H1 por página definida');
        } else {
          this.warnings.push('⚠️ Falta configuración H1 específica por página');
        }
      } else {
        this.issues.push('❌ Sistema de gestión H1 no encontrado');
      }
    } catch (error) {
      this.issues.push(`❌ Error validando H1: ${error.message}`);
    }
  }

  async validateMarkup() {
    console.log('🏷️ Validando markup...');

    try {
      const markupPath = path.join(process.cwd(), 'lib', 'markup-optimizer.js');
      if (fs.existsSync(markupPath)) {
        const content = fs.readFileSync(markupPath, 'utf8');

        if (content.includes('generateOptimizedMetaTags')) {
          this.passed.push('✅ Generador de meta tags optimizado');
        }

        if (content.includes('generateOpenGraphTags')) {
          this.passed.push('✅ Generador de Open Graph tags');
        }

        if (content.includes('generateTwitterCardTags')) {
          this.passed.push('✅ Generador de Twitter Card tags');
        }

        if (content.includes('validateMarkup')) {
          this.passed.push('✅ Sistema de validación de markup');
        }
      } else {
        this.issues.push('❌ Optimizador de markup no encontrado');
      }
    } catch (error) {
      this.issues.push(`❌ Error validando markup: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📋 REPORTE DE VALIDACIÓN SEO');
    console.log('================================\n');

    // Calculate score
    const totalChecks = this.issues.length + this.warnings.length + this.passed.length;
    const score = Math.round(((this.passed.length + (this.warnings.length * 0.5)) / totalChecks) * 100);

    console.log(`🎯 PUNTUACIÓN SEO: ${score}%\n`);

    if (this.passed.length > 0) {
      console.log('✅ ELEMENTOS CORRECTOS:');
      this.passed.forEach(item => console.log(`   ${item}`));
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️ ADVERTENCIAS:');
      this.warnings.forEach(item => console.log(`   ${item}`));
      console.log('');
    }

    if (this.issues.length > 0) {
      console.log('❌ PROBLEMAS CRÍTICOS:');
      this.issues.forEach(item => console.log(`   ${item}`));
      console.log('');
    }

    // Recommendations
    console.log('💡 RECOMENDACIONES:');
    if (score >= 90) {
      console.log('   🎉 ¡Excelente! Tu SEO está muy bien optimizado.');
    } else if (score >= 75) {
      console.log('   👍 Buen trabajo. Corrige las advertencias para mejorar.');
    } else if (score >= 60) {
      console.log('   📈 Progreso decente. Enfócate en los problemas críticos.');
    } else {
      console.log('   🚨 Necesita trabajo urgente. Corrige todos los problemas críticos.');
    }

    console.log('\n🔧 Para corregir problemas, ejecuta: npm run fix-seo');
  }
}

// Execute validation
const validator = new SEOValidator();
validator.validateSite().catch(console.error);
