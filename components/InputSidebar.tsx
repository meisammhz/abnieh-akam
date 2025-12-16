import React, { useState } from 'react';
import { ProjectInputs, ConstructionPhase, Installment } from '../types';
import { toPersianDigits, formatCurrency } from '../utils';

interface Props {
  inputs: ProjectInputs;
  setInputs: React.Dispatch<React.SetStateAction<ProjectInputs>>;
  onGenerate: () => void;
  isGenerating: boolean;
  onSuggestPhases: () => void;
  isSuggesting: boolean;
}

const Accordion: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between text-gray-700 font-bold mb-3 pb-1 border-b border-gray-100">
                <div className="flex items-center">
                    {icon}
                    {title}
                </div>
                <svg className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && <div className="space-y-3 animate-fade-in">{children}</div>}
        </div>
    );
};


const InputSidebar: React.FC<Props> = ({ inputs, setInputs, onGenerate, isGenerating, onSuggestPhases, isSuggesting }) => {
  
  const handleChange = (field: keyof ProjectInputs, value: string | number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handlePhaseChange = (id: number, field: keyof ConstructionPhase, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      constructionPhases: prev.constructionPhases.map(phase =>
        phase.id === id ? { ...phase, [field]: value } : phase
      )
    }));
  };
  
  const handleInstallmentChange = (id: number, field: keyof Installment, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      installments: prev.installments.map(inst =>
        inst.id === id ? { ...inst, [field]: value } : inst
      )
    }));
  };

  const addPhase = () => {
    const newPhase: ConstructionPhase = {
      id: Date.now(),
      name: 'فاز جدید',
      durationMonths: 6,
      costPerMeter: 5000000
    };
    setInputs(prev => ({
      ...prev,
      constructionPhases: [...prev.constructionPhases, newPhase]
    }));
  };

  const removePhase = (id: number) => {
    setInputs(prev => ({
      ...prev,
      constructionPhases: prev.constructionPhases.filter(phase => phase.id !== id)
    }));
  };
  
  const addInstallment = () => {
    const newInstallment: Installment = {
      id: Date.now(),
      name: `قسط جدید`,
      amount: 100000000,
      dueMonth: (inputs.installments.length > 0 ? Math.max(...inputs.installments.map(i => i.dueMonth)) : 0) + 6
    };
    setInputs(prev => ({
      ...prev,
      installments: [...prev.installments, newInstallment]
    }));
  };

  const removeInstallment = (id: number) => {
    setInputs(prev => ({
      ...prev,
      installments: prev.installments.filter(inst => inst.id !== id)
    }));
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'companyLogo' | 'facadeImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputs(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const totalDuration = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.durationMonths), 0);
  const totalBaseConstructionCost = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.costPerMeter), 0);


  return (
    <div className="w-full lg:w-96 bg-white border-l border-gray-200 h-full overflow-y-auto p-5 shadow-xl z-10 shrink-0 text-sm scrollbar-thin scrollbar-thumb-gray-300">
      <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3 flex items-center justify-between">
        <span>تنظیمات پروژه</span>
        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">نسخه حرفه‌ای</span>
      </h2>

      <div className="space-y-6">
        
        <Accordion title="اطلاعات پایه و برندینگ" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} defaultOpen>
           <div className="space-y-3">
              <div>
                 <label className="text-gray-500 text-xs block mb-1">نام پروژه</label>
                 <input type="text" value={inputs.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" />
              </div>
              <div>
                 <label className="text-gray-500 text-xs block mb-1">آپلود لوگو شرکت</label>
                 <div className="flex items-center gap-2">
                    {inputs.companyLogo && <img src={inputs.companyLogo} alt="logo preview" className="w-10 h-10 rounded-lg object-contain border p-1 bg-white" />}
                   <label className="flex-1 cursor-pointer bg-akam-50 hover:bg-akam-100 text-akam-700 border border-akam-200 p-2 rounded-lg flex items-center justify-center transition-colors text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>انتخاب فایل</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'companyLogo')} className="hidden" />
                   </label>
                 </div>
              </div>
               <div>
                 <label className="text-gray-500 text-xs block mb-1">آپلود تصویر نمای پروژه (برای جلد)</label>
                 <div className="flex items-center gap-2">
                    {inputs.facadeImage && <img src={inputs.facadeImage} alt="facade preview" className="w-10 h-10 rounded-lg object-cover border p-1 bg-white" />}
                   <label className="flex-1 cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 p-2 rounded-lg flex items-center justify-center transition-colors text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>انتخاب فایل</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'facadeImage')} className="hidden" />
                   </label>
                 </div>
              </div>
           </div>
        </Accordion>

        <Accordion title="مشخصات کلیدی سازه" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} defaultOpen>
          <div className="space-y-3">
             <div>
                 <label className="text-gray-500 text-xs block mb-1">نوع سازه</label>
                 <select value={inputs.constructionType} onChange={(e) => handleChange('constructionType', e.target.value as ProjectInputs['constructionType'])} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none">
                   <option value="Concrete">اسکلت بتنی</option>
                   <option value="Steel">اسکلت فلزی پیچ و مهره</option>
                   <option value="TunnelForm">سیستم قالب تونلی</option>
                 </select>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 text-xs block mb-1">طبقات روی زمین</label>
                  <input type="number" value={inputs.floors} onChange={(e) => handleChange('floors', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-gray-500 outline-none" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1">طبقات منفی</label>
                  <input type="number" value={inputs.undergroundFloors} onChange={(e) => handleChange('undergroundFloors', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-gray-500 outline-none" />
                </div>
             </div>
             <div>
                 <label className="text-gray-500 text-xs block mb-1">وضعیت زمین</label>
                 <select value={inputs.landCondition} onChange={(e) => handleChange('landCondition', e.target.value as ProjectInputs['landCondition'])} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none">
                   <option value="Normal">مسطح / خاک عادی</option>
                   <option value="Sloped">شیب‌دار</option>
                   <option value="Complex">نیازمند پایدارسازی / سست</option>
                 </select>
             </div>
          </div>
        </Accordion>

        <Accordion title="جزئیات متراژ و تراکم" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>} defaultOpen>
            <div className="space-y-3">
                <div>
                    <label className="text-gray-500 text-xs block mb-1">تراکم کل (متر مربع)</label>
                    <input type="number" value={inputs.grossTotalArea} onChange={(e) => handleChange('grossTotalArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-gray-500 outline-none" />
                </div>
                <div>
                    <label className="text-gray-500 text-xs block mb-1">تراکم مفید مسکونی (متر مربع)</label>
                    <input type="number" value={inputs.netResidentialArea} onChange={(e) => handleChange('netResidentialArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-gray-500 outline-none" />
                </div>
                <div>
                    <label className="text-gray-500 text-xs block mb-1">تراکم مفید تجاری (متر مربع)</label>
                    <input type="number" value={inputs.netCommercialArea} onChange={(e) => handleChange('netCommercialArea', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-gray-50 ltr text-center text-gray-900 focus:border-gray-500 outline-none" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-bold">متراژ مشاعات و خدماتی:</span>
                        <span className="font-bold text-gray-800 dir-ltr">{toPersianDigits((inputs.grossTotalArea - inputs.netResidentialArea - inputs.netCommercialArea).toLocaleString())} م²</span>
                    </div>
                </div>
            </div>
        </Accordion>
        
        <Accordion title="جزئیات فنی و تاسیسات" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 10v4m-2-2h4M5 11h14" /></svg>}>
            <div>
              <label className="text-gray-500 text-xs block mb-1">سیستم فونداسیون</label>
              <input type="text" value={inputs.foundationSystem} onChange={(e) => handleChange('foundationSystem', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" placeholder="مثال: رادیه ژنرال" />
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">سیستم سقف‌ها</label>
              <input type="text" value={inputs.roofSystem} onChange={(e) => handleChange('roofSystem', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" placeholder="مثال: عرشه فولادی کامپوزیت" />
            </div>
             <div>
              <label className="text-gray-500 text-xs block mb-1">نازک‌کاری و مصالح داخلی</label>
              <textarea value={inputs.interiorFinishes} onChange={(e) => handleChange('interiorFinishes', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" rows={2} placeholder="مثال: دیوار کناف، سرامیک پرسلان، شیرآلات KWC"></textarea>
            </div>
             <div>
              <label className="text-gray-500 text-xs block mb-1">سیستم سرمایش و گرمایش (HVAC)</label>
              <input type="text" value={inputs.hvacSystem} onChange={(e) => handleChange('hvacSystem', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" placeholder="مثال: چیلر مرکزی و فن کویل" />
            </div>
             <div>
              <label className="text-gray-500 text-xs block mb-1">سیستم برق و هوشمندسازی</label>
              <input type="text" value={inputs.electricalSystem} onChange={(e) => handleChange('electricalSystem', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" placeholder="مثال: سیستم BMS با کنترل مرکزی" />
            </div>
        </Accordion>

        <Accordion title="توضیحات و متون پروپوزال" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>
             <div>
              <label className="text-gray-500 text-xs block mb-1">شرح کلی پروژه</label>
              <textarea value={inputs.projectDescription} onChange={(e) => handleChange('projectDescription', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" rows={4}></textarea>
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">توضیحات تکمیلی ساخت</label>
              <textarea value={inputs.constructionDescription} onChange={(e) => handleChange('constructionDescription', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" rows={3}></textarea>
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">جزئیات طراحی و متریال نما</label>
              <textarea value={inputs.facadeDescription} onChange={(e) => handleChange('facadeDescription', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" rows={3}></textarea>
            </div>
            <div>
              <label className="text-gray-500 text-xs block mb-1">جزئیات سفت‌کاری و اسکلت</label>
              <textarea value={inputs.coreShellDescription} onChange={(e) => handleChange('coreShellDescription', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-gray-900 focus:border-gray-500 outline-none" rows={3}></textarea>
            </div>
        </Accordion>

        <Accordion title="زمانبندی و هزینه‌های ساخت" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} defaultOpen>
           <div className="flex justify-end mb-2">
             <button onClick={onSuggestPhases} disabled={isSuggesting} className="text-xs text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait">
                {isSuggesting ? (
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                )}
               <span>پیشنهاد هوشمند</span>
             </button>
           </div>
          <div className="space-y-2">
            {inputs.constructionPhases.map((phase, index) => (
              <div key={phase.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-2 relative group">
                <button 
                  onClick={() => removePhase(phase.id)} 
                  className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="حذف فاز"
                >
                  &times;
                </button>
                <input 
                  type="text" 
                  value={phase.name} 
                  onChange={(e) => handlePhaseChange(phase.id, 'name', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white text-xs text-gray-900 focus:border-indigo-500 outline-none"
                  placeholder={`فاز ${toPersianDigits(index + 1)}`}
                />
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="text-gray-500 text-[10px] block mb-1">مدت (ماه)</label>
                      <input 
                        type="number" 
                        value={phase.durationMonths}
                        onChange={(e) => handlePhaseChange(phase.id, 'durationMonths', Number(e.target.value))}
                        className="w-full p-1.5 border rounded bg-white ltr text-center text-xs text-gray-900 focus:border-indigo-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="text-gray-500 text-[10px] block mb-1">هزینه (تومان/متر)</label>
                      <input 
                        type="number"
                        value={phase.costPerMeter}
                        onChange={(e) => handlePhaseChange(phase.id, 'costPerMeter', Number(e.target.value))}
                        className="w-full p-1.5 border rounded bg-white ltr text-center text-xs text-gray-900 focus:border-indigo-500 outline-none"
                      />
                   </div>
                </div>
              </div>
            ))}
            <button onClick={addPhase} className="w-full text-center py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-200 rounded-lg transition-colors">
              + افزودن فاز جدید
            </button>
          </div>
           <div className="mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-xs space-y-2">
              <div className="flex justify-between font-bold">
                 <span>مجموع زمان ساخت:</span>
                 <span className="text-indigo-800">{toPersianDigits(totalDuration)} ماه</span>
              </div>
               <div className="flex justify-between font-bold">
                 <span>مجموع هزینه پایه ساخت:</span>
                 <span className="text-indigo-800">{formatCurrency(totalBaseConstructionCost)} تومان</span>
              </div>
           </div>
        </Accordion>
        
        <Accordion title="مدیریت اقساط" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} defaultOpen>
           <div className="space-y-2">
            {inputs.installments.map((inst, index) => (
              <div key={inst.id} className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-2 relative group">
                <button 
                  onClick={() => removeInstallment(inst.id)} 
                  className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  title="حذف قسط"
                >
                  &times;
                </button>
                <input 
                  type="text" 
                  value={inst.name} 
                  onChange={(e) => handleInstallmentChange(inst.id, 'name', e.target.value)}
                  className="w-full p-1.5 border rounded bg-white text-xs text-gray-900 focus:border-indigo-500 outline-none"
                  placeholder={`قسط ${toPersianDigits(index + 1)}`}
                />
                <div className="grid grid-cols-2 gap-2">
                   <div>
                      <label className="text-gray-500 text-[10px] block mb-1">مبلغ قسط (تومان)</label>
                      <input 
                        type="number" 
                        value={inst.amount}
                        onChange={(e) => handleInstallmentChange(inst.id, 'amount', Number(e.target.value))}
                        className="w-full p-1.5 border rounded bg-white ltr text-center text-xs text-gray-900 focus:border-indigo-500 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="text-gray-500 text-[10px] block mb-1">سررسید (ماه چندم)</label>
                      <input 
                        type="number"
                        value={inst.dueMonth}
                        onChange={(e) => handleInstallmentChange(inst.id, 'dueMonth', Number(e.target.value))}
                        className="w-full p-1.5 border rounded bg-white ltr text-center text-xs text-gray-900 focus:border-indigo-500 outline-none"
                      />
                   </div>
                </div>
              </div>
            ))}
            <button onClick={addInstallment} className="w-full text-center py-2 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-dashed border-indigo-200 rounded-lg transition-colors">
              + افزودن قسط جدید
            </button>
          </div>
        </Accordion>

        <Accordion title="سناریوهای اقتصادی و هزینه‌ها" icon={<svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
          <div className="space-y-4">
             <div>
                <label className="text-gray-500 text-xs block mb-1">پیشرفت پروژه (ماه)</label>
                <input 
                  type="range" 
                  min="0" 
                  max={totalDuration} 
                  value={inputs.elapsedMonths || 0}
                  onChange={(e) => handleChange('elapsedMonths', Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between items-center mt-1">
                   <span className="text-xs text-gray-500">درصد پیشرفت:</span>
                   <span className="text-xs font-bold text-gray-800">
                     {totalDuration > 0 ? toPersianDigits(Math.round(((inputs.elapsedMonths || 0) / totalDuration) * 100)) : '۰'}%
                   </span>
                </div>
             </div>
             
             <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <label className="text-gray-600 text-xs font-bold block mb-2">نرخ تورم سالانه ساخت (٪)</label>
                <input type="number" value={inputs.constructionCostEscalation} onChange={(e) => handleChange('constructionCostEscalation', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
                <p className="text-[10px] text-gray-400 mt-1 text-center">افزایش هزینه مصالح و دستمزد در سال</p>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs block mb-1">نرخ رشد بازار (بدبینانه ٪)</label>
                  <input type="number" value={inputs.pessimisticMarketGrowth} onChange={(e) => handleChange('pessimisticMarketGrowth', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
               </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1">نرخ رشد بازار (خوشبینانه ٪)</label>
                  <input type="number" value={inputs.optimisticMarketGrowth} onChange={(e) => handleChange('optimisticMarketGrowth', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                    <label className="text-gray-500 text-xs block mb-1">هزینه بالاسری (٪)</label>
                    <input type="number" value={inputs.adminOverheadPercentage} onChange={(e) => handleChange('adminOverheadPercentage', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
                </div>
                <div>
                    <label className="text-gray-500 text-xs block mb-1">کمیسیون فروش (٪)</label>
                    <input type="number" value={inputs.salesCommissionPercentage} onChange={(e) => handleChange('salesCommissionPercentage', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-white ltr text-center text-gray-900 focus:border-amber-500 outline-none" />
                </div>
            </div>
          </div>
        </Accordion>

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
               در حال تحلیل و ساخت تصویر...
             </>
          ) : 'بروزرسانی پروپوزال'}
        </button>
      </div>
    </div>
  );
};

export default InputSidebar;