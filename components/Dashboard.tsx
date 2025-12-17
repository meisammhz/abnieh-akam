import React from 'react';
import { ProjectInputs, UnitMix } from '../types';
import { toPersianDigits, formatCurrency } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PhaseCostChart, ProgressDonutChart } from './Charts';
import { TimelineChart } from './TimelineChart';


interface Props {
  inputs: ProjectInputs;
}

const KpiCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactElement; color: string }> = ({ title, value, subValue, icon, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
        <div>
            <h4 className="text-sm font-medium text-gray-500">{title}</h4>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
    </div>
);

const InfoCard: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            {icon}
            {title}
        </h3>
        <div className="space-y-3 text-sm">
            {children}
        </div>
    </div>
);

const InfoCardRow: React.FC<{ label: string; value: string; subValue?: string }> = ({ label, value, subValue }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-gray-500">{label}</span>
        <div className="text-right">
          <span className="font-bold text-gray-700">{value}</span>
          {subValue && <span className="text-xs text-gray-400 block">{subValue}</span>}
        </div>
    </div>
);


const Dashboard: React.FC<Props> = ({ inputs }) => {
  const totalDuration = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.durationMonths || 0), 0);
  const baseTotalConstructionCostPerMeter = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.costPerMeter || 0), 0);
  const landCostPerMeter = (inputs.installments.find(i => i.dueMonth === 0)?.amount || inputs.unitSharePrice) / inputs.unitShareSize;
  const totalBaseCostPerMeter = landCostPerMeter + baseTotalConstructionCostPerMeter;

  const years = totalDuration / 12;

  const calculateScenario = (marketGrowthRate: number) => {
    const totalCostToBuyer = inputs.installments.reduce((sum, inst) => sum + inst.amount, 0);

    const futureValuePerMeter = inputs.marketPricePerMeter * Math.pow(1 + (marketGrowthRate / 100), years);
    const futureValueShare = futureValuePerMeter * inputs.unitShareSize;
    const futureValueAfterCommission = futureValueShare * (1 - inputs.salesCommissionPercentage / 100);
    
    const buyerProfit = futureValueAfterCommission - totalCostToBuyer;
    const totalRoi = totalCostToBuyer > 0 ? (buyerProfit / totalCostToBuyer) * 100 : 0;
    
    const annualRoi = years > 0 ? Math.pow(1 + totalRoi / 100, 1 / years) - 1 : 0;

    return { totalCostToBuyer, futureValueShare: futureValueAfterCommission, buyerProfit, totalRoi, annualRoi: annualRoi * 100 };
  };

  const realisticGrowth = (inputs.pessimisticMarketGrowth + inputs.optimisticMarketGrowth) / 2;
  const realisticScenario = calculateScenario(realisticGrowth);
  const pessimisticScenario = calculateScenario(inputs.pessimisticMarketGrowth);
  const optimisticScenario = calculateScenario(inputs.optimisticMarketGrowth);

  let justificationStatus = { label: 'معمولی', color: 'text-gray-600', bg: 'bg-gray-100' };
  if (realisticScenario.annualRoi > inputs.constructionCostEscalation + 15) justificationStatus = { label: 'فوق‌العاده', color: 'text-emerald-700', bg: 'bg-emerald-100' };
  else if (realisticScenario.annualRoi > inputs.constructionCostEscalation) justificationStatus = { label: 'خوب', color: 'text-blue-700', bg: 'bg-blue-100' };
  else if (realisticScenario.annualRoi > 0) justificationStatus = { label: 'قابل قبول', color: 'text-amber-700', bg: 'bg-amber-100' };
  
  const getAverageUnitSize = (unitMix: UnitMix[]): number => {
    if (!unitMix || unitMix.length === 0) return 90; // Default
    let totalSizePercentage = 0;
    let weightedSize = 0;
    unitMix.forEach(mix => {
        const sizeRange = mix.size.match(/(\d+)-(\d+)/);
        if (sizeRange) {
            const avgSize = (parseInt(sizeRange[1]) + parseInt(sizeRange[2])) / 2;
            weightedSize += avgSize * (mix.percentage / 100);
            totalSizePercentage += mix.percentage;
        }
    });
    return totalSizePercentage > 0 ? weightedSize / (totalSizePercentage / 100) : 90;
  };

  const averageUnitSize = getAverageUnitSize(inputs.unitMix);
  const netSellableArea = inputs.netResidentialArea + inputs.netCommercialArea;
  const commonAndServiceArea = inputs.grossTotalArea - netSellableArea;
  const estimatedUnits = inputs.netResidentialArea > 0 && averageUnitSize > 0 ? Math.round(inputs.netResidentialArea / averageUnitSize) : 0;

  const totalLandCost = landCostPerMeter * netSellableArea;
  const totalBaseConstructionCost = baseTotalConstructionCostPerMeter * inputs.grossTotalArea;
  const totalOverheadCost = totalBaseConstructionCost * (inputs.adminOverheadPercentage / 100);
  const totalConstructionCostWithOverhead = totalBaseConstructionCost + totalOverheadCost;
  const totalProjectCost = totalLandCost + totalConstructionCostWithOverhead;
  const totalFutureValue = (realisticScenario.futureValueShare / inputs.unitShareSize) * netSellableArea;
  const totalProjectProfit = totalFutureValue - totalProjectCost;

  // Occupancy calculations
  const totalParkingArea = inputs.landArea * (inputs.parkingOccupancyPercentage / 100) * inputs.undergroundFloors;
  const groundFloorArea = inputs.landArea * (inputs.groundFloorOccupancyPercentage / 100) * 1;
  const totalResidentialArea = inputs.landArea * (inputs.residentialOccupancyPercentage / 100) * inputs.floors;
  const calculatedGrossArea = totalParkingArea + groundFloorArea + totalResidentialArea;
  const areaDifference = calculatedGrossArea - inputs.grossTotalArea;
  const differencePercentage = inputs.grossTotalArea > 0 ? (areaDifference / inputs.grossTotalArea) * 100 : 0;
  const isConsistent = Math.abs(differencePercentage) < 5;
  const differenceColor = !isConsistent ? 'text-rose-600' : 'text-emerald-600';

  const formatBillion = (num: number) => {
      return `${toPersianDigits((num / 1_000_000_000).toFixed(1))} میلیارد تومان`;
  };


  return (
    <div className="space-y-6 animate-fade-in">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard title="بازدهی سالانه (محتمل)" value={`${toPersianDigits(realisticScenario.annualRoi.toFixed(1))}%`} subValue="Annual ROI" icon={<svg className="w-6 h-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="bg-emerald-100" />
            <KpiCard title="هزینه تمام شده (هر متر)" value={formatCurrency(Math.round(realisticScenario.totalCostToBuyer / inputs.unitShareSize))} subValue="برای هر سهم" icon={<svg className="w-6 h-6 text-rose-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h5m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="bg-rose-100" />
            <KpiCard title="ارزش آتی (هر متر)" value={formatCurrency(Math.round(realisticScenario.futureValueShare / inputs.unitShareSize))} subValue="در سناریو محتمل" icon={<svg className="w-6 h-6 text-sky-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} color="bg-sky-100" />
            <KpiCard title="مدت زمان پروژه" value={`${toPersianDigits(totalDuration)} ماه`} subValue={`${toPersianDigits((totalDuration/12).toFixed(1))} سال`} icon={<svg className="w-6 h-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-amber-100" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoCard title="حیاتی پروژه" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                <InfoCardRow label="مساحت زمین" value={`${toPersianDigits(inputs.landArea.toLocaleString())} م²`} />
                <InfoCardRow label="تراکم کل" value={`${toPersianDigits(inputs.grossTotalArea.toLocaleString())} م²`} />
                <InfoCardRow label="تعداد بلوک" value={toPersianDigits(inputs.blocks)} />
                <InfoCardRow label="طبقات" value={`${toPersianDigits(inputs.floors)} روی زمین / ${toPersianDigits(inputs.undergroundFloors)} زیرزمین`} />
                <InfoCardRow label="نوع سازه" value={inputs.constructionType === 'Steel' ? 'اسکلت فلزی' : inputs.constructionType === 'Concrete' ? 'اسکلت بتنی' : 'قالب تونلی'} />
            </InfoCard>

            <InfoCard title="تحلیل متراژ و واحدها" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}>
                <InfoCardRow label="متراژ کل مفید" value={`${toPersianDigits(netSellableArea.toLocaleString())} م²`} />
                <InfoCardRow label="متراژ مفید مسکونی" value={`${toPersianDigits(inputs.netResidentialArea.toLocaleString())} م²`} />
                <InfoCardRow label="متراژ مفید تجاری" value={`${toPersianDigits(inputs.netCommercialArea.toLocaleString())} م²`} />
                <InfoCardRow label="مشاعات و خدماتی" value={`${toPersianDigits(commonAndServiceArea.toLocaleString())} م²`} subValue={inputs.grossTotalArea > 0 ? `${toPersianDigits((commonAndServiceArea / inputs.grossTotalArea * 100).toFixed(1))}% از کل` : ''} />
                <InfoCardRow label="تعداد واحد تخمینی" value={`~ ${toPersianDigits(estimatedUnits)} واحد`} />
            </InfoCard>

            <InfoCard title="خلاصه مالی کلان پروژه (دیدگاه تعاونی)" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <InfoCardRow label="هزینه کل زمین" value={formatBillion(totalLandCost)} />
                <InfoCardRow label="هزینه کل ساخت" value={formatBillion(totalConstructionCostWithOverhead)} subValue="(با بالاسری)" />
                <InfoCardRow label="هزینه کل پروژه" value={formatBillion(totalProjectCost)} />
                <InfoCardRow label="ارزش آتی کل" value={formatBillion(totalFutureValue)} subValue="(سناریو محتمل)" />
                <InfoCardRow label="ارزش افزوده کل پروژه" value={formatBillion(totalProjectProfit)} subValue="(برای تعاونی و اعضا)" />
            </InfoCard>

            <InfoCard title="راستی‌آزمایی تراکم" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
               <InfoCardRow label="تراکم محاسبه شده" value={`${toPersianDigits(Math.round(calculatedGrossArea).toLocaleString())} م²`} subValue="بر اساس سطح اشغال" />
               <InfoCardRow label="تراکم اعلامی" value={`${toPersianDigits(inputs.grossTotalArea.toLocaleString())} م²`} />
               <InfoCardRow label="میزان اختلاف" value={`${toPersianDigits(differencePercentage.toFixed(1))}%`} />
               <div className={`text-center p-2 mt-2 rounded-md text-xs ${differenceColor} ${isConsistent ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                 {isConsistent ? 'تطابق اعداد در محدوده قابل قبول است.' : 'اختلاف قابل توجه است، نیاز به بازبینی دارد.'}
               </div>
            </InfoCard>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-4">نمودار گانت پیشرفت پروژه</h3>
            <TimelineChart phases={inputs.constructionPhases} totalDuration={totalDuration} elapsedMonths={inputs.elapsedMonths} />
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-4">تحلیل جامع پیشرفت فازها</h3>
                <div className="h-48">
                    <ProgressDonutChart physical={(inputs.elapsedMonths / totalDuration) * 100} time={(inputs.elapsedMonths / totalDuration) * 100} />
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-base font-bold text-gray-800 mb-4">هزینه کل ساخت به تفکیک فاز</h3>
                 <PhaseCostChart inputs={inputs} />
              </div>
        </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg text-white overflow-hidden">
         <div className="p-6 md:p-8 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
               <h3 className="text-xl font-bold flex items-center gap-2 text-white">تحلیل سود و زیان از دیدگاه سهام‌دار (هر سهم)</h3>
               <p className="text-slate-400 text-sm mt-1">
                 ارزش آتی پس از کسر کمیسیون فروش محاسبه شده.
               </p>
            </div>
            <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg ${justificationStatus.bg} flex items-center gap-2`}>
               <span className={`text-xs font-bold ${justificationStatus.color}`}>توجیه اقتصادی:</span>
               <span className={`text-sm font-extrabold ${justificationStatus.color}`}>{justificationStatus.label}</span>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4 font-normal">شاخص‌های مالی (هر سهم {toPersianDigits(inputs.unitShareSize)} متری)</th>
                  <th className="p-4 font-normal text-rose-300">سناریو بدبینانه</th>
                  <th className="p-4 font-normal text-blue-300 bg-white/5">سناریو محتمل</th>
                  <th className="p-4 font-normal text-emerald-300">سناریو خوش‌بینانه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">قیمت تمام شده برای خریدار</td>
                  <td className="p-4 font-mono text-slate-200">{formatCurrency(Math.round(pessimisticScenario.totalCostToBuyer))}</td>
                  <td className="p-4 font-mono text-white font-bold bg-white/5">{formatCurrency(Math.round(realisticScenario.totalCostToBuyer))}</td>
                  <td className="p-4 font-mono text-slate-200">{formatCurrency(Math.round(optimisticScenario.totalCostToBuyer))}</td>
                </tr>
                 <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">ارزش فروش سهم (زمان تحویل)</td>
                  <td className="p-4 font-mono text-rose-300 font-bold">{formatCurrency(Math.round(pessimisticScenario.futureValueShare))}</td>
                  <td className="p-4 font-mono text-blue-300 font-bold bg-white/5 text-lg">{formatCurrency(Math.round(realisticScenario.futureValueShare))}</td>
                  <td className="p-4 font-mono text-emerald-300 font-bold">{formatCurrency(Math.round(optimisticScenario.futureValueShare))}</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-4 text-slate-300">سود خالص خریدار</td>
                  <td className="p-4 font-mono text-rose-400">+{formatCurrency(Math.round(pessimisticScenario.buyerProfit))}</td>
                  <td className="p-4 font-mono text-blue-400 font-bold bg-white/5">+{formatCurrency(Math.round(realisticScenario.buyerProfit))}</td>
                  <td className="p-4 font-mono text-emerald-400">+{formatCurrency(Math.round(optimisticScenario.buyerProfit))}</td>
                </tr>
                <tr className="bg-slate-800/80">
                  <td className="p-4 text-slate-300 border-t border-slate-700 font-bold">بازدهی سالانه (Annual ROI)</td>
                  <td className="p-4 font-bold text-rose-400 border-t border-slate-700 dir-ltr text-right">{toPersianDigits(pessimisticScenario.annualRoi.toFixed(1))}٪</td>
                  <td className="p-4 font-bold text-blue-400 bg-white/5 border-t border-slate-600 text-lg dir-ltr text-right">{toPersianDigits(realisticScenario.annualRoi.toFixed(1))}٪</td>
                  <td className="p-4 font-bold text-emerald-400 border-t border-slate-700 dir-ltr text-right">{toPersianDigits(optimisticScenario.annualRoi.toFixed(1))}٪</td>
                </tr>
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;