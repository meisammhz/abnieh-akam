import React from 'react';
import { ProjectInputs } from '../types';
import { toPersianDigits, formatCurrency } from '../utils';

interface Props {
  inputs: ProjectInputs;
  setInputs: React.Dispatch<React.SetStateAction<ProjectInputs>>;
  onGenerate: () => void;
  isGenerating: boolean;
}

const InputSidebar: React.FC<Props> = ({ inputs, setInputs, onGenerate, isGenerating }) => {
  
  const handleChange = (field: keyof ProjectInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper calculations for display
  const parkingArea = Math.round((inputs.landArea * inputs.parkingOccupancyPercentage) / 100);
  const residentialFootprint = Math.round((inputs.landArea * inputs.residentialOccupancyPercentage) / 100);
  const gardenArea = inputs.landArea - residentialFootprint;

  const initialPayment = inputs.unitSharePrice * 0.5;
  const secondPayment = inputs.unitSharePrice * 0.5;

  return (
    <div className="w-full lg:w-96 bg-white border-l border-gray-200 h-full overflow-y-auto p-5 shadow-xl z-10 shrink-0 text-sm scrollbar-thin scrollbar-thumb-gray-300">
      <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 flex items-center justify-between">
        <span>تنظیمات پروژه</span>
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">نسخه حرفه‌ای</span>
      </h2>

      <div className="space-y-6">
        
        {/* Section 0: Project Identity */}
        <div>
           <h3 className="text-gray-700 font-bold mb-3 pb-1 border-b border-gray-100 flex items-center">
             <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             اطلاعات پایه
           </h3>
           <div className="space-y-3">
              <div>
                 <label className="text-gray-500 text-xs block mb-1">نام پروژه</label>
                 <input type="text" value={inputs.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" />
              </div>
              <div>
                 <label className="text-gray-500 text-xs block mb-1">لوگو شرکت</label>
                 <div className="flex gap-2">
                   <input 
                    type="text" 
                    value={inputs.companyLogo.length > 50 ? inputs.companyLogo.substring(0, 50) + '...' : inputs.companyLogo} 
                    onChange={(e) => handleChange('companyLogo', e.target.value)} 
                    placeholder="لینک تصویر یا آپلود..." 
                    className="flex-1 p-2 border rounded-lg bg-gray-50 ltr text-left text-xs text-gray-600 focus:border-gray-500 outline-none overflow-hidden" 
                   />
                   <label className="cursor-pointer bg-akam-50 hover:bg-akam-100 text-akam-700 border border-akam-200 p-2 rounded-lg flex items-center justify-center transition-colors" title="آپلود لوگو">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                   </label>
                 </div>
              </div>
           </div>
        </div>

        {/* Section 1: Technical Specs */}
        <div>
          <h3 className="text-akam-700 font-bold mb-3 border-b border-gray-100 pb-1 flex items-center">
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            مشخصات فنی و فیزیکی
          </h3>
          <div className="space-y-3">
             {/* Land Area */}
             <div>
                <label className="text-gray-500 text-xs block mb-1">متراژ زمین (متر مربع)</label>
                <input type="number" value={inputs.landArea} onChange={(e) => handleChange('landArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-akam-500 outline-none font-bold" />
             </div>

             {/* Occupancy Levels */}
             <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                <p className="text-xs font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2">سطوح اشغال و لایه‌ها</p>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-500 text-[10px]">اشغال پارکینگ و پی</label>
                    <span className="text-[10px] text-blue-600 font-mono ltr">{toPersianDigits(parkingArea)} متر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={inputs.parkingOccupancyPercentage} onChange={(e) => handleChange('parkingOccupancyPercentage', Number(e.target.value))} className="w-16 p-1 border rounded text-center text-xs ltr text-gray-900" />
                    <span className="text-xs text-gray-400">%</span>
                    <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{width: `${Math.min(inputs.parkingOccupancyPercentage, 100)}%`}}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-gray-500 text-[10px]">اشغال طبقات مسکونی</label>
                    <span className="text-[10px] text-green-600 font-mono ltr">{toPersianDigits(residentialFootprint)} متر</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={inputs.residentialOccupancyPercentage} onChange={(e) => handleChange('residentialOccupancyPercentage', Number(e.target.value))} className="w-16 p-1 border rounded text-center text-xs ltr text-gray-900" />
                    <span className="text-xs text-gray-400">%</span>
                    <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500" style={{width: `${Math.min(inputs.residentialOccupancyPercentage, 100)}%`}}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                   <span className="text-xs text-gray-600">محوطه و فضای سبز:</span>
                   <span className="text-xs font-bold text-gray-800">{toPersianDigits(gardenArea)} متر مربع</span>
                </div>
             </div>
             
             {/* Floor Areas */}
             <div>
                <label className="text-gray-500 text-xs block mb-1">زیربنای کل (ناخالص/مشاعات+مفید)</label>
                <input type="number" value={inputs.grossTotalArea} onChange={(e) => handleChange('grossTotalArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-left text-gray-900 focus:border-akam-500 outline-none" />
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-gray-500 text-xs block mb-1">مفید مسکونی (خالص)</label>
                  <input type="number" value={inputs.totalArea} onChange={(e) => handleChange('totalArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-akam-500 outline-none" />
               </div>
               <div>
                  <label className="text-gray-500 text-xs block mb-1">مفید تجاری</label>
                  <input type="number" value={inputs.commercialArea} onChange={(e) => handleChange('commercialArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-akam-500 outline-none" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-gray-500 text-xs block mb-1">تعداد طبقات</label>
                  <input type="number" value={inputs.floors} onChange={(e) => handleChange('floors', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-akam-500 outline-none" />
               </div>
               <div>
                  <label className="text-gray-500 text-xs block mb-1">تعداد بلوک</label>
                  <input type="number" value={inputs.blocks} onChange={(e) => handleChange('blocks', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-akam-500 outline-none" />
               </div>
             </div>
          </div>
        </div>

        {/* Section 2: Financials & Scenarios */}
        <div>
          <h3 className="text-amber-600 font-bold mb-3 border-b border-gray-100 pb-1 flex items-center">
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            سناریوهای اقتصادی
          </h3>
          <div className="space-y-3">
             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-gray-500 text-xs block mb-1">مدت اجرا (ماه)</label>
                  <input type="number" value={inputs.durationMonths} onChange={(e) => handleChange('durationMonths', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
               </div>
               <div>
                  <label className="text-gray-500 text-xs block mb-1">پیشرفت پروژه (ماه)</label>
                  <input 
                    type="number" 
                    min={0} 
                    max={inputs.durationMonths}
                    value={inputs.elapsedMonths || 0} 
                    onChange={(e) => handleChange('elapsedMonths', Number(e.target.value))} 
                    className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-amber-500 outline-none" 
                  />
               </div>
             </div>
             
             <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs text-gray-500">درصد پیشرفت:</span>
                   <span className="text-xs font-bold text-gray-800">
                     {toPersianDigits(Math.round(((inputs.elapsedMonths || 0) / inputs.durationMonths) * 100))}%
                   </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max={inputs.durationMonths} 
                  value={inputs.elapsedMonths || 0}
                  onChange={(e) => handleChange('elapsedMonths', Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-gray-500 text-xs block mb-1">کیفیت ساخت</label>
                  <select value={inputs.constructionQuality} onChange={(e) => handleChange('constructionQuality', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-center text-gray-900 focus:border-amber-500 outline-none h-[38px]">
                    <option value="Standard">استاندارد</option>
                    <option value="Luxury">لوکس</option>
                    <option value="SuperLuxury">سوپر لوکس</option>
                  </select>
               </div>
               <div>
                  <label className="text-gray-500 text-xs block mb-1">هزینه ساخت علی‌الحساب</label>
                  <input type="number" value={inputs.constructionCostPerMeter} onChange={(e) => handleChange('constructionCostPerMeter', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-xs text-gray-900 focus:border-amber-500 outline-none" />
               </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="text-gray-500 text-xs block mb-1">هزینه ساخت پایه</label>
                  <input type="number" value={inputs.baseConstructionCost} onChange={(e) => handleChange('baseConstructionCost', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-xs text-gray-900 focus:border-amber-500 outline-none" />
               </div>
               <div>
                  <label className="text-gray-500 text-xs block mb-1">رشد قیمت (بدبینانه ٪)</label>
                  <input type="number" value={inputs.pessimisticGrowth} onChange={(e) => handleChange('pessimisticGrowth', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
               </div>
             </div>
          </div>
        </div>

        {/* Section 4: Sales Settings */}
        <div>
           <h3 className="text-purple-700 font-bold mb-3 border-b border-gray-100 pb-1 flex items-center">
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              شرایط فروش و پرداخت
           </h3>
           <div className="space-y-3">
              <div>
                 <label className="text-gray-500 text-xs block mb-1">قیمت کل هر سهم ۱۰ متری (تومان)</label>
                 <input type="number" value={inputs.unitSharePrice} onChange={(e) => handleChange('unitSharePrice', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-sm font-bold text-gray-900 focus:border-purple-500 outline-none" />
                 <p className="text-[10px] text-gray-400 mt-1 text-left ltr">({formatCurrency(Math.round(inputs.unitSharePrice/10))} / m²)</p>
              </div>

              <div className="bg-purple-50 p-3 rounded border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs text-purple-800">واریزی اول (۵۰٪):</span>
                   <span className="text-xs font-bold text-gray-800">{formatCurrency(initialPayment)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs text-purple-800">واریزی دوم (۵۰٪):</span>
                   <span className="text-xs font-bold text-gray-800">{formatCurrency(secondPayment)}</span>
                </div>
                <div>
                   <label className="text-gray-500 text-[10px] block mb-1">تاریخ چک مرحله دوم</label>
                   <input type="text" placeholder="1403/xx/xx" value={inputs.secondPaymentDate} onChange={(e) => handleChange('secondPaymentDate', e.target.value)} className="w-full p-1.5 border rounded bg-white ltr text-center text-xs text-gray-900 focus:border-purple-500 outline-none" />
                </div>
              </div>

              <div>
                 <label className="text-gray-500 text-xs block mb-1">مبلغ اضافه (اختیاری)</label>
                 <input type="number" value={inputs.additionalFee} onChange={(e) => handleChange('additionalFee', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-xs text-gray-900 focus:border-purple-500 outline-none" />
              </div>
           </div>
        </div>

        {/* Section 3: Detailed Description */}
        <div>
          <h3 className="text-blue-700 font-bold mb-3 border-b border-gray-100 pb-1 flex items-center">
             <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
             توضیحات و امکانات
          </h3>
          <div className="space-y-3">
             <div>
                <label className="text-gray-500 text-xs block mb-1">توضیحات کلی پروژه</label>
                <textarea 
                  value={inputs.projectDescription} 
                  onChange={(e) => handleChange('projectDescription', e.target.value)} 
                  placeholder="توضیحات کلی پروژه را وارد کنید..."
                  className="w-full p-2 border rounded-lg bg-gray-50 text-xs h-20 text-gray-900 focus:border-blue-500 outline-none" 
                />
             </div>
             <div>
                <label className="text-gray-500 text-xs block mb-1">توضیحات معماری و سبک</label>
                <textarea value={inputs.architectureStyle} onChange={(e) => handleChange('architectureStyle', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-xs h-20 text-gray-900 focus:border-blue-500 outline-none" />
             </div>
             <div>
                <label className="text-gray-500 text-xs block mb-1">امکانات مشاعات خاص</label>
                <textarea value={inputs.commonAmenities} onChange={(e) => handleChange('commonAmenities', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-xs h-20 text-gray-900 focus:border-blue-500 outline-none" />
             </div>
             <div>
                <label className="text-gray-500 text-xs block mb-1">رزومه و سوابق سازنده</label>
                <textarea value={inputs.builderResume} onChange={(e) => handleChange('builderResume', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-xs h-20 text-gray-900 focus:border-blue-500 outline-none" />
             </div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full mt-6 py-3 px-4 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2
            ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-akam-600 to-akam-500 hover:from-akam-700 hover:to-akam-600 transform hover:-translate-y-0.5'}
          `}
        >
          {isGenerating ? (
             <>
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               در حال تحلیل هوشمند...
             </>
          ) : 'بروزرسانی پروپوزال'}
        </button>
      </div>
    </div>
  );
};

export default InputSidebar;