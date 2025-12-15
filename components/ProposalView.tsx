import React from 'react';
import { ProjectInputs, ProposalContent } from '../types';
import { toPersianDigits, getCurrentShamsiDate } from '../utils';

interface Props {
  inputs: ProjectInputs;
  content: ProposalContent;
}

const ProposalView: React.FC<Props> = ({ inputs, content }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl my-8 min-h-screen print:shadow-none print:m-0">
      
      {/* Cover Page */}
      <div className="h-[1100px] relative flex flex-col items-center justify-center bg-gray-50 overflow-hidden text-center p-12 border-b-8 border-akam-600">
        <div className="absolute top-0 left-0 w-full h-64 bg-akam-600 opacity-10 transform -skew-y-6 origin-top-left"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gray-800 opacity-5 transform skew-y-6 origin-bottom-right"></div>
        
        <div className="z-10 relative w-full flex flex-col items-center">
          <h4 className="text-akam-600 tracking-[0.3em] uppercase text-sm font-bold mb-8">FEASIBILITY STUDY & PROPOSAL</h4>
          
          {/* Logo Section */}
          <div className="mb-8">
            {inputs.companyLogo ? (
              <img src={inputs.companyLogo} alt="Company Logo" className="h-24 md:h-32 object-contain" />
            ) : (
              <h2 className="text-3xl text-gray-700 font-bold">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</h2>
            )}
          </div>
          
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">پروژه {inputs.projectName}</h1>
          
          <div className="w-64 h-64 mx-auto mb-12 rounded-full overflow-hidden shadow-2xl border-4 border-white mt-8">
            <img src="https://picsum.photos/seed/building1/800/800" alt="Building Concept" className="w-full h-full object-cover" />
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
             <div className="border-r-2 border-gray-300 pr-4">
               <p className="font-bold text-gray-900">کاربری</p>
               <p>مسکونی - تجاری</p>
             </div>
             <div className="border-r-2 border-akam-500 pr-4">
               <p className="font-bold text-gray-900">حجم سرمایه‌گذاری</p>
               <p>کلان مقیاس</p>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-12 text-center w-full">
           <span className="inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded font-bold text-xs">نسخه نهایی</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-16 space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-gray-800">خلاصه مدیریتی <span className="block text-xs font-normal text-gray-400 mt-1">Executive Summary</span></h3>
          </div>
          <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden mb-6 relative group">
             <img src="https://picsum.photos/seed/archi2/1200/600" className="w-full h-full object-cover" alt="Perspective" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded border border-gray-200">EXTERIOR PERSPECTIVE</div>
             </div>
          </div>
          <div className="prose max-w-none text-justify text-gray-600 leading-8">
            <p>{content.executiveSummary}</p>
          </div>
          
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 flex gap-4">
            <div className="shrink-0">
               <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-1">نتیجه تحلیل: توجیه اقتصادی بسیار بالا (Excellent)</h4>
              <p className="text-sm text-green-700">بر اساس محاسبات انجام شده، این پروژه با نرخ بازگشت سرمایه (ROI) معادل ۴۸٪ ارزیابی می‌شود. این پروژه با حاشیه سود بالا و ریسک کنترل شده، گزینه‌ای ایده‌آل برای سرمایه‌گذاری است.</p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Location & Analysis */}
        <section>
          <div className="flex items-center gap-4 mb-6">
             <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-gray-800">تحلیل موقعیت و پتانسیل سرمایه‌گذاری <span className="block text-xs font-normal text-gray-400 mt-1">Location & Investment Analysis</span></h3>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-800 mb-2 border-b pb-2">مشخصات زمین</h5>
                <ul className="text-sm space-y-2 text-gray-600">
                   <li className="flex justify-between"><span>مساحت کل:</span> <b>{toPersianDigits(inputs.totalArea + inputs.commercialArea)} متر</b></li>
                   <li className="flex justify-between"><span>تعداد بلوک:</span> <b>{toPersianDigits(inputs.blocks)}</b></li>
                   <li className="flex justify-between"><span>تعداد طبقات:</span> <b>{toPersianDigits(inputs.floors)}</b></li>
                </ul>
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-gray-800 mb-2 border-b pb-2">فازبندی اجرا</h5>
                <ul className="text-sm space-y-2 text-gray-600">
                   <li className="flex justify-between"><span>مدت زمان کل:</span> <b>{toPersianDigits(inputs.durationMonths)} ماه</b></li>
                   <li className="flex justify-between"><span>فاز اول:</span> <b>خرید سهام و زمین</b></li>
                   <li className="flex justify-between"><span>فاز دوم:</span> <b>ساخت و تکمیل</b></li>
                </ul>
             </div>
          </div>

          <div className="prose max-w-none text-justify text-gray-600 leading-8">
            <p>{content.locationAnalysis}</p>
            <h4 className="font-bold text-gray-800 mt-4">آینده سرمایه‌گذاری و ارزش افزوده</h4>
            <p>{content.financialOutlook}</p>
          </div>
        </section>

         {/* Architecture */}
         <section className="break-before-page">
          <div className="flex items-center gap-4 mb-6 pt-8">
             <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
               <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-gray-800">معماری و امکانات رفاهی <span className="block text-xs font-normal text-gray-400 mt-1">Architecture & Amenities</span></h3>
          </div>
          
          <div className="aspect-[21/9] w-full bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
             <img src="https://picsum.photos/seed/inter3/1200/500" className="w-full h-full object-cover" alt="Interior" />
             <div className="absolute bottom-4 right-4 bg-white/90 px-4 py-1 rounded text-xs font-bold shadow">INTERIOR DESIGN</div>
          </div>

          <div className="prose max-w-none text-justify text-gray-600 leading-8 mb-8">
            <p>{content.architecturalVision}</p>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-8">
             <h4 className="text-lg font-bold mb-6 border-b border-slate-700 pb-2">جدول آنالیز مالی و تحلیل ریسک</h4>
             
             <div className="overflow-x-auto">
               <table className="w-full text-right text-sm">
                 <thead className="text-slate-400">
                   <tr>
                     <th className="pb-4">مرحله</th>
                     <th className="pb-4">مدت</th>
                     <th className="pb-4">بودجه مورد نیاز</th>
                     <th className="pb-4">تزریق ماهانه</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700">
                   <tr>
                     <td className="py-4">فونداسیون و اسکلت</td>
                     <td className="py-4">۱۲ ماه</td>
                     <td className="py-4 text-emerald-400">{toPersianDigits(760)} میلیارد تومان</td>
                     <td className="py-4">{toPersianDigits(63)} میلیارد تومان</td>
                   </tr>
                   <tr>
                     <td className="py-4">سفت‌کاری و تیغه‌چینی</td>
                     <td className="py-4">۹ ماه</td>
                     <td className="py-4 text-emerald-400">{toPersianDigits(480)} میلیارد تومان</td>
                     <td className="py-4">{toPersianDigits(53)} میلیارد تومان</td>
                   </tr>
                   <tr>
                     <td className="py-4">نازک‌کاری و نما</td>
                     <td className="py-4">۹ ماه</td>
                     <td className="py-4 text-emerald-400">{toPersianDigits(480)} میلیارد تومان</td>
                     <td className="py-4">{toPersianDigits(53)} میلیارد تومان</td>
                   </tr>
                    <tr>
                     <td className="py-4">تجهیز و تحویل</td>
                     <td className="py-4">۵ ماه</td>
                     <td className="py-4 text-emerald-400">{toPersianDigits(192)} میلیارد تومان</td>
                     <td className="py-4">{toPersianDigits(38)} میلیارد تومان</td>
                   </tr>
                 </tbody>
               </table>
             </div>
             
             <div className="mt-8 bg-slate-800 p-4 rounded-lg border border-slate-700">
               <h5 className="font-bold text-amber-400 mb-2 text-xs uppercase">تحلیل حساسیت و سناریوهای بازار (Risk Analysis)</h5>
               <p className="text-slate-300 text-sm leading-6">
                 {content.riskAssessment}
               </p>
             </div>
          </div>
        </section>
        
        <div className="text-center mt-16 pt-16 border-t border-gray-100">
           <p className="text-gray-400 text-sm mb-2">تهیه شده توسط سامانه هوشمند مدیریت پروژه</p>
           {inputs.companyLogo ? (
             <img src={inputs.companyLogo} alt="Company Logo" className="h-10 mx-auto" />
           ) : (
             <h3 className="font-bold text-gray-800">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</h3>
           )}
           <p className="text-xs text-gray-400 mt-4 dir-ltr">Generated by Construction AI • Confidential</p>
        </div>

      </div>
    </div>
  );
};

export default ProposalView;