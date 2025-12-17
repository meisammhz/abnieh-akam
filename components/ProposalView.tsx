import React from 'react';
import { ProjectInputs, ProposalContent } from '../types';
import { toPersianDigits, getCurrentShamsiDate, formatCurrency } from '../utils';

interface Props {
  inputs: ProjectInputs;
  content: ProposalContent;
}

const Section: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode }> = ({ title, icon, children }) => (
    <section className="break-inside-avoid-page">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="prose prose-sm max-w-none text-justify text-gray-700 leading-6">
            {children}
        </div>
    </section>
);


const ProposalView: React.FC<Props> = ({ inputs, content }) => {
  const baseTotalConstructionCostPerMeter = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.costPerMeter || 0), 0);
  const landCostPerMeter = inputs.unitSharePrice / inputs.unitShareSize;
  const totalBaseCostPerMeter = landCostPerMeter + baseTotalConstructionCostPerMeter;
  const totalCostWithOverheadPerMeter = totalBaseCostPerMeter * (1 + inputs.adminOverheadPercentage / 100);
  const initialValueGapPerMeter = inputs.marketPricePerMeter - totalCostWithOverheadPerMeter;

  // Occupancy calculations for breakdown table
  const totalParkingArea = inputs.landArea * (inputs.parkingOccupancyPercentage / 100) * inputs.undergroundFloors;
  const groundFloorArea = inputs.landArea * (inputs.groundFloorOccupancyPercentage / 100) * 1;
  const totalResidentialArea = inputs.landArea * (inputs.residentialOccupancyPercentage / 100) * inputs.floors;
  const calculatedGrossArea = totalParkingArea + groundFloorArea + totalResidentialArea;
  const areaDifference = calculatedGrossArea - inputs.grossTotalArea;
  const differencePercentage = inputs.grossTotalArea > 0 ? Math.abs(areaDifference / inputs.grossTotalArea) * 100 : 0;
  const isConsistent = differencePercentage < 5; // Allow up to 5% variance for rounding etc.

  const renderAnalysisSection = (analysis: { text: string; image: string; }, imageCaption: string) => (
    <>
      <p>{analysis.text}</p>
      {analysis.image ? (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg my-8">
          <img src={`data:image/png;base64,${analysis.image}`} alt={imageCaption} className="w-full h-auto object-cover" />
          <p className="text-center text-xs text-gray-400 p-3 bg-gray-900">
            * {imageCaption}
          </p>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-100 rounded-lg my-8">
            <p className="text-gray-500">تصویر مفهومی در حال پردازش است...</p>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl my-8 min-h-screen print:shadow-none print:m-0">
      
      {/* Cover Page */}
      <div className="h-[1100px] relative flex flex-col items-center justify-center bg-gray-50 overflow-hidden text-center p-12 border-b-8 border-akam-600">
        <div className="absolute top-0 left-0 w-full h-64 bg-akam-600 opacity-10 transform -skew-y-6 origin-top-left"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gray-800 opacity-5 transform skew-y-6 origin-bottom-right"></div>
        
        <div className="z-10 relative w-full flex flex-col items-center">
          <h4 className="text-akam-600 tracking-[0.2em] uppercase text-sm font-bold mb-8">گزارش امکان‌سنجی و طرح توجیهی</h4>
          
          <div className="mb-8">
            {inputs.companyLogo ? (
              <img src={inputs.companyLogo} alt="Company Logo" className="h-24 md:h-32 object-contain" />
            ) : (
              <h2 className="text-3xl text-gray-700 font-bold">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</h2>
            )}
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">پروژه {inputs.projectName}</h1>
          <p className="max-w-xl mx-auto text-gray-600 leading-7 text-sm">{inputs.projectVibe}</p>
          
          <div className="w-64 h-64 mx-auto mb-12 rounded-full overflow-hidden shadow-2xl border-4 border-white mt-8">
             <img src={inputs.facadeImage || "https://picsum.photos/seed/building1/800/800"} alt="Building Facade" className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-2 gap-8 text-right max-w-lg mx-auto text-sm text-gray-600">
             <div className="border-r-2 border-akam-500 pr-4">
               <p className="font-bold text-gray-900">تاریخ گزارش</p>
               <p>{toPersianDigits(getCurrentShamsiDate())}</p>
             </div>
             <div className="border-r-2 border-gray-300 pr-4">
               <p className="font-bold text-gray-900">موقعیت پروژه</p>
               <p>{inputs.location}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12 md:p-16 space-y-12">
        <Section title="خلاصه مدیریتی" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}>
          <p>{content.executiveSummary}</p>
        </Section>
        
        <hr className="border-gray-100" />
        
        <Section title="تحلیل عمیق معماری و فنی" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}>
            <p>{content.architecturalDeepDive}</p>

            <div className="not-prose my-8 border border-gray-200 rounded-xl overflow-hidden">
                <h4 className="text-base font-bold text-gray-800 p-4 bg-gray-50 border-b border-gray-200">راستی‌آزمایی تراکم ساختمانی</h4>
                <table className="w-full text-sm">
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="p-2 text-gray-600 text-xs">مساحت زمین</td>
                            <td className="p-2 font-mono text-left font-bold text-gray-700 text-sm">{toPersianDigits(inputs.landArea.toLocaleString())} م²</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-2 text-gray-600 text-xs">مساحت کل پارکینگ‌ها ({toPersianDigits(inputs.undergroundFloors)} طبقه با اشغال {toPersianDigits(inputs.parkingOccupancyPercentage)}٪)</td>
                            <td className="p-2 font-mono text-left font-bold text-gray-700 text-sm">{toPersianDigits(Math.round(totalParkingArea).toLocaleString())} م²</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-2 text-gray-600 text-xs">مساحت طبقه همکف (با اشغال {toPersianDigits(inputs.groundFloorOccupancyPercentage)}٪)</td>
                            <td className="p-2 font-mono text-left font-bold text-gray-700 text-sm">{toPersianDigits(Math.round(groundFloorArea).toLocaleString())} م²</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                            <td className="p-2 text-gray-600 text-xs">مساحت کل طبقات مسکونی ({toPersianDigits(inputs.floors)} طبقه با اشغال {toPersianDigits(inputs.residentialOccupancyPercentage)}٪)</td>
                            <td className="p-2 font-mono text-left font-bold text-gray-700 text-sm">{toPersianDigits(Math.round(totalResidentialArea).toLocaleString())} م²</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                            <td className="p-2 text-gray-800 text-sm">تراکم کل محاسبه شده (بر اساس سطح اشغال)</td>
                            <td className="p-2 font-mono text-left text-blue-600 text-sm">{toPersianDigits(Math.round(calculatedGrossArea).toLocaleString())} م²</td>
                        </tr>
                        <tr>
                            <td className="p-2 text-gray-800 text-sm">تراکم کل اعلامی پروژه</td>
                            <td className="p-2 font-mono text-left text-blue-600 text-sm">{toPersianDigits(inputs.grossTotalArea.toLocaleString())} م²</td>
                        </tr>
                    </tbody>
                </table>
                <div className={`p-3 text-center font-medium ${isConsistent ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                    {isConsistent 
                        ? `تطابق اعداد (با اختلاف جزئی ${toPersianDigits(differencePercentage.toFixed(1))}٪) نشان‌دهنده دقت بالای محاسبات و امکان‌سنجی پروژه است.`
                        : `اختلاف ${toPersianDigits(differencePercentage.toFixed(1))}٪ بین تراکم اعلامی و محاسبه‌شده نیازمند بازبینی است.`
                    }
                </div>
            </div>

            {content.conceptualImage ? (
                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg my-8">
                    <img src={`data:image/png;base64,${content.conceptualImage}`} alt="AI Generated Concept" className="w-full h-auto object-cover" />
                    <p className="text-center text-xs text-gray-400 p-3 bg-gray-900">
                        * این تصویر یک کانسپت هنری است که توسط هوش مصنوعی بر اساس مشخصات پروژه تولید شده است.
                    </p>
                </div>
            ) : (
                <div className="text-center p-8 bg-gray-100 rounded-lg my-8">
                    <p className="text-gray-500">تصویر مفهومی در حال پردازش است...</p>
                </div>
            )}
        </Section>

        <hr className="border-gray-100" />
        
        <Section title="تحلیل استراتژیک موقعیت و دسترسی" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
           <p>{content.locationAndAccessAnalysis}</p>
        </Section>

        <hr className="border-gray-100" />

        <Section title="مدل مالی و توجیه اقتصادی پروژه" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
            <p>{content.financialModelAndProfitability}</p>
        </Section>
        
        <hr className="border-gray-100" />
        
        <Section title="ارزش پیشنهادی برای سرمایه‌گذار" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
            <p>{content.investorValueProposition}</p>
             <div className="bg-slate-900 text-white rounded-xl p-8 my-8 text-center not-prose">
               <h4 className="text-lg font-bold mb-2">شکاف ارزشی: فرصت طلایی سرمایه‌گذاری</h4>
               <p className="text-slate-400 text-xs mb-6">مقایسه هزینه تمام شده (با بالاسری) با قیمت روز بازار (هر متر مربع)</p>
               <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                 <div className="flex-1">
                   <p className="text-base text-slate-300">قیمت بازار</p>
                   <p className="text-3xl font-bold my-1 text-blue-400">{formatCurrency(inputs.marketPricePerMeter)}</p>
                 </div>
                 <div className="text-3xl font-thin text-slate-500">-</div>
                 <div className="flex-1">
                   <p className="text-base text-slate-300">قیمت تمام شده ما</p>
                   <p className="text-3xl font-bold my-1 text-amber-400">{formatCurrency(totalCostWithOverheadPerMeter)}</p>
                 </div>
                 <div className="text-3xl font-thin text-slate-500">=</div>
                 <div className="flex-1 bg-slate-800 p-4 rounded-lg border border-slate-700">
                   <p className="text-base text-emerald-400 font-bold">سود اولیه شما</p>
                   <p className="text-3xl font-extrabold my-1 text-white">{formatCurrency(initialValueGapPerMeter)}</p>
                 </div>
               </div>
            </div>
        </Section>
        
        <hr className="border-gray-100" />

        <Section title="تحلیل سرمایه‌گذاری برای خریدار" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
            {renderAnalysisSection(content.investorAnalysis, "کانسپت هنری از امکانات رفاهی پروژه.")}
        </Section>
        
        <hr className="border-gray-100" />
        
        <Section title="تحلیل استراتژیک برای تعاونی" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}>
            {renderAnalysisSection(content.cooperativeAnalysis, "کانسپت هنری از موقعیت مکانی و سبک زندگی منطقه.")}
        </Section>

        <hr className="border-gray-100" />
        
        <Section title="تحلیل ریسک و راهکارهای مدیریتی" icon={<svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}>
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-6 prose max-w-none">
              <p className="text-amber-800">{content.riskAndMitigation}</p>
            </div>
        </Section>


        <div className="text-center mt-16 pt-16 border-t border-gray-100">
           <p className="text-gray-400 text-sm mb-2">تهیه شده توسط سامانه هوشمند مدیریت پروژه</p>
           {inputs.companyLogo ? (
             <img src={inputs.companyLogo} alt="Company Logo" className="h-10 mx-auto" />
           ) : (
             <h3 className="font-bold text-gray-800">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</h3>
           )}
           <p className="text-xs text-gray-400 mt-4 dir-ltr">Powered by AI Project Management System • Confidential</p>
        </div>
      </div>
    </div>
  );
};

export default ProposalView;