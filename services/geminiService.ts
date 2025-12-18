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
    2.  برای هر فاز، **مدت زمان اجرا به ماه (durationMonths)** را بر اساس مشخصات پروژه تخمین بزن.
    3.  برای هر فاز، **هزینه ساخت هر متر مربع به تومان (costPerMeter)** را به صورت یک عدد خام و بدون جداکننده تخمین بزن.
    4.  نام فازها باید کوتاه، استاندارد و فارسی باشد.
    خروجی باید یک آرایه JSON کامل از اشیاء باشد.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    if (!responseText) throw new Error("Empty response from Gemini.");
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
  const totalCostWithOverheadPerMeter = (inputs.marketPricePerMeter * 0.7); // Mock calc for prompt context

  const textPrompt = `
    به عنوان یک مشاور ارشد سرمایه‌گذاری در ایران، یک پروپوزال جامع برای پروژه "${inputs.projectName}" تهیه کن.
    
    **اطلاعات پروژه:**
    - نام: ${inputs.projectName}
    - موقعیت: ${inputs.location}
    - مزایا: ${inputs.locationAdvantages}
    - سبک: ${inputs.architectureStyle}
    - قیمت نهایی: متری ${formatCurrency(totalCostWithOverheadPerMeter)} تومان
    - قیمت بازار: متری ${formatCurrency(inputs.marketPricePerMeter)} تومان

    محتوای بخش‌های executiveSummary، architecturalDeepDive، locationAndAccessAnalysis، financialModelAndProfitability، investorValueProposition، riskAndMitigation، investorAnalysis و cooperativeAnalysis را به زبان فارسی و با لحن حرفه‌ای تولید کن.
  `;
  
  try {
    const textResponsePromise = ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const [textResponse, mainImage] = await Promise.all([
      textResponsePromise,
      generateFeatureImage(`Luxury modern building exterior of '${inputs.projectName}' in Tehran, photorealistic, 4k.`),
    ]);
    
    const responseText = textResponse.text;
    if (!responseText) throw new Error("No text response.");
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
      investorAnalysis: { text: parsedText.investorAnalysis, image: "", imagePrompt: "" },
      cooperativeAnalysis: { text: parsedText.cooperativeAnalysis, image: "", imagePrompt: "" }
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      executiveSummary: "خطا در تولید محتوا.",
      architecturalDeepDive: "...",
      locationAndAccessAnalysis: "...",
      financialModelAndProfitability: "...",
      investorValueProposition: "...",
      riskAndMitigation: "...",
      conceptualImage: '',
      conceptualImagePrompt: '',
      investorAnalysis: EMPTY_ANALYSIS_SECTION,
      cooperativeAnalysis: EMPTY_ANALYSIS_SECTION,
    };
  }
};