import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI Vet Advisor will run mock answers.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. API Routes (FIRST)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vet Advisor Chat Endpoint using Gemini
app.post('/api/vet-advisor', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "العنصر 'message' مطلوب في محتوى الطلب." });
      return;
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return a simulated high-quality Arabic vet response if key is missing (graceful handling)
      setTimeout(() => {
        let mockResponse = "أهلاً بك في الدعم الفني لتطبيق الـ 5 كيلو. لم يتم تهيئة مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) في الخادم بعد، لكن يسعدني إجابتك استناداً لخبرتي العامة:\n\n1. موازنة الوجبات وزيادة الوزن فوق 5 كجم تتطلب تهوية استثنائية (لا تقل عن 5.5 متر مكعب لكل ساعة لكل طائر).\n2. لسلامة مفاصل الطائر الثقيل، حافظ على خطوط الشرب موازية للظهر ومعدلات الكالسيوم تحت إشراف مضادات السموم الدورية.\n\nتأكد من ضبط مفتاح السر في الإعدادات لتفعيل المحادثات المباشرة الذكية!";
        
        if (message.includes("حرارة") || message.includes("سخونة") || message.includes("برد")) {
          mockResponse = "عزيزي المربي، بخصوص درجة الحرارة للأوزان الكبيرة (أعلى من 3 كجم ووصولاً لـ 5 كجم):\n\n- لتجنب الموت المفاجئ والاحتباس الحراري، يجب ألا تزيد حرارة العنبر عن 19-21 درجة مئوية.\n- يجب توفير حجر جيري ومصادر فيتامين (ج) بالمساقي بشكل روتيني ليلًا لتحويل الأكسجين بكفاءة.";
        } else if (message.includes("علف") || message.includes("أكل") || message.includes("بروتين")) {
          mockResponse = "من أجل تسمين حقيقي ممتاز للوصول لوزن 5 كيلو جرام للفرخ:\n\n- استخدم علف نامي 21% بروتين حتى اليوم الـ 28، ثم تحول لعلف ناهي 19%.\n- بعد اليوم الـ 40، استخدم خلطات طاقة غنية مع مكمل الكولين لتعزيز مرونة غشاء الخلايا وهضم غني دون دهون كبدية مفرطة.";
        } else if (message.includes("مرض") || message.includes("موت" ) || message.includes("سهال") || message.includes("عطس")) {
          mockResponse = "بخصوص الأعراض المرضية الموصوفة:\n\n- اعزل الدجاج المصاب فوراً.\n- للوقاية من الكوكسيديا (الخروج البني الأحمر)، استخدم الأمبروليوم بجرعة 1 جرام لكل لتر ماء شرب لـ 5 أيام مع الحفاظ الفوري على جفاف النشارة بالتهوية الجيدة.";
        }
        
        res.json({ answer: mockResponse });
      }, 800);
      return;
    }

    const ai = getGeminiClient();
    
    // Build context system instruction
    const systemInstruction = 
      `أنت طبيب بيطري استشاري خبير عالمي حاصل على دكتوراه في رعاية وتسمين دواجن التسمين المكثف (Broiler Nutritionist & Poultry Vet Optimizer).\n` +
      `تعمل كمستشار تقني مخصص داخل "تطبيق الـ 5 كيلو" وهو تطبيق متخصص في توجيه المربين لتسمين الدجاج من عمر يوم (الكتكوت بوزن 40 جرام) للوصول لوزن عملاق يفوق 5 كيلوجرام (Heavy giants) بطرق آمنة وعلمية وصحية.\n\n` +
      `إليك القواعد الحاسمة في إجاباتك:\n` +
      `1. أجب دائماً باللغة العربية بأسلوب مشجع، مهني، علمي وعملي جداً يناسب المربين المبتدئين والمحترفين.\n` +
      `2. التركيز الأكبر هو تقديم حلول تطبيقية حقيقية (مثل جرعات الأدوية الشائعة مثل أمبروليوم 1جم/لتر، تيلوزين، فيتامين هـ + سيلينيوم، كيفية وزن وتغيير العلف، ضبط درجات الحرارة بدقة).\n` +
      `3. عند الحديث عن أوزان الدجاج الكبيرة للغاية (الأوزان الثقيلة فوق 3.5 كجم وصولاً لـ 5 كجم)، ركز بشدة على توجيههم لـ:\n` +
      `   أ. خفض درجة الحرارة لـ (18-20 درجة مئوية) لتفادي الاحتباس الحراري القاتل لأن الكتل اللحمية الكبيرة تولد حرارة عالية تميتها فورياً.\n` +
      `   ب. زيادة التهوية باستمرار وتفادي تراكم الأمونيا (التي تظهر برائحة وخز في العين).\n` +
      `   ج. رعاية وتثبيت المفاصل والأرجل لمنع الكساح بخلط الكالسيوم والفوسفور في العمر الصغير، وتقديم فترات إظلام مريحة لتقليل الضغط على الأوتار.\n` +
      `   د. استخدام مضادات السموم البيولوجية الفعالة تجنباً للموت المفاجئ نتيجة الكبد الدهني.\n` +
      `4. إذا سأل المربي عن مرض، اذكر الاسباب والعلاج والوقاية بالتحصين المناسب.\n` +
      `5. حافظ على الالتزام بالعلم وتجنب الخلطات الشعبية الضارة غير المدروسة علمياً، بل أرشدهم لأفضل ممارسات توازن الأعلاف والطاقة.\n` +
      `كن مباشرًا واستخدم نقاط واضحة وقوائم رشيقة لجعل إجاباتك قابلة للقراءة في حظيرة الدواجن من هاتف المربى الذكي.`;

    // Map history to parameters contents formatting if provided
    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        chatContents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }
    
    // Push the current user message at the end
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ answer: response.text || "لم يتمكن المستشار البيطري من صياغة إجابة دقيقة حالياً." });

  } catch (error: any) {
    console.error("Gemini Advisor Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة استفسارك البيطري: " + (error.message || error) });
  }
});

// 2. Setup Vite Server Middleware in Development OR Serve Built Assets in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[5Kilo App Broker] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
