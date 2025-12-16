import { GoogleGenAI, Type } from "@google/genai";
import { ProjectInputs, ProposalContent, ConstructionPhase } from "../types";
import { formatCurrency, toPersianDigits } from "../utils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateConceptualImage = async (inputs: ProjectInputs): Promise<{ imageBase64: string; prompt: string }> => {
  const prompt = `Photorealistic architectural rendering of a modern luxury residential complex named '${inputs.projectName}'. 
  The structure consists of ${inputs.blocks} towers, each with ${inputs.floors} floors above ground and ${inputs.undergroundFloors} underground levels. 
  The facade is a '${inputs.facade}'.
  The overall architectural style is '${inputs.architectureStyle}'.
  The project vibe is '${inputs.projectVibe}'.
  Show the building from a slightly low angle on a bright, sunny day with a clear blue sky. 
  Include some green landscaping and trees in the foreground. High detail, 4k resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { imageBase64: part.inlineData.data, prompt: prompt };
      }
    }
    return { imageBase64: '', prompt: prompt };
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return { imageBase64: '', prompt: prompt };
  }
};

export const suggestConstructionPhases = async (
  inputs: Pick<ProjectInputs, 'constructionType' | 'floors' | 'blocks' | 'undergroundFloors' | 'landCondition' | 'grossTotalArea'>
): Promise<ConstructionPhase[]> => {
  const constructionTypeMap = {
    'Steel': 'اسکلت فلزی پیچ و مهره',
    'Concrete': 'اسکلت بتنی',
    'TunnelForm': 'سیستم قالب تونلی'
  };

  const landConditionMap = {
    'Normal': 'مسطح و خاک عادی',
    'Sloped': 'دارای شیب',
    'Complex': 'نیازمند پایدارسازی یا خاک سست'
  };
  
  const prompt = `
    به عنوان یک مهندس عمران و مدیر پروژه ارشد در ایران، یک جدول فازبندی ساختمانی دقیق و واقع‌بینانه برای پروژه زیر تهیه کن.
    
    **مشخصات کلیدی پروژه:**
    - **نوع سازه:** ${constructionTypeMap[inputs.constructionType]}
    - **تعداد طبقات روی زمین:** ${inputs.floors}
    - **تعداد طبقات زیر زمین (منفی):** ${inputs.undergroundFloors}
    - **تعداد بلوک:** ${inputs.blocks}
    - **تراکم کل:** ${inputs.grossTotalArea} متر مربع
    - **وضعیت زمین:** ${landConditionMap[inputs.landCondition]}

    **دستورالعمل:**
    1.  فازهای اصلی ساخت از "گودبرداری و پایدارسازی" تا "نازک‌کاری و تحویل" را لیست کن.
    2.  برای هر فاز، **مدت زمان اجرا به ماه (durationMonths)** را بر اساس مشخصات پروژه تخمین بزن. (مثلا گودبرداری برای ${inputs.undergroundFloors} طبقه منفی زمان بیشتری می‌برد).
    3.  برای هر فاز، **هزینه ساخت هر متر مربع به تومان (costPerMeter)** را به صورت یک عدد خام و بدون جداکننده تخمین بزن. این هزینه باید منعکس کننده نوع سازه و مقیاس پروژه باشد.
    4.  نام فازها باید کوتاه، استاندارد و فارسی باشد.

    **مثال برای یک فاز:**
    { "name": "گودبرداری و فونداسیون", "durationMonths": 9, "costPerMeter": 15000000 }

    خروجی باید یک آرایه JSON کامل از اشیاء باشد و هیچ متن اضافی دیگری نداشته باشد.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              durationMonths: { type: Type.INTEGER },
              costPerMeter: { type: Type.NUMBER },
            },
            required: ["name", "durationMonths", "costPerMeter"],
          },
        },
      },
    });
    const responseText = response.text;
    if (!responseText) {
      console.error("Gemini Phase Suggestion Error: Empty response text.");
      return [];
    }
    const suggestedPhases: Omit<ConstructionPhase, 'id'>[] = JSON.parse(responseText);
    return suggestedPhases.map((phase, index) => ({ ...phase, id: Date.now() + index }));
  
  } catch (error) {
    console.error("Gemini Phase Suggestion Error:", error);
    return [];
  }
};


export const generateProposalContent = async (inputs: ProjectInputs): Promise<ProposalContent> => {
  const totalDuration = inputs.constructionPhases.reduce((sum, phase) => sum + phase.durationMonths, 0);
  const totalBaseConstructionCost = inputs.constructionPhases.reduce((sum, phase) => sum + phase.costPerMeter, 0);
  const landCostPerMeter = inputs.unitSharePrice / inputs.unitShareSize;
  const totalBaseCostPerMeter = landCostPerMeter + totalBaseConstructionCost;
  const totalCostWithOverheadPerMeter = totalBaseCostPerMeter * (1 + inputs.adminOverheadPercentage / 100);

  const textPrompt = `
    به عنوان یک مشاور ارشد سرمایه‌گذاری و مهندس معمار در ایران، یک پروپوزال بسیار جامع، عمیق، فنی و متقاعدکننده برای پروژه "${inputs.projectName}" تهیه کن.
    
    **اطلاعات خام پروژه:**
    - نام پروژه: ${inputs.projectName}
    - موقعیت: ${inputs.location}
    - مزایای کلیدی موقعیت: ${inputs.locationAdvantages}
    - سبک معماری: ${inputs.architectureStyle}
    - چشم‌انداز کلی (Vibe): ${inputs.projectVibe}
    - امکانات مشاعی: ${inputs.commonAmenities}
    - قیمت تمام شده نهایی (با احتساب بالاسری): متری ${formatCurrency(totalCostWithOverheadPerMeter)} تومان
    - قیمت روز واحد مشابه آماده در منطقه: متری ${formatCurrency(inputs.marketPricePerMeter)} تومان
    - رزومه سازنده: ${inputs.builderResume}

    **مشخصات فنی دقیق:**
    - **نوع سازه:** ${inputs.constructionType === 'Steel' ? 'اسکلت فلزی' : 'اسکلت بتنی'}
    - **سیستم فونداسیون:** ${inputs.foundationSystem}
    - **سیستم سقف‌ها:** ${inputs.roofSystem}
    - **متریال نما:** ${inputs.facade}
    - **نازک‌کاری داخلی:** ${inputs.interiorFinishes}
    - **سیستم سرمایش و گرمایش:** ${inputs.hvacSystem}
    - **سیستم برق و هوشمندسازی:** ${inputs.electricalSystem}

    **توضیحات تکمیلی:**
    - **شرح کلی پروژه:** ${inputs.projectDescription}
    - **جزئیات ساخت:** ${inputs.constructionDescription}
    - **جزئیات نما:** ${inputs.facadeDescription}
    - **جزئیات سفت‌کاری:** ${inputs.coreShellDescription}

    **دستورالعمل نگارش (با دقت و به صورت تفکیک شده اجرا شود):**
    با لحنی بسیار حرفه‌ای، تحلیلی و مطمئن، محتوای هر یک از بخش‌های زیر را تولید کن:

    1.  **خلاصه مدیریتی (executiveSummary):** با یک جمله قدرتمند در مورد فرصت سرمایه‌گذاری شروع کن. بلافاصله به "شکاف ارزشی" بین قیمت تمام شده نهایی و قیمت بازار اشاره کن. چشم‌انداز نهایی پروژه، موقعیت استراتژیک و کیفیت ساخت متمایز آن را (با اشاره به یکی از مشخصات فنی کلیدی) به طور خلاصه بیان کن.

    2.  **تحلیل عمیق معماری و فنی (architecturalDeepDive):** این بخش باید بسیار دقیق و فنی باشد. از "توضیحات تکمیلی" بالا برای غنی کردن این بخش استفاده کن.
        - **تحلیل فنی و ساخت:** با استفاده از '${inputs.coreShellDescription}' و '${inputs.constructionDescription}'، توضیح بده که انتخاب '${inputs.roofSystem}' برای سقف‌ها و '${inputs.foundationSystem}' برای فونداسیون چگونه بر سرعت ساخت، استحکام و ایمنی سازه تاثیر می‌گذارد. به نکات خاص و متمایز در فرآیند ساخت اشاره کن.
        - **تحلیل نما:** با استفاده از '${inputs.facadeDescription}'، توضیح بده که متریال نما (${inputs.facade}) چگونه علاوه بر زیبایی، به عایق‌بندی حرارتی و صوتی و کاهش هزینه‌های بلندمدت ساکنین کمک می‌کند. به جزئیات طراحی اشاره کن.
        - **تحلیل داخلی و تاسیسات:** شرح بده که انتخاب '${inputs.interiorFinishes}' و سیستم '${inputs.hvacSystem}' چگونه یک "سبک زندگی" لوکس و راحت را برای ساکنین فراهم می‌کند و این پروژه را از رقبای منطقه متمایز می‌سازد.

    3.  **تحلیل استراتژیک موقعیت و دسترسی (locationAndAccessAnalysis):** به جای تکرار نام دسترسی‌ها، تحلیل کن که این موقعیت (${inputs.location}) چگونه بر سبک زندگی ساکنین تاثیر می‌گذارد. به پتانسیل رشد منطقه، پروژه‌های توسعه آتی در اطراف آن و چگونگی تبدیل شدن این منطقه به یک هاب ارزشمند در آینده اشاره کن. مزایای (${inputs.locationAdvantages}) را به ارزش سرمایه‌گذاری گره بزن.

    4.  **مدل مالی و توجیه اقتصادی پروژه (financialModelAndProfitability):** این بخش برای هیئت مدیره و سرمایه‌گذاران است. مدل مالی تعاونی را شرح بده. به صورت شفاف توضیح بده که قیمت تمام شده چگونه محاسبه شده (تفکیک زمین و ساخت). سپس توضیح بده که هزینه‌های بالاسری (${toPersianDigits(inputs.adminOverheadPercentage)}%) چگونه هزینه‌های پیش‌بینی نشده، مدیریت و نظارت را پوشش می‌دهند تا ریسک پروژه کاهش یابد.

    5.  **ارزش پیشنهادی برای سرمایه‌گذار/خریدار (investorValueProposition):** این بخش برای خریدار نهایی است. به زبان ساده و مستقیم، توضیح بده که سود او از دو محل اصلی تامین می‌شود: ۱) سود آنی ناشی از "شکاف ارزشی" (خرید بسیار ارزان‌تر از واحد آماده) و ۲) سود ناشی از رشد عمومی قیمت مسکن در طی دوره ساخت. با استفاده از اعداد (${formatCurrency(totalCostWithOverheadPerMeter)} در مقابل ${formatCurrency(inputs.marketPricePerMeter)})، این ارزش را ملموس کن.

    6.  **تحلیل ریسک و راهکارهای مدیریتی (riskAndMitigation):** به صورت حرفه‌ای، ریسک‌های اصلی پروژه مانند تورم هزینه‌های ساخت و تاخیر در زمان‌بندی را شناسایی کن. سپس توضیح بده که ساختار تعاونی، قراردادهای شفاف، و مدیریت پروژه حرفه‌ای (${inputs.builderResume}) چگونه این ریسک‌ها را برای اعضا به حداقل می‌رساند.

    خروجی باید یک JSON کامل با کلیدهای مشخص شده باشد.
  `;
  
  let textContent: Omit<ProposalContent, 'conceptualImage' | 'conceptualImagePrompt'> = {
      executiveSummary: "در حال تولید محتوا...",
      architecturalDeepDive: "",
      locationAndAccessAnalysis: "",
      financialModelAndProfitability: "",
      investorValueProposition: "",
      riskAndMitigation: ""
  };

  try {
    const textResponsePromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            architecturalDeepDive: { type: Type.STRING },
            locationAndAccessAnalysis: { type: Type.STRING },
            financialModelAndProfitability: { type: Type.STRING },
            investorValueProposition: { type: Type.STRING },
            riskAndMitigation: { type: Type.STRING },
          },
          required: ["executiveSummary", "architecturalDeepDive", "locationAndAccessAnalysis", "financialModelAndProfitability", "investorValueProposition", "riskAndMitigation"]
        }
      }
    });

    const imageResponsePromise = generateConceptualImage(inputs);
    const [textResponse, imageResult] = await Promise.all([textResponsePromise, imageResponsePromise]);
    
    const responseText = textResponse.text;
    if (responseText) {
      textContent = JSON.parse(responseText);
    } else {
       throw new Error("No text response from Gemini.");
    }

    return {
      ...textContent,
      conceptualImage: imageResult.imageBase64,
      conceptualImagePrompt: imageResult.prompt
    };

  } catch (error) {
    console.error("Gemini API Error in Proposal Generation:", error);
    return {
      executiveSummary: "خطا در تولید محتوای متنی. لطفا مجددا تلاش کنید.",
      architecturalDeepDive: "اطلاعات در دسترس نیست.",
      locationAndAccessAnalysis: "اطلاعات در دسترس نیست.",
      financialModelAndProfitability: "اطلاعات در دسترس نیست.",
      investorValueProposition: "اطلاعات در دسترس نیست.",
      riskAndMitigation: "اطلاعات در دسترس نیست.",
      conceptualImage: '',
      conceptualImagePrompt: 'خطا در تولید تصویر.'
    };
  }
};