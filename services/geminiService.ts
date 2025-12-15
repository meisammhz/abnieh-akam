import { GoogleGenAI, Type } from "@google/genai";
import { ProjectInputs, ProposalContent } from "../types";
import { formatCurrency, toPersianDigits } from "../utils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposalContent = async (inputs: ProjectInputs): Promise<ProposalContent> => {
  const prompt = `
    به عنوان یک مشاور ارشد سرمایه‌گذاری مسکن و مدیر پروژه حرفه‌ای برای "شرکت تعاونی عمرانی نوین ساز ابنیه آکام"، یک پروپوزال جامع و بسیار دقیق بنویس.
    
    اطلاعات فنی و فیزیکی پروژه:
    - نام پروژه: ${inputs.projectName}
    - موقعیت: ${inputs.location} (دسترسی‌ها: ${inputs.access})
    - متراژ زمین: ${inputs.landArea} متر مربع
    - سطح اشغال پارکینگ/فونداسیون: ${inputs.parkingOccupancyPercentage}٪ (تقریبا ${Math.round(inputs.landArea * inputs.parkingOccupancyPercentage / 100)} متر مربع)
    - سطح اشغال طبقات مسکونی/برج: ${inputs.residentialOccupancyPercentage}٪ (تقریبا ${Math.round(inputs.landArea * inputs.residentialOccupancyPercentage / 100)} متر مربع)
    - زیربنای کل (ناخالص): ${inputs.grossTotalArea} متر مربع | زیربنای مفید مسکونی: ${inputs.totalArea} متر
    - تجاری: ${inputs.commercialArea} متر مربع
    - تعداد: ${inputs.blocks} بلوک | ${inputs.floors} طبقه
    - نوع سازه: ${inputs.constructionType} | نما: ${inputs.facade} | کیفیت ساخت: ${inputs.constructionQuality}
    
    توضیحات توصیفی:
    - شرح کلی: ${inputs.projectDescription}
    - معماری و سبک: ${inputs.architectureStyle}
    - امکانات مشاعات خاص: ${inputs.commonAmenities}
    - رزومه سازنده: ${inputs.builderResume}
    
    سناریوهای مالی و شرایط پرداخت (بسیار مهم):
    - قیمت هر سهم ۱۰ متری (قدرالسهم): ${inputs.unitSharePrice} تومان (متری ۶۵ میلیون تومان)
    - نحوه پرداخت سهم: ۵۰٪ (${inputs.unitSharePrice * 0.5} تومان) نقد در ابتدا جهت صدور برگه سهم + ۵۰٪ (${inputs.unitSharePrice * 0.5} تومان) طی چک در تاریخ ${inputs.secondPaymentDate}.
    - هزینه ساخت: متری ${inputs.constructionCostPerMeter} تومان به صورت "علی‌الحساب".
    - نکته مهم ساخت: هزینه ساخت متغیر است و بر اساس تورم، قیمت مصالح و دستمزد، در مجمع عمومی تعاونی سالانه تعیین و اعلام می‌شود.
    - مدت اجرا: ${inputs.durationMonths} ماه
    - سناریوهای تورم: بدبینانه ${inputs.pessimisticGrowth}٪ - خوشبینانه ${inputs.optimisticGrowth}٪
    
    دستورالعمل نگارش:
    1. لحن باید بسیار حرفه‌ای، ترغیب‌کننده و بر پایه اصول اقتصادی مهندسی باشد.
    2. شرایط پرداخت دو مرحله‌ای (نقد + چک) را به عنوان یک شرایط منعطف و جذاب توضیح بده.
    3. مفهوم "علی‌الحساب" بودن هزینه ساخت را شفاف توضیح بده و بگو که مدیریت هزینه‌ها در تعاونی باعث بهینه‌سازی می‌شود.
    4. به تمایز سطح اشغال پارکینگ و مسکونی اشاره کن و فضای سبز (محوطه) حاصل از این تفاوت را به عنوان مزیت برجسته کن.
    5. رزومه سازنده را به عنوان نقطه قوت و تضمین پروژه برجسته کن.
    
    خروجی JSON باشد.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "خلاصه مدیریتی با تاکید بر رزومه و شرایط پرداخت جذاب" },
            locationAnalysis: { type: Type.STRING, description: "تحلیل دقیق موقعیت، دسترسی‌ها و آینده منطقه" },
            financialOutlook: { type: Type.STRING, description: "تحلیل سودآوری و توضیح شفاف مدل پرداخت علی‌الحساب" },
            architecturalVision: { type: Type.STRING, description: "توصیف سبک معماری و امکانات مشاعات با جزئیات دقیق" },
            riskAssessment: { type: Type.STRING, description: "مدیریت ریسک تورم و نقش مجمع عمومی در تعیین قیمت" }
          },
          required: ["executiveSummary", "locationAnalysis", "financialOutlook", "architecturalVision", "riskAssessment"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ProposalContent;
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      executiveSummary: "خطا در تولید محتوا. لطفا مجددا تلاش کنید.",
      locationAnalysis: "اطلاعات در دسترس نیست.",
      financialOutlook: "اطلاعات در دسترس نیست.",
      architecturalVision: "اطلاعات در دسترس نیست.",
      riskAssessment: "اطلاعات در دسترس نیست."
    };
  }
};