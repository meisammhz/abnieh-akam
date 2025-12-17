import { GoogleGenAI, Type } from "@google/genai";
import { ProjectInputs, ProposalContent, ConstructionPhase, AnalysisSection } from "../types";
import { formatCurrency, toPersianDigits } from "../utils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateFeatureImage = async (prompt: string): Promise<{ imageBase64: string; prompt: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return { imageBase64: part.inlineData.data, prompt };
      }
    }
    return { imageBase64: '', prompt };
  } catch (error) {
    console.error("Gemini Feature Image Generation Error:", error);
    return { imageBase64: '', prompt };
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
    if (!responseText) throw new Error("Empty response from Gemini for phase suggestion.");
    const suggestedPhases: Omit<ConstructionPhase, 'id'>[] = JSON.parse(responseText);
    return suggestedPhases.map((phase, index) => ({ ...phase, id: Date.now() + index }));
  
  } catch (error) {
    console.error("Gemini Phase Suggestion Error:", error);
    return [];
  }
};

const EMPTY_ANALYSIS_SECTION: AnalysisSection = {
  text: "اطلاعات در دسترس نیست.",
  image: "",
  imagePrompt: "خطا در تولید تصویر."
};

export const generateProposalContent = async (inputs: ProjectInputs): Promise<ProposalContent> => {
  const totalDuration = inputs.constructionPhases.reduce((sum, phase) => sum + phase.durationMonths, 0);
  const totalBaseConstructionCost = inputs.constructionPhases.reduce((sum, phase) => sum + phase.costPerMeter, 0);
  const landCostPerMeter = inputs.unitSharePrice / inputs.unitShareSize;
  const totalBaseCostPerMeter = landCostPerMeter + totalBaseConstructionCost;
  const totalCostWithOverheadPerMeter = totalBaseCostPerMeter * (1 + inputs.adminOverheadPercentage / 100);

  // Occupancy calculations
  const totalParkingArea = inputs.landArea * (inputs.parkingOccupancyPercentage / 100) * inputs.undergroundFloors;
  const groundFloorArea = inputs.landArea * (inputs.groundFloorOccupancyPercentage / 100) * 1;
  const totalResidentialArea = inputs.landArea * (inputs.residentialOccupancyPercentage / 100) * inputs.floors;
  const calculatedGrossArea = totalParkingArea + groundFloorArea + totalResidentialArea;
  const isConsistent = inputs.grossTotalArea > 0 && Math.abs((calculatedGrossArea - inputs.grossTotalArea) / inputs.grossTotalArea) < 0.05;

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
    - تراکم کل اعلامی: ${toPersianDigits(inputs.grossTotalArea)} متر مربع
    - راستی‌آزمایی تراکم: ${isConsistent ? 'اعداد تطابق دارند و این نشانه خوبی است' : 'اعداد دارای مغایرت هستند، این مورد را در تحلیل ریسک لحاظ کن'}

    **دستورالعمل نگارش (با دقت و به صورت تفکیک شده اجرا شود):**
    با لحنی بسیار حرفه‌ای، تحلیلی و مطمئن، محتوای هر یک از بخش‌های زیر را تولید کن:

    1.  **خلاصه مدیریتی (executiveSummary):** با یک جمله قدرتمند در مورد فرصت سرمایه‌گذاری شروع کن. به "شکاف ارزشی" بین قیمت تمام شده و قیمت بازار اشاره کن. چشم‌انداز نهایی، موقعیت استراتژیک و کیفیت ساخت را خلاصه کن.

    2.  **تحلیل عمیق معماری و فنی (architecturalDeepDive):** این بخش باید بسیار دقیق و فنی باشد. توضیح بده که انتخاب‌های فنی (نوع سازه، سقف، نما) چگونه بر کیفیت، دوام و سرعت ساخت تاثیر می‌گذارند. به تطابق تراکم اعلامی و محاسبه شده به عنوان شاهدی بر دقت در برنامه‌ریزی اشاره کن.

    3.  **تحلیل استراتژیک موقعیت و دسترسی (locationAndAccessAnalysis):** تحلیل کن که این موقعیت چگونه بر سبک زندگی ساکنین و پتانسیل رشد ارزش ملک در آینده تاثیر می‌گذارد. مزایای کلیدی (${inputs.locationAdvantages}) را به ارزش سرمایه‌گذاری گره بزن.

    4.  **مدل مالی و توجیه اقتصادی پروژه (financialModelAndProfitability):** مدل مالی تعاونی را شرح بده. توضیح بده که هزینه‌های بالاسری (${toPersianDigits(inputs.adminOverheadPercentage)}%) چگونه ریسک پروژه را کاهش می‌دهند.

    5.  **ارزش پیشنهادی برای سرمایه‌گذار/خریدار (investorValueProposition):** توضیح بده که سود خریدار از دو محل "شکاف ارزشی" اولیه و "رشد عمومی قیمت مسکن" تامین می‌شود. با استفاده از اعداد، این ارزش را ملموس کن.

    6.  **تحلیل ریسک و راهکارهای مدیریتی (riskAndMitigation):** ریسک‌های اصلی (تورم، تاخیر) را شناسایی کن. توضیح بده که ساختار تعاونی و مدیریت حرفه‌ای چگونه این ریسک‌ها را برای اعضا به حداقل می‌رساند. ${isConsistent ? '' : 'به صورت ویژه، به مغایرت بین تراکم اعلامی و محاسبه شده به عنوان یک ریسک برنامه‌ریزی اشاره کن و پیشنهاد بده که این اعداد باید قبل از شروع پروژه نهایی شوند.'}

    7.  **تحلیل سرمایه‌گذاری برای خریدار (investorAnalysis):** این بخش باید یک مقاله کوتاه و متقاعدکننده برای خریدار سهام باشد. با تمرکز بر آینده، توضیح بده که چرا این پروژه چیزی فراتر از یک خانه است؛ یک سرمایه‌گذاری هوشمندانه است. به مزایای موقعیت (${inputs.locationAdvantages}) اشاره کن و توضیح بده که چگونه این دسترسی‌ها و پتانسیل رشد منطقه، ارزش ملک را در بلندمدت تضمین می‌کند. سپس، به امکانات رفاهی (${inputs.commonAmenities}) بپرداز و شرح بده که این امکانات چگونه یک "سبک زندگی" متمایز ایجاد کرده و تقاضا برای این پروژه را در آینده افزایش می‌دهد. در نهایت، با لحنی الهام‌بخش، چشم‌انداز زندگی در این پروژه را ترسیم کن.

    8.  **تحلیل استراتژیک برای تعاونی (cooperativeAnalysis):** این بخش برای هیئت مدیره و مدیران تعاونی است. پروژه را در مقایسه با بازار منطقه تحلیل کن. توضیح بده که چگونه کیفیت ساخت (${inputs.architectureStyle}, ${inputs.facade}) و امکانات رفاهی، یک مزیت رقابتی پایدار ایجاد می‌کند. به رزومه سازنده (${inputs.builderResume}) به عنوان عاملی برای کاهش ریسک و افزایش اعتبار اشاره کن. در پایان، نتیجه‌گیری کن که این پروژه چگونه با اهداف بلندمدت تعاونی (ایجاد ارزش برای اعضا، تقویت برند) هم‌راستا است و چرا یک پروژه موفق و استراتژیک محسوب می‌شود.

    خروجی باید یک JSON کامل با کلیدهای مشخص شده باشد.
  `;
  
  try {
    const mainConceptualPrompt = `Photorealistic architectural rendering of a modern luxury residential complex named '${inputs.projectName}'. 
      The structure consists of ${inputs.blocks} towers, each with ${inputs.floors} floors. 
      The facade is a '${inputs.facade}'.
      The overall architectural style is '${inputs.architectureStyle}'.
      Show the building from a slightly low angle on a bright, sunny day. High detail, 4k resolution.`;

    const amenitiesPrompt = `A stunning, photorealistic interior shot of a luxury residential building's amenities. 
      The scene should feature: ${inputs.commonAmenities}. 
      The atmosphere is serene, elegant, and modern. Natural light streams in through large windows. High detail, 4k resolution.`;
      
    const locationPrompt = `A vibrant, sunny day, street-level photograph capturing the essence of a desirable urban neighborhood in Tehran. 
      The scene should reflect these advantages: '${inputs.locationAdvantages}'.
      Show modern apartment buildings, clean sidewalks, some greenery, and perhaps a glimpse of a nearby cafe or park. The feeling should be safe, accessible, and upscale. High detail, photorealistic.`;

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
            investorAnalysis: { type: Type.STRING },
            cooperativeAnalysis: { type: Type.STRING },
          },
          required: ["executiveSummary", "architecturalDeepDive", "locationAndAccessAnalysis", "financialModelAndProfitability", "investorValueProposition", "riskAndMitigation", "investorAnalysis", "cooperativeAnalysis"]
        }
      }
    });

    const [textResponse, mainImage, amenitiesImage, locationImage] = await Promise.all([
      textResponsePromise,
      generateFeatureImage(mainConceptualPrompt),
      generateFeatureImage(amenitiesPrompt),
      generateFeatureImage(locationPrompt),
    ]);
    
    const responseText = textResponse.text;
    if (!responseText) throw new Error("No text response from Gemini.");
    const parsedText = JSON.parse(responseText);

    return {
      executiveSummary: parsedText.executiveSummary,
      architecturalDeepDive: parsedText.architecturalDeepDive,
      locationAndAccessAnalysis: parsedText.locationAndAccessAnalysis,
      financialModelAndProfitability: parsedText.financialModelAndProfitability,
      investorValueProposition: parsedText.investorValueProposition,
      riskAndMitigation: parsedText.riskAndMitigation,
      conceptualImage: mainImage.imageBase64,
      conceptualImagePrompt: mainImage.prompt,
      investorAnalysis: {
        text: parsedText.investorAnalysis,
        image: amenitiesImage.imageBase64,
        imagePrompt: amenitiesImage.prompt,
      },
      cooperativeAnalysis: {
        text: parsedText.cooperativeAnalysis,
        image: locationImage.imageBase64,
        imagePrompt: locationImage.prompt,
      }
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
      conceptualImagePrompt: 'خطا در تولید تصویر.',
      investorAnalysis: EMPTY_ANALYSIS_SECTION,
      cooperativeAnalysis: EMPTY_ANALYSIS_SECTION,
    };
  }
};