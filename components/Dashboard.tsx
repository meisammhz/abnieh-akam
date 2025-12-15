import React from 'react';
import { ProjectInputs } from '../types';
import { ProfitChart, LandUseChart, CashFlowChart } from './Charts';
import { toPersianDigits, formatCurrency } from '../utils';

interface Props {
  inputs: ProjectInputs;
}

const StatCard: React.FC<{ title: string; value: string; subtext?: string; icon: React.ReactNode, color: string }> = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-500 text-xs font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 my-1">{value}</h3>
      {subtext && <p className={`text-xs ${color} font-medium`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text', 'bg').replace('600', '100')}`}>
      {icon}
    </div>
  </div>
);

const getPhaseInfo = (progress: number) => {
  if (progress <= 10) return { title: 'پذیره‌نویسی و تجهیز', color: 'bg-blue-500' };
  if (progress <= 30) return { title: 'گودبرداری و فونداسیون', color: 'bg-amber-500' };
  if (progress <= 60) return { title: 'اجرای اسکلت و سقف', color: 'bg-orange-500' };
  if (progress <= 90) return { title: 'سفت‌کاری و نازک‌کاری', color: 'bg-teal-500' };
  return { title: 'تجهیز و تحویل نهایی', color: 'bg-green-500' };
};

const Dashboard: React.FC<Props> = ({ inputs }) => {
  // --- General Calculations ---
  const totalResidentialValue = inputs.totalArea * (inputs.constructionCostPerMeter * 1.5); 
  const totalCost = (inputs.totalArea * inputs.constructionCostPerMeter) + ((inputs.totalArea/10) * inputs.unitSharePrice);
  const progress = inputs.elapsedMonths ? Math.round((inputs.elapsedMonths / inputs.durationMonths) * 100) : 0;
  const phase = getPhaseInfo(progress);

  // --- Advanced Scenario Analysis (Shareholder Perspective) ---
  const years = inputs.durationMonths / 12;
  const baseLandCost = inputs.unitSharePrice; // Cost of share (Land + License)
  const baseConstructionCost = inputs.constructionCostPerMeter * 10; // For 10 meters

  // Helper to calculate scenario metrics
  const calculateScenario = (marketGrowthRate: number, costEscalationRate: number) => {
    // 1. Adjusted Cost (considering inflation on construction)
    // We assume construction cost is paid over time, so average inflation impact is roughly half the period
    // Or we apply escalation to the remaining balance. Simple model: Escalated Avg Cost.
    const escalatedConstructionCost = baseConstructionCost * Math.pow(1 + (costEscalationRate / 100), years / 2);
    const totalAdjustedCost = baseLandCost + escalatedConstructionCost;

    // 2. Future Value (Compounded Market Growth)
    // Base value at start is typically Cost + Margin (e.g., 20%).
    const startValue = (baseLandCost + baseConstructionCost) * 1.2;
    const futureValue = startValue * Math.pow(1 + (marketGrowthRate / 100), years);

    // 3. Metrics
    const netProfit = futureValue - totalAdjustedCost;
    const totalRoi = (netProfit / totalAdjustedCost) * 100;
    const annualRoi = totalRoi / years;
    const valuePerMeter = futureValue / 10; // Value of 1 meter share

    return { totalAdjustedCost, futureValue, netProfit, totalRoi, annualRoi, valuePerMeter };
  };

  // Define Scenarios
  // Pessimistic: Low Market Growth, High Construction Inflation (Risk Case)
  const pessimisticScenario = calculateScenario(inputs.pessimisticGrowth, inputs.pessimisticGrowth + 5);
  
  // Realistic: Average Growth, Average Inflation (Base Case)
  const realisticGrowth = (inputs.pessimisticGrowth + inputs.optimisticGrowth) / 2;
  const realisticInflation = inputs.pessimisticGrowth;
  const realisticScenario = calculateScenario(realisticGrowth, realisticInflation);

  // Optimistic: High Market Growth, Controlled Inflation (Best Case)
  const optimisticScenario = calculateScenario(inputs.optimisticGrowth, inputs.pessimisticGrowth - 2);

  // Determine Status based on Realistic ROI
  let justificationStatus = { label: 'معمولی', color: 'text-gray-600', bg: 'bg-gray-100' };
  if (realisticScenario.annualRoi > inputs.pessimisticGrowth + 15) justificationStatus = { label: 'فوق‌العاده (Excellent)', color: 'text-emerald-700', bg: 'bg-emerald-100' };
  else if (realisticScenario.annualRoi > inputs.pessimisticGrowth) justificationStatus = { label: 'خوب (Good)', color: 'text-blue-700', bg: 'bg-blue-100' };
  else if (realisticScenario.annualRoi > 0) justificationStatus = { label: 'قابل قبول', color: 'text-amber-700', bg: 'bg-amber-100' };


  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="سود خالص کل پروژه"
          value={`${toPersianDigits(((totalResidentialValue - totalCost)/1000000000).toFixed(0))} میلیارد`}
          subtext="برآورد نهایی"
          color="text-emerald-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="متراژ کل بنا"
          value={`${toPersianDigits((inputs.totalArea + inputs.commercialArea).toLocaleString())} متر`}
          subtext={`شامل ${toPersianDigits(inputs.commercialArea)} متر تجاری`}
          color="text-blue-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard 
          title="سرمایه اولیه (واریز اول)"
          value={`${toPersianDigits((inputs.unitSharePrice * 0.5 / 1000000).toLocaleString())} میلیون`}
          subtext="۵۰٪ مبلغ کل سهم"
          color="text-amber-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          title="زمان باقیمانده"
          value={`${toPersianDigits(inputs.durationMonths - (inputs.elapsedMonths || 0))} ماه`}
          subtext={`از مجموع ${toPersianDigits(inputs.durationMonths)} ماه`}
          color="text-purple-600"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Project Status Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-akam-500 to-akam-700"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                وضعیت کنونی پروژه
                <span className={`text-xs px-2 py-1 rounded text-white ${phase.color}`}>{phase.title}</span>
              </h3>
              <span className="text-2xl font-bold text-gray-700">{toPersianDigits(progress)}٪</span>
            </div>
            
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${phase.color}`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
               <span>شروع پروژه</span>
               <span className={progress > 25 ? 'text-gray-700' : ''}>فونداسیون (۳۰٪)</span>
               <span className={progress > 60 ? 'text-gray-700' : ''}>اسکلت (۶۰٪)</span>
               <span className={progress > 90 ? 'text-gray-700' : ''}>نازک‌کاری (۹۰٪)</span>
               <span>تحویل نهایی</span>
            </div>
          </div>
          
          <div className="hidden md:flex gap-4 border-r border-gray-100 pr-6 mr-2">
             <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">ماه گذشته</div>
                <div className="font-bold text-lg text-gray-800">{toPersianDigits(inputs.elapsedMonths || 0)}</div>
             </div>
             <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">ماه باقیمانده</div>
                <div className="font-bold text-lg text-gray-800">{toPersianDigits(inputs.durationMonths - (inputs.elapsedMonths || 0))}</div>
             </div>
          </div>
        </div>
      </div>

      {/* --- ENHANCED SECTION: Detailed Shareholder Analysis & Scenarios --- */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg text-white overflow-hidden">
         <div className="p-6 md:p-8 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
               <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  تحلیل جامع سودآوری و ریسک
               </h3>
               <p className="text-slate-400 text-sm mt-1">محاسبه برای یک سهم ۱۰ متری در پایان دوره ({toPersianDigits(inputs.durationMonths)} ماه) با احتساب تورم ساخت</p>
            </div>
            <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${justificationStatus.bg} flex items-center gap-2`}>
               <span className={`text-xs font-bold ${justificationStatus.color}`}>وضعیت در سناریو محتمل:</span>
               <span className={`text-sm font-extrabold ${justificationStatus.color}`}>{justificationStatus.label}</span>
            </div>
         </div>

         {/* Scenario Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4 font-normal">شاخص‌های مالی (هر سهم)</th>
                  <th className="p-4 font-normal text-rose-300">سناریو بدبینانه (کف سود)</th>
                  <th className="p-4 font-normal text-blue-300 bg-white/5">سناریو محتمل (واقع‌بینانه)</th>
                  <th className="p-4 font-normal text-emerald-300">سناریو خوش‌بینانه (سقف سود)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {/* Row 1: Market Assumptions */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">
                    <div className="font-bold">مفروضات بازار</div>
                    <div className="text-xs text-slate-500 mt-1">تورم سالانه و رشد قیمت مسکن</div>
                  </td>
                  <td className="p-4 text-rose-200">
                    <div>رشد بازار: {toPersianDigits(inputs.pessimisticGrowth)}٪</div>
                    <div className="text-xs opacity-70 mt-1">تورم ساخت: {toPersianDigits(inputs.pessimisticGrowth + 5)}٪</div>
                  </td>
                  <td className="p-4 text-blue-200 bg-white/5">
                    <div>رشد بازار: {toPersianDigits(Math.round(realisticGrowth))}٪</div>
                    <div className="text-xs opacity-70 mt-1">تورم ساخت: {toPersianDigits(inputs.pessimisticGrowth)}٪</div>
                  </td>
                  <td className="p-4 text-emerald-200">
                    <div>رشد بازار: {toPersianDigits(inputs.optimisticGrowth)}٪</div>
                    <div className="text-xs opacity-70 mt-1">تورم ساخت: {toPersianDigits(Math.max(10, inputs.pessimisticGrowth - 5))}٪</div>
                  </td>
                </tr>

                {/* Row 2: Total Cost */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">
                    <div className="font-bold">قیمت تمام شده (تعدیل شده)</div>
                    <div className="text-xs text-slate-500 mt-1">زمین + ساخت با احتساب تورم</div>
                  </td>
                  <td className="p-4 font-mono text-slate-200">{formatCurrency(Math.round(pessimisticScenario.totalAdjustedCost))}</td>
                  <td className="p-4 font-mono text-white font-bold bg-white/5">{formatCurrency(Math.round(realisticScenario.totalAdjustedCost))}</td>
                  <td className="p-4 font-mono text-slate-200">{formatCurrency(Math.round(optimisticScenario.totalAdjustedCost))}</td>
                </tr>

                 {/* Row 3: Future Value */}
                 <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">
                    <div className="font-bold">ارزش روز سهم (در زمان تحویل)</div>
                    <div className="text-xs text-slate-500 mt-1">ارزش فروش واحد تکمیل شده</div>
                  </td>
                  <td className="p-4 font-mono text-rose-300 font-bold">{formatCurrency(Math.round(pessimisticScenario.futureValue))}</td>
                  <td className="p-4 font-mono text-blue-300 font-bold bg-white/5 text-lg">{formatCurrency(Math.round(realisticScenario.futureValue))}</td>
                  <td className="p-4 font-mono text-emerald-300 font-bold">{formatCurrency(Math.round(optimisticScenario.futureValue))}</td>
                </tr>

                {/* Row 4: Net Profit */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">
                    <div className="font-bold">سود خالص سرمایه‌گذار</div>
                    <div className="text-xs text-slate-500 mt-1">ارزش نهایی منهای هزینه تمام شده</div>
                  </td>
                  <td className="p-4 font-mono text-rose-400">+{formatCurrency(Math.round(pessimisticScenario.netProfit))}</td>
                  <td className="p-4 font-mono text-blue-400 font-bold bg-white/5">+{formatCurrency(Math.round(realisticScenario.netProfit))}</td>
                  <td className="p-4 font-mono text-emerald-400">+{formatCurrency(Math.round(optimisticScenario.netProfit))}</td>
                </tr>

                {/* Row 5: ROI */}
                <tr className="bg-slate-800/80">
                  <td className="p-4 text-slate-300 border-t border-slate-700">
                    <div className="font-bold">بازدهی کل سرمایه (ROI)</div>
                  </td>
                  <td className="p-4 font-bold text-rose-400 border-t border-slate-700 dir-ltr text-right">{toPersianDigits(pessimisticScenario.totalRoi.toFixed(0))}٪</td>
                  <td className="p-4 font-bold text-blue-400 bg-white/5 border-t border-slate-600 text-lg dir-ltr text-right">{toPersianDigits(realisticScenario.totalRoi.toFixed(0))}٪</td>
                  <td className="p-4 font-bold text-emerald-400 border-t border-slate-700 dir-ltr text-right">{toPersianDigits(optimisticScenario.totalRoi.toFixed(0))}٪</td>
                </tr>
              </tbody>
            </table>
         </div>

         {/* Insight Text */}
         <div className="bg-slate-900/80 p-4 text-xs text-slate-400 leading-6 border-t border-slate-700">
            <span className="text-yellow-500 font-bold">تحلیل:</span> در سناریوی محتمل (واقع‌بینانه)، ارزش هر متر مربع واحد تکمیل شده به حدود <span className="text-white font-bold">{formatCurrency(Math.round(realisticScenario.valuePerMeter))} تومان</span> خواهد رسید.
            این محاسبات با فرض پرداخت هزینه‌های ساخت به صورت تدریجی (اقساطی) و اعمال تورم بر روی باقیمانده بدهی انجام شده است که باعث می‌شود فشار تورمی بر سرمایه‌گذار کمتر از تورم عمومی جامعه باشد.
         </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">تحلیل نموداری رشد سرمایه (دامنه سود)</h3>
              <div className="flex gap-2 text-[10px]">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>خوش‌بینانه</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>واقع‌بینانه</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>هزینه</span>
              </div>
            </div>
            <ProfitChart inputs={inputs} />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              * ناحیه رنگی نشان‌دهنده "دامنه نوسان سود" است. خط سبز بالای نمودار سناریوی خوش‌بینانه و خط پایین محدوده، سناریوی بدبینانه را نشان می‌دهد. هر چقدر این دامنه بالاتر از خط هزینه (زرد) باشد، حاشیه امنیت سرمایه‌گذاری بیشتر است.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">جریان نقدینگی پروژه (Cash Flow)</h3>
            </div>
            <CashFlowChart inputs={inputs} />
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              * نمودار فوق ورودی و خروجی مالی پروژه را در طی ۴۲ ماه نشان می‌دهد. ستون‌های سبز نشان‌دهنده اقساط دریافتی و ستون‌های قرمز هزینه‌های اجرایی هستند.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">آنالیز فضاها و کاربری</h3>
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2">
                <LandUseChart inputs={inputs} />
              </div>
              <div className="w-full md:w-1/2 space-y-4 mt-4 md:mt-0 md:pr-8">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">تعداد طبقات مسکونی</span>
                  <span className="font-bold text-gray-800">{toPersianDigits(inputs.floors)} طبقه</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">طبقات منفی (پارکینگ)</span>
                  <span className="font-bold text-gray-800">{toPersianDigits(5)} طبقه</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">طبقه لابی (پودیوم)</span>
                  <span className="font-bold text-gray-800">{toPersianDigits(1)} طبقه (~۸۱۵۰ متر)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-600">موقعیت</span>
                  <span className="font-bold text-gray-800 text-sm truncate">{inputs.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Project Highlights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
               اطلاعات فاز اول (خرید سهام)
             </h3>
             <ul className="space-y-4 text-sm text-gray-300">
               <li className="flex justify-between items-center">
                 <span>قیمت کل سهام (۱۰ متر)</span>
                 <span className="text-white font-bold">{toPersianDigits(inputs.unitSharePrice.toLocaleString())} ت</span>
               </li>
               <li className="flex justify-between items-center bg-white/10 p-2 rounded">
                 <span>واریز اول (صدور برگه سهم)</span>
                 <span className="text-yellow-400 font-bold">{toPersianDigits((inputs.unitSharePrice * 0.5).toLocaleString())} ت</span>
               </li>
               <li className="flex justify-between items-center bg-white/10 p-2 rounded">
                 <span className="text-xs">واریز دوم ({inputs.secondPaymentDate})</span>
                 <span className="text-white font-bold">{toPersianDigits((inputs.unitSharePrice * 0.5).toLocaleString())} ت</span>
               </li>
               <li className="text-xs text-center pt-2 text-gray-400">
                 شروع ساخت پس از تکمیل گودبرداری و واریزی‌ها
               </li>
             </ul>
             <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-1">سازنده</div>
                <div className="font-bold text-lg">تعاونی عمرانی نوین ساز ابنیه آکام</div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">هزینه ساخت (علی‌الحساب)</h3>
            <div className="relative pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">برآورد اولیه ساخت</span>
                <span className="text-gray-800 font-bold">{toPersianDigits(inputs.constructionCostPerMeter/1000000)} میلیون/متر</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-lg text-xs text-blue-800 leading-5">
                <span className="font-bold block mb-1">توجه:</span>
                قیمت ساخت به صورت علی‌الحساب محاسبه شده و تغییرات تورم، مصالح و دستمزد سالانه در مجمع عمومی تعاونی بررسی و اعلام خواهد شد.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;