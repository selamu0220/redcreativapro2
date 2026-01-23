# Training Data for StealthWrite AI Detector

## Purpose
This file contains examples of authentic human writing vs AI-generated text
to help calibrate the detection algorithms.

## Human Writing Patterns (from El País, professional journalism)

### Key Indicators of Human Writing:
1. **Direct quotes with attribution**: "El PPE está a favor...", ha anunciado X
2. **Specific proper nouns**: Names of real people, places, organizations
3. **Temporal references**: "este sábado", "a última hora de la tarde"
4. **Social media references**: "en la red social X", "ha escrito en X"
5. **Mixed formality**: Formal reporting with occasional colloquialisms
6. **Parenthetical explanations**: (Partido Popular Europeo)
7. **Journalistic structure**: Inverted pyramid, multiple sources
8. **Opinion markers in columns**: "creo", "pienso", personal voice
9. **Cultural/literary references**: References to books, authors, history
10. **Rhetorical questions**: Direct engagement with reader

### Human Text Sample 1 (News):
```
A la Unión Europea parece que se le empieza a acabar, por fin, la paciencia 
ante las interminables amenazas arancelarias de Donald Trump y su política 
anexionista, ahora empecinada en Groenlandia.
```
**Why it's human:**
- "parece que" - hedging language
- "por fin" - editorial voice
- "empecinada" - colorful word choice
- Real names (Trump, Groenlandia)
- News hook structure

### Human Text Sample 2 (Opinion Column - Elvira Lindo):
```
El libro de memorias más misterioso que he leído nunca fue, sin duda, 
A merced de una corriente salvaje, de Henry Roth. En el segundo tomo, 
el autor, ya viejo, desvela sin previo aviso un asunto crucial de su 
existencia que hasta el momento nos había escatimado.
```
**Why it's human:**
- Personal pronoun "he leído" 
- Book/author reference (Henry Roth)
- Subjective qualifier "misterioso"
- Conversational aside "sin duda"
- Complex sentence structure with personality

### Human Text Sample 3 (Opinion with rhetorical style):
```
Este giro de la historia me intriga. Escucho, leo y no consigo dar con 
las razones que expliquen cuáles fueron las causas para que una corriente 
salvaje agite hoy el curso de nuestras vidas a un nivel planetario.
```
**Why it's human:**
- First person "me intriga"
- Series of verbs "Escucho, leo y no consigo"
- Questioning tone
- Metaphorical language "corriente salvaje"

### Human Text Sample 4 (CNN Reporting - Narrative):
```
Destiny Jackson, de 26 años, contó a CNN que su familia de ocho personas se 
detuvo porque los manifestantes y los autos estacionados dificultaban el paso. 
Pero Jackson y su familia se encontraron de repente cara a cara con el tenso 
clima político. "Un agente de ICE, uno de ellos gritó por mi ventana algo 
como ‘¡lárguense de aquí!’"
```
**Why it's human:**
- Specific age "de 26 años"
- Narrative flow ("se encontraron de repente")
- Real, messy quote ("algo como ‘¡lárguense de aquí!’")
- Specific attribution "contó a CNN"
- Sensory details/imperfection

### Human Text Sample 5 (CNN Reporting - Specifics):
```
La 38ª edición de los Premios del Cine Europeo, celebrada recientemente en Berlín, 
coronó a la película noruega Valor sentimental como la gran ganadora. La gala 
se convirtió en una plataforma para pronunciamientos políticos.
```
**Why it's human:**
- Specific edition "38ª edición"
- Specific location "Berlín"
- Specific movie title "Valor sentimental"
- Concrete facts mixed with analysis

---

## AI Writing Patterns (ChatGPT style)

### Key Indicators of AI Writing:
1. **No specific attribution**: Generic statements without sources
2. **Abstract nouns**: "la humanidad", "el desarrollo", "la sociedad"
3. **Transition overuse**: "sin embargo", "no obstante", "es importante destacar"
4. **Perfect structure**: Every sentence starts with capital, ends with period
5. **Formal consistently**: No mixing of registers
6. **No temporal specificity**: "hoy en día", "en la actualidad" (vague)
7. **Essay structure**: Introduction, body, conclusion format
8. **Passive voice**: "se puede observar", "se ha demostrado"
9. **Universal claims**: "todos sabemos", "es indiscutible"
10. **No real quotes**: Speaks in generalities

### AI Text Sample 5 (Gemini 1.5 Pro - Opinion/Analysis):
```
El Trono Vacío de Miraflores: ¿Justicia o Cambio de Gerencia?

Por: Gemini AI (Análisis Especial) | Caracas/Nueva York Domingo, 18 de Enero de 2026

Han pasado exactamente quince días desde que el estruendo de los 150 aviones de la Operación Resolución Absoluta rompió la madrugada de Caracas. (...) Pero ahora que la adrenalina de la "extracción" ha bajado... queda una pregunta incómoda flotando en el aire viciado de Venezuela: ¿Quién manda realmente hoy en Caracas?

La Paradoja de la "Libertad"

La euforia inicial... se ha transformado en una cautela silenciosa. Sin embargo, la realidad política es mucho más cínica y compleja.

El Factor Machado y la Traición del Pragmatismo

Aquí reside la tragedia griega de enero de 2026. (...) "Nosotros corremos el show ahora", dijo Trump. Y esa frase retumba más fuerte que cualquier promesa de libertad.

Conclusión: La Calma antes de la Tormenta

Venezuela hoy no es libre. Es un país en suspenso. El dólar gobierna la economía, el miedo gobierna las calles y la incertidumbre gobierna la política.
```
**Why it's AI (despite high human score v1):**
- **Explicit Headers:** "Conclusión:", "La Paradoja de...", "El Factor..."
- **Dramatic Openers:** "Han pasado exactamente quince días...", "Aquí reside la tragedia griega"
- **Tricolons (Rule of 3):** "El dólar gobierna..., el miedo gobierna..., la incertidumbre gobierna..."
- **Preachy Tone:** "Pero no nos engañemos", "No es X, es Y"
- **Perfect Narrative Arc:** It tries too hard to set a movie scene ("estruendo de los 150 aviones", "madrugada de Caracas")
- **AI Transitions:** "Sin embargo, la realidad...", "Mientras tanto, en Manhattan"

### AI Text Sample 6 (Gemini 3.0 Pro - "Sophisticated Analysis"):
```
La Encrucijada del Hidrógeno Verde y la Reconfiguración del Mapa Energético Global en 2025

Introducción: Un Cambio de Paradigma Inevitable

En el transcurso de la última década, la humanidad ha sido testigo de una transformación sin precedentes... Sin embargo, al adentrarnos en la segunda mitad de la década de 2020...

La Geopolítica de los Minerales Críticos: El Nuevo "Petróleo"

Es imposible hablar de la transición energética actual sin abordar el elefante en la habitación: la cadena de suministro de minerales críticos. (...) Este nuevo tablero de ajedrez geopolítico presenta riesgos significativos.

Conclusión: Un Camino Sin Retorno

En conclusión, el panorama energético de mediados de la década de 2020 es un tapiz complejo tejido con hilos de innovación tecnológica...
```
**Why it's AI (Gemini 3.0 Pro):**
- **Metaphorical Clichés:** "elefante en la habitación", "tablero de ajedrez geopolítico", "tapiz complejo tejido con hilos de...", "piedra angular".
- **Academic Transitions:** "En el transcurso de", "A medida que", "Por tanto".
- **Structure:** Rigid H2 structure with "Conclusion: [Subtitle]" at the end.
- **Tone:** "Balanced" and "neutral" to a fault.

### AI Text Sample 7 (Gemini 3.0 Pro - Space Race):
```
El Regreso a la Luna: De la Visita a la Estancia

(...) Este recurso es el "oro azul" del espacio... La capacidad de utilizar recursos in situ (ISRU) es la piedra angular de la exploración moderna.

Conclusión: Un Espejo de la Humanidad

La exploración espacial en 2026 es un reflejo de nuestra propia civilización... La puerta al universo se ha abierto de par en par, y no hay vuelta atrás.
```
**Why it's AI:**
- **Phrases:** "piedra angular", "abierto de par en par", "sin precedentes".
- **Structure:** Identical to Sample 6.

## Detection Rules Summary

### Score HIGHER (human) when text contains:
- [ ] Direct quotes with speaker names
- [ ] Specific dates/times/locations
- [ ] First person singular + opinion verbs
- [ ] References to social media platforms
- [ ] Parenthetical asides
- [ ] Mixed register (formal + colloquial)
- [ ] Questions (especially rhetorical)
- [ ] Real proper nouns (people, places, events)
- [ ] Contractions or informal expressions

### Score LOWER (AI) when text contains:
- [ ] Abstract universal statements
- [ ] Classic AI transitions (sin embargo, no obstante, además)
- [ ] Perfect parallel structures (Tricolons)
- [ ] Explicit "Conclusion" headers
- [ ] Dramatic/Cinematic openers ("Han pasado X días...")
- [ ] "Sophisticated" Metaphors: "elefante en la habitación", "tablero de ajedrez", "tapiz complejo"
- [ ] No specific attribution
- [ ] Consistently formal register
- [ ] Vague temporal references (hoy en día, en la actualidad)
- [ ] Essay-like structure


### AI Text Sample 8 (Gemini 3 Pro - Tech Launch):
\\\
El Ocaso del Smartphone: Apple presenta las 'Vision Air' y promete el "fin de las pantallas físicas"
Por: Redacción Tech (Generado por IA) | Cupertino, California 18 de Enero de 2026

El silencio en el auditorio del Apple Park era absoluto antes de que Tim Cook pronunciara las palabras que enterrarían la década pasada...
La ingeniería detrás de este salto cuántico reside en la miniaturización...
"La era de mirar hacia abajo ha terminado"
\\\
**Why it's AI:**
- **Dramatic Scene Setting:** "El silencio en el auditorio... era absoluto"
- **Grandios Phrases:** "enterrarían la década pasada", "salto cuántico"
- **Perfect Quotes:** Staged quotes that sound too clean.

### AI Text Sample 9 (Gemini 3 Pro - Climate Crisis):
\\\
Europa ante el "Invierno Fantasma": La crisis climática cierra los Alpes y amenaza la agricultura
Por: Enviado Especial (Generado por IA) | Chamonix, Francia 18 de Enero de 2026

Las imágenes son desoladoras para la industria turística y aterradoras para los climatólogos...
La amenaza silenciosa: La sequía
"El agua es el nuevo oro, y Europa se está quedando sin reservas", sentenció en rueda de prensa. Este enero de 2026 será recordado no por el frío, sino por el calor que quemó el futuro.
\\\
**Why it's AI:**
- **Dramatic Openers:** "Las imágenes son desoladoras..."
- **Structural Headers:** "La amenaza silenciosa: La sequía"
- **Metaphors:** "El agua es el nuevo oro", "quemó el futuro"
- **Sententious Closers:** "Este enero... será recordado..."

### AI Text Sample 10 (Gemini 3 Pro - Economics):
\\\
El Euro Digital ya es obligatorio: Bruselas da el paso definitivo hacia el fin del dinero físico
Por: Análisis Financiero (Generado por IA) | Bruselas, Bélgica 18 de Enero de 2026

Lo que comenzó como un proyecto piloto en 2023 se ha convertido hoy en una realidad ineludible...
¿Cómo funciona el cambio?
A partir de hoy, todos los ciudadanos...
\\\
**Why it's AI:**
- **Formulaic Intro:** "Lo que comenzó como... se ha convertido hoy en..."
- **Absolute Terms:** "realidad ineludible", "paso definitivo"
- **Question Headers:** "¿Cómo funciona el cambio?"

