'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles, Download, Share2 } from 'lucide-react';

const PROMPT_CATEGORIES = [
  { id: 'email', name: 'Email Marketing', icon: '📧' },
  { id: 'social', name: 'Redes Sociales', icon: '📱' },
  { id: 'blog', name: 'Blog & Artículos', icon: '✍️' },
  { id: 'ads', name: 'Anuncios PPC', icon: '📢' },
  { id: 'product', name: 'Descripciones Producto', icon: '🛍️' },
  { id: 'seo', name: 'SEO', icon: '🔍' }
];

const TONE_OPTIONS = [
  { id: 'professional', name: 'Profesional', desc: 'Formal y corporativo' },
  { id: 'friendly', name: 'Amigable', desc: 'Cercano y conversacional' },
  { id: 'persuasive', name: 'Persuasivo', desc: 'Vendedor y convincente' },
  { id: 'humorous', name: 'Con Humor', desc: 'Divertido y entretenido' },
  { id: 'urgent', name: 'Urgente', desc: 'Creando urgencia' }
];

const TEMPLATES = {
  email: {
    subject: 'Generate a compelling email subject line about {topic} that {action}',
    body: 'Write a {tone} email about {topic}. The email should {goal}. Include: opening hook, main benefits, social proof, and clear CTA. Length: {length}.',
    examples: [
      'Asunto: "El secreto que los expertos no quieren que sepas sobre {topic}"',
      'Cuerpo: Email de webinar registrando {topic} para audiencia {audience}'
    ]
  },
  social: {
    subject: 'Create a {platform} post about {topic} with {goal}',
    body: 'Write {tone} content for {platform} about {topic}. Include relevant hashtags, emojis, and a compelling CTA. Engagement goal: {engagement}.',
    examples: [
      'LinkedIn: Article share sobre {topic} para profesionales',
      'Instagram: Carousel post sobre {topic}',
      'Twitter: Thread sobre {topic}'
    ]
  },
  blog: {
    subject: 'Write a comprehensive blog post outline about {topic}',
    body: 'Create a {tone} blog post about {topic}. Include: SEO-optimized title, meta description, H2/H3 structure, introduction, {num_points} key points, conclusion with CTA.',
    examples: [
      'Guía completa sobre {topic} (2000+ palabras)',
      'Listicle: {num_items} cosas sobre {topic}'
    ]
  },
  ads: {
    subject: 'Write {ad_type} ad copy for {product}',
    body: 'Create {num_ads} variations of {tone} ad copy for {product}. Include: headline, description, CTA button text. Target audience: {audience}. Highlight: {benefit}.',
    examples: [
      'Facebook Ad para {product}',
      'Google Ads headline y description'
    ]
  },
  product: {
    subject: 'Write compelling product description for {product}',
    body: 'Create {tone} product description for {product}. Features: {features}. Benefits: {benefits}. Target: {audience}. Include: headline, key points, CTA.',
    examples: [
      'Amazon product description',
      'E-commerce category description'
    ]
  },
  seo: {
    subject: 'Generate SEO-optimized content about {topic}',
    body: 'Write SEO content about {topic}. Include: primary keyword "{keyword}", related keywords: {related_kw}. Word count: {words}. Structure: intro, {num_sections} sections with H2, conclusion.',
    examples: [
      'Meta description para página sobre {topic}',
      'Alt text para imágenes sobre {topic}'
    ]
  }
};

export default function PromptGeneratorTool() {
  const [selectedCategory, setSelectedCategory] = useState('blog');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const generatePrompt = () => {
    const template = TEMPLATES[selectedCategory as keyof typeof TEMPLATES];
    let prompt = template.body;

    const replacements: Record<string, string> = {
      topic: topic || 'tu producto/servicio',
      tone: TONE_OPTIONS.find(t => t.id === tone)?.name.toLowerCase() || 'profesional',
      goal: 'convencer al lector',
      length: '200-300 palabras',
      platform: 'LinkedIn',
      engagement: 'máximo CTR',
      num_points: '3-5 puntos principales',
      num_items: '10',
      ad_type: 'Facebook',
      product: 'tu producto',
      features: 'características principales',
      benefits: 'beneficios clave',
      audience: 'tu audiencia objetivo',
      keyword: 'palabra clave principal',
      related_kw: 'palabras relacionadas',
      words: '1500 palabras',
      num_sections: '4-5 secciones',
      num_ads: '3 variantes'
    };

    Object.entries(customInputs).forEach(([key, value]) => {
      if (value) replacements[key] = value;
    });

    Object.entries(replacements).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    setGeneratedPrompt(prompt);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPrompt = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedPrompt], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'prompt-generado.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Generador de Prompts IA</h1>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </div>
          <p className="text-purple-200 text-lg">
            Crea prompts efectivos para ChatGPT, Claude y más herramientas de IA
          </p>
        </div>

        {/* Main Generator */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-6">
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">1. Selecciona tu objetivo</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PROMPT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-yellow-400 text-purple-900 font-bold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl mr-2">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">2. Elige el tono</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-lg text-sm transition-all ${
                    tone === t.id
                      ? 'bg-purple-500 text-white font-medium'
                      : 'bg-white/5 text-purple-200 hover:bg-white/10'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">3. ¿Sobre qué quieres crear contenido?</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: marketing con inteligencia artificial para ecommerce..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePrompt}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-bold text-lg rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generar Prompt Optimizado
          </button>
        </div>

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Tu Prompt Generado</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white" />}
                </button>
                <button
                  onClick={downloadPrompt}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => navigator.share?.({ title: 'Mi Prompt IA', text: generatedPrompt })}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="bg-purple-950/50 rounded-xl p-6 border border-purple-500/30">
              <pre className="text-purple-100 whitespace-pre-wrap font-mono text-sm">{generatedPrompt}</pre>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-800/50 to-indigo-800/50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">💡 Consejos para usar tu prompt</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">✓ Hazlo específico</h4>
              <p className="text-purple-200 text-sm">Cuanto más detalles proporciones, mejores serán los resultados de la IA.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">✓ Itera y mejora</h4>
              <p className="text-purple-200 text-sm">Refina el prompt basándote en los resultados obtenidos.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">✓ Añade contexto</h4>
              <p className="text-purple-200 text-sm">Incluye información sobre tu audiencia y objetivos.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">✓ Experimenta</h4>
              <p className="text-purple-200 text-sm">Prueba diferentes tonos y enfoques para ver qué funciona mejor.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 mb-4">¿Quieres más herramientas gratuitas como esta?</p>
          <a
            href="https://redcreativa.pro"
            className="inline-block px-8 py-3 bg-yellow-400 text-purple-900 font-bold rounded-xl hover:bg-yellow-500 transition-all"
          >
            Visita Red Creativa Pro →
          </a>
        </div>
      </div>
    </div>
  );
}
