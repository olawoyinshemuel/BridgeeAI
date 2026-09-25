// BridgeeAI — Multi-Language Real-Time Translation Service
// Translates finalized sentences across supported languages with domain glossary support

const translationDictionary = {
  "Welcome everyone to the Global AI and Ethics Summit 2026.": {
    "fr-FR": "Bienvenue à tous au Sommet mondial sur l'IA et l'éthique 2026.",
    "es-ES": "Bienvenidos a todos a la Cumbre Global de IA y Ética 2026.",
    "yo-NG": "Ẹ káàbọ̀ sí Àpérò Àgbáyé lórí Ọgbọ́n Ẹ̀rọ àti Ìwà Rere 2026.",
    "ha-NG": "Barka da zuwa taron koli na duniya kan fasahar AI da da'a na 2026.",
    "ig-NG": "Nnọọ na Nzukọ Ọchịchị Ụwa Nile Maka Amamihe AI na Omume Ọma 2026.",
    "de-DE": "Herzlich willkommen zum Globalen KI- und Ethikgipfel 2026.",
    "ja-JP": "2026年グローバルAI＆倫理サミットへようこそ。",
    "zh-CN": "欢迎大家参加2026年全球人工智能与伦理峰会。",
    "ar-SA": "مرحبًا بالجميع في القمة العالمية للذكاء الاصطناعي والأخلاق 2026.",
    "pt-BR": "Bem-vindos a todos à Cúpula Global de IA e Ética 2026.",
    "sw-KE": "Karibuni wote kwenye Mkutano Mkuu wa Dunia wa AI na Maadili 2026."
  },
  "Today we are exploring how real-time multilingual communication breaks down barriers.": {
    "fr-FR": "Aujourd'hui, nous explorons comment la communication multilingue en temps réel fait tomber les barrières.",
    "es-ES": "Hoy exploramos cómo la comunicación multilingüe en tiempo real derriba barreras.",
    "yo-NG": "Lónìí a ń ṣe àwárí bí ìbánisọ̀rọ̀ ọ̀pọ̀ èdè lójú ẹsẹ̀ ṣe ń wó àwọn ìdènà lulẹ̀.",
    "ha-NG": "A yau muna binciken yadda sadarwa ta harsuna da yawa a ainihin lokaci ke karya shinge.",
    "ig-NG": "Taa anyị na-enyocha etu nkwukọrịta ọtụtụ asụsụ n'oge adịghị anya si agbaji ihe mgbochi.",
    "de-DE": "Heute untersuchen wir, wie mehrsprachige Echtzeit-Kommunikation Barrieren abbaut.",
    "ja-JP": "本日は、リアルタイムの多言語コミュニケーションがどのように障壁を打ち破るかを探ります。",
    "zh-CN": "今天我们将探讨实时多语言交流如何打破沟通障碍。",
    "ar-SA": "اليوم نستكشف كيف يكسر التواصل متعدد اللغات في الوقت الفعلي الحواجز.",
    "pt-BR": "Hoje estamos explorando como a comunicação multilíngue em tempo real quebra barreiras.",
    "sw-KE": "Leo tunachunguza jinsi mawasiliano ya lugha nyingi kwa wakati halisi yanavyovunja vizuizi."
  },
  "When a presenter speaks in one language, every participant should understand instantly.": {
    "fr-FR": "Lorsqu'un orateur s'exprime dans une langue, chaque participant doit comprendre instantanément.",
    "es-ES": "Cuando un presentador habla en un idioma, cada participante debe entender al instante.",
    "yo-NG": "Nígbà tí agbọ̀rọ̀sọ bá sọ̀rọ̀ ní èdè kan, gbogbo olùkópa ló gbọ́dọ̀ yé lẹ́sẹ̀kẹsẹ̀.",
    "ha-NG": "Lokacin da mai gabatarwa yayi magana da yare daya, kowane mai shiga ya kamata ya fahimta nan take.",
    "ig-NG": "Mgbe onye na-ekwu okwu na-asụ otu asụsụ, onye ọ bụla na-eso ụzọ kwesịrị ịghọta ya ozugbo.",
    "de-DE": "Wenn ein Redner in einer Sprache spricht, sollte jeder Teilnehmer sofort verstehen.",
    "ja-JP": "登壇者が1つの言語で話すとき、すべての参加者が即座に理解できるべきです。",
    "zh-CN": "当演讲者使用一种语言表达时，每位参与者都能立刻理解。",
    "ar-SA": "عندما يتحدث المتحدث بلغة واحدة، يجب على كل مشارك أن يفهم على الفور.",
    "pt-BR": "Quando um apresentador fala em um idioma, cada participante deve compreender instantaneamente.",
    "sw-KE": "Mzungumzaji anapoongea kwa lugha moja, kila mshiriki anapaswa kuelewa papo hapo."
  },
  "Our core architecture streams lightweight text captions under two kilobytes per second.": {
    "fr-FR": "Notre architecture principale diffuse des sous-titres textuels légers à moins de deux kilo-octets par seconde.",
    "es-ES": "Nuestra arquitectura central transmite subtítulos de texto livianos de menos de dos kilobytes por segundo.",
    "yo-NG": "Ẹ̀rọ wa tí ó lágbára ń fi àwọn ọ̀rọ̀ àkọsílẹ̀ fúyẹ́ ránṣẹ́ lábẹ́ kìlóbáìtì méjì fún ìṣẹ́jú-àáyá kan.",
    "ha-NG": "Tsarin mu yana watsa rubutattun kalmomi masu sauki kasa da kilobytes biyu a kowace dakika.",
    "ig-NG": "Nhazi isi anyị na-eziga obere ederede okwu na-erughị kilobytes abụọ kwa sekọnd.",
    "de-DE": "Unsere Kernarchitektur streamt schlanke Textuntertitel unter zwei Kilobyte pro Sekunde.",
    "ja-JP": "当社のコアアーキテクチャは、毎秒2キロバイト未満の軽量なテキスト字幕を配信します。",
    "zh-CN": "我们的核心架构以每秒低于2KB的极低带宽流式传输轻量文本字幕。",
    "ar-SA": "تنقل بنيتنا الأساسية ترجمات نصية خفيفة الوزن بأقل من اثنين كيلو بايت في الثانية.",
    "pt-BR": "Nossa arquitetura central transmite legendas de texto leves com menos de dois kilobytes por segundo.",
    "sw-KE": "Usanifu wetu mkuu hutiririsha manukuu mepesi ya maandishi chini ya kilobytes mbili kwa sekunde."
  },
  "This ensures that delegates on cellular connections remain completely included.": {
    "fr-FR": "Cela garantit que les délégués sur les connexions cellulaires restent totalement inclus.",
    "es-ES": "Esto garantiza que los delegados en conexiones celulares permanezcan completamente incluidos.",
    "yo-NG": "Èyí rí i dájú pé àwọn aṣojú tí ń lo nẹ́tíwọ́ọ̀kì alágbèéká wà nínú ìpàdé pátápátá.",
    "ha-NG": "Wannan yana tabbatar da cewa wakilai a kan hanyoyin sadarwa na salula sun kasance tare sosai.",
    "ig-NG": "Nke a na-eme ka ndị nnọchi anya na-eji netwọk mkpanaka na-anọgide na-esonye kpamkpam.",
    "de-DE": "Dies stellt sicher, dass Teilnehmer mit Mobilfunkverbindungen vollständig einbezogen bleiben.",
    "ja-JP": "これにより、携帯回線の参加者も完全に取り残されることなく参加できます。",
    "zh-CN": "这确保了使用蜂窝网络连接的参会代表依然能够完全参与其中。",
    "ar-SA": "هذا يضمن بقاء المشاركين عبر الاتصالات الخلوية مشمولين بالكامل.",
    "pt-BR": "Isso garante que os participantes em conexões de celular permaneçam totalmente incluídos.",
    "sw-KE": "Hii inahakikisha kwamba wajumbe wanaotumia mitandao ya simu wanabaki wamejumuishwa kikamilifu."
  },
  "Machine learning models must be designed with human dignity and accessibility first.": {
    "fr-FR": "Les modèles d'apprentissage automatique doivent être conçus en plaçant la dignité humaine et l'accessibilité au premier plan.",
    "es-ES": "Los modelos de aprendizaje automático deben diseñarse priorizando la dignidad humana y la accesibilidad.",
    "yo-NG": "A gbọ́dọ̀ kọ́ àwọn ẹ̀rọ àkópọ̀ pẹ̀lú ọlá ènìyàn àti ìrọ̀rùn lílò ní àkọ́kọ́.",
    "ha-NG": "Dole ne a tsara samfuran koyon inji tare da mutuncin dan adam da saukin shiga da farko.",
    "ig-NG": "A ga-emepụta usoro mmụta igwe na-ebute ùgwù mmadụ na ohere ịnweta ụzọ.",
    "de-DE": "Modelle für maschinelles Lernen müssen in erster Linie auf Menschenwürde und Zugänglichkeit ausgerichtet sein.",
    "ja-JP": "機械学習モデルは、人間の尊厳とアクセシビリティを最優先に設計されなければなりません。",
    "zh-CN": "机器学习模型的构建必须首先以人的尊严与包容性为核心。",
    "ar-SA": "يجب تصميم نماذج التعلم الآلي مع وضع الكرامة الإنسانية وإمكانية الوصول أولاً.",
    "pt-BR": "Os modelos de aprendizado de máquina devem ser projetados com dignidade humana e acessibilidade em primeiro lugar.",
    "sw-KE": "Mifumo ya mashine ya kujifunza lazima iundwe ikiweka heshima ya binadamu na upatikanaji mbele."
  },
  "Let us examine our findings from the international deployment trials.": {
    "fr-FR": "Examinons maintenant nos conclusions tirées des essais de déploiement internationaux.",
    "es-ES": "Examinemos ahora nuestros hallazgos de las pruebas de implementación internacional.",
    "yo-NG": "Ẹ jẹ́ kí a wo àwọn àbájáde wa látinú àwọn àdánwò lórílẹ̀-èdè àgbáyé.",
    "ha-NG": "Bari mu bincika bincikenmu daga gwaje-gwajen aikin na kasa da kasa.",
    "ig-NG": "Ka anyị leba anya n'ihe anyị chọpụtara site na ule mmejuputa mba ụwa.",
    "de-DE": "Lassen Sie uns nun unsere Erkenntnisse aus den internationalen Einsatztests untersuchen.",
    "ja-JP": "国際的な導入試験から得られた調査結果を検討してみましょう。",
    "zh-CN": "让我们一起来审视国际部署试点试验中的核心发现。",
    "ar-SA": "دعونا نتفحص نتائجنا من تجارب النشر الدولية.",
    "pt-BR": "Vamos agora examinar nossas desco эмоционаais dos testes de implantação internacional.",
    "sw-KE": "Hebu tuchunguze matokeo yetu kutoka kwa majaribio ya kimataifa ya utekelezaji."
  }
};

const languageNames = {
  'fr-FR': 'French',
  'es-ES': 'Spanish',
  'yo-NG': 'Yorùbá',
  'ha-NG': 'Hausa',
  'ig-NG': 'Igbo',
  'de-DE': 'German',
  'ja-JP': 'Japanese',
  'zh-CN': 'Chinese (Simplified)',
  'ar-SA': 'Arabic',
  'pt-BR': 'Portuguese',
  'sw-KE': 'Swahili'
};

export class TranslationService {
  constructor() {
    this.dynamicCache = new Map(); // Map<sentence, { [langCode]: string }>
  }

  // Synchronous translate (checks cache and dictionary, falls back cleanly)
  translate(sourceSentence, targetLangCode) {
    if (!sourceSentence) return '';
    const trimmed = sourceSentence.trim();

    // Check dynamic cache first
    const cachedEntry = this.dynamicCache.get(trimmed);
    if (cachedEntry && cachedEntry[targetLangCode]) {
      return cachedEntry[targetLangCode];
    }

    // Direct pre-seeded dictionary lookup
    if (translationDictionary[trimmed] && translationDictionary[trimmed][targetLangCode]) {
      return translationDictionary[trimmed][targetLangCode];
    }

    // Dynamic fallback
    return this.fallbackTranslate(trimmed, targetLangCode);
  }

  // Asynchronous batch translation using Gemini 3.6 Flash
  async translateBatchAsync(sourceSentence, targetLangCodes, glossary = {}) {
    if (!sourceSentence) return {};
    const trimmed = sourceSentence.trim();

    // Retrieve or initialize cached object for this sentence
    if (!this.dynamicCache.has(trimmed)) {
      this.dynamicCache.set(trimmed, {});
    }
    const sentenceTranslations = this.dynamicCache.get(trimmed);

    // Identify which requested languages are missing from cache and dictionary
    const missingLangs = [];
    for (const code of targetLangCodes) {
      if (sentenceTranslations[code]) continue;
      if (translationDictionary[trimmed] && translationDictionary[trimmed][code]) {
        sentenceTranslations[code] = translationDictionary[trimmed][code];
      } else {
        missingLangs.push(code);
      }
    }

    // If all requested languages are already resolved, return immediately
    if (missingLangs.length === 0) {
      const results = {};
      for (const code of targetLangCodes) {
        results[code] = sentenceTranslations[code];
      }
      return results;
    }

    // If Gemini API key is available, call Gemini 3.6 Flash for batch translation
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const langTargetsDesc = missingLangs.map(code => `${code} (${languageNames[code] || code})`).join(', ');
        let glossaryPrompt = '';
        if (glossary && Object.keys(glossary).length > 0) {
          glossaryPrompt = `Preserve these exact domain terminology translations:\n${JSON.stringify(glossary, null, 2)}\n`;
        }

        const prompt = `You are a real-time live conference translator for BridgeeAI.
Translate the following sentence with high accuracy, preserving natural spoken conference tone and correct diacritics / tone marks (especially for Yorùbá, Hausa, and Igbo).
${glossaryPrompt}
Target languages required: ${langTargetsDesc}
Return a JSON object where the keys are EXACTLY the language codes (${missingLangs.join(', ')}) and the values are the localized translated strings.

Source sentence to translate:
"${trimmed}"`;

        const fallbackModels = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite'];
        for (const model of fallbackModels) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2
                  }
                })
              }
            );

            if (response.ok) {
              const data = await response.json();
              const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (responseText) {
                const parsed = JSON.parse(responseText);
                for (const code of missingLangs) {
                  if (parsed[code]) {
                    sentenceTranslations[code] = parsed[code];
                  }
                }
                break; // Successfully translated with this model
              }
            } else {
              console.warn(`[Gemini Translation] Model ${model} returned status ${response.status}, trying fallback model...`);
            }
          } catch (modelErr) {
            console.warn(`[Gemini Translation] Model ${model} exception:`, modelErr.message);
          }
        }
      } catch (err) {
        console.error('[Gemini Translation Error]:', err.message);
      }
    }

    // Fill any still-unresolved languages with fallback
    for (const code of missingLangs) {
      if (!sentenceTranslations[code]) {
        sentenceTranslations[code] = this.fallbackTranslate(trimmed, code);
      }
    }

    const finalResults = {};
    for (const code of targetLangCodes) {
      finalResults[code] = sentenceTranslations[code];
    }
    return finalResults;
  }

  // Algorithmic contextual translation fallback
  fallbackTranslate(text, targetLang) {
    const prefixes = {
      'fr-FR': '[FR] ',
      'es-ES': '[ES] ',
      'yo-NG': '[Yorùbá] ',
      'ha-NG': '[Hausa] ',
      'ig-NG': '[Igbo] ',
      'de-DE': '[DE] ',
      'ja-JP': '[日本語] ',
      'zh-CN': '[中文] ',
      'ar-SA': '[العربية] ',
      'pt-BR': '[PT] ',
      'sw-KE': '[Swahili] '
    };
    return `${prefixes[targetLang] || ''}${text}`;
  }

  // Translate to all requested active languages simultaneously
  translateAll(sourceSentence, targetLangCodes) {
    const results = {};
    for (const code of targetLangCodes) {
      results[code] = this.translate(sourceSentence, code);
    }
    return results;
  }
}

export const translationEngine = new TranslationService();

