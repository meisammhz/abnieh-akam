import React from 'react';
import { ProjectInputs, UnitMix } from '../types';
import { toPersianDigits, formatCurrency } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


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
  
  const totalOverheadCostPerMeter = baseTotalConstructionCostPerMeter * (inputs.adminOverheadPercentage / 100);
  const financialData = [
      { name: 'زمین و تراکم', value: landCostPerMeter, fill: '#fb923c' },
      { name: 'ساخت (پایه)', value: baseTotalConstructionCostPerMeter, fill: '#60a5fa' },
      { name: 'هزینه بالاسری', value: totalOverheadCostPerMeter, fill: '#8b5cf6' },
  ];
  
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

  const formatBillion = (num: number) => {
      return `${toPersianDigits((num / 1_000_000_000).toFixed(1))} میلیارد تومان`;
  };

  const PHASE_COLORS = [
    { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-500', progress: 'bg-sky-500' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-500', progress: 'bg-teal-500' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-500', progress: 'bg-indigo-500' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-500', progress: 'bg-fuchsia-500' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-500', progress: 'bg-rose-500' },
  ];

  let accumulatedDuration = 0;
  const phaseDetails = inputs.constructionPhases.map((phase, index) => {
    const totalPhaseCost = phase.costPerMeter * inputs.grossTotalArea;
    
    let status = 'شروع نشده';
    let phaseProgress = 0;

    if (inputs.elapsedMonths > accumulatedDuration) {
        if (inputs.elapsedMonths >= accumulatedDuration + phase.durationMonths) {
            status = 'تکمیل شده';
            phaseProgress = 100;
        } else {
            status = 'در حال انجام';
            phaseProgress = ((inputs.elapsedMonths - accumulatedDuration) / phase.durationMonths) * 100;
        }
    }

    const spentCost = totalPhaseCost * (phaseProgress / 100);
    
    const startMonth = accumulatedDuration;
    accumulatedDuration += phase.durationMonths;

    return {
        ...phase,
        totalPhaseCost,
        spentCost,
        status,
        phaseProgress: Math.round(phaseProgress),
        startMonth,
        colors: PHASE_COLORS[index % PHASE_COLORS.length]
    };
  });


  return (
    <div className="space-y-6 animate-fade-in">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <KpiCard title="بازدهی سالانه (محتمل)" value={`${toPersianDigits(realisticScenario.annualRoi.toFixed(1))}%`} subValue="Annual ROI" icon={<svg className="w-6 h-6 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} color="bg-emerald-100" />
            <KpiCard title="هزینه تمام شده (هر متر)" value={formatCurrency(Math.round(realisticScenario.totalCostToBuyer / inputs.unitShareSize))} subValue="برای هر سهم" icon={<svg className="w-6 h-6 text-rose-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h5m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="bg-rose-100" />
            <KpiCard title="ارزش آتی (هر متر)" value={formatCurrency(Math.round(realisticScenario.futureValueShare / inputs.unitShareSize))} subValue="در سناریو محتمل" icon={<svg className="w-6 h-6 text-sky-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} color="bg-sky-100" />
            <KpiCard title="مدت زمان پروژه" value={`${toPersianDigits(totalDuration)} ماه`} subValue={`${toPersianDigits((totalDuration/12).toFixed(1))} سال`} icon={<svg className="w-6 h-6 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-amber-100" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                <InfoCardRow label="متوسط متراژ واحد" value={`${toPersianDigits(averageUnitSize.toFixed(0))} م²`} />
            </InfoCard>

            <InfoCard title="خلاصه مالی کلان پروژه (دیدگاه تعاونی)" icon={<svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <InfoCardRow label="هزینه کل زمین" value={formatBillion(totalLandCost)} />
                <InfoCardRow label="هزینه کل ساخت" value={formatBillion(totalConstructionCostWithOverhead)} subValue="(با بالاسری)" />
                <InfoCardRow label="هزینه کل پروژه" value={formatBillion(totalProjectCost)} />
                <InfoCardRow label="ارزش آتی کل" value={formatBillion(totalFutureValue)} subValue="(سناریو محتمل)" />
                <InfoCardRow label="ارزش افزوده کل پروژه" value={formatBillion(totalProjectProfit)} subValue="(برای تعاونی و اعضا)" />
            </InfoCard>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-base font-bold text-gray-800 mb-6">زمانبندی پرداخت‌های سهام‌دار</h3>
           <div className="relative border-r-2 border-dashed border-gray-200 pr-8 py-4 space-y-10">
                {inputs.installments.map(inst => {
                    const isPaid = inputs.elapsedMonths >= inst.dueMonth;
                    const isDue = inputs.elapsedMonths >= inst.dueMonth -1 && inputs.elapsedMonths < inst.dueMonth;
                    let statusClasses = {
                        bg: 'bg-gray-400',
                        text: 'پرداخت آتی',
                        ring: 'ring-gray-300'
                    };
                    if (isPaid) {
                        statusClasses = { bg: 'bg-akam-600', text: 'پرداخت شده', ring: 'ring-akam-200' };
                    }
                    if (isDue) {
                        statusClasses = { bg: 'bg-amber-500 animate-pulse', text: 'سررسید فعلی', ring: 'ring-amber-300' };
                    }
                    
                    return (
                       <div key={inst.id} className="relative">
                          <div className={`absolute -right-[42px] top-1/2 -translate-y-1/2 w-6 h-6 ${statusClasses.bg} rounded-full ring-4 ${statusClasses.ring} ring-offset-2 ring-offset-white`}></div>
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                              <div>
                                 <p className="font-bold text-gray-800">{inst.name}</p>
                                 <p className="text-xs text-gray-500">
                                   سررسید: ماه {toPersianDigits(inst.dueMonth)}
                                 </p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(inst.amount)} <span className="text-xs font-normal">تومان</span></span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPaid ? 'bg-akam-50 text-akam-700' : isDue ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>{statusClasses.text}</span>
                              </div>
                          </div>
                       </div>
                    );
                })}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-800 mb-6">تحلیل جامع پیشرفت فازها</h3>
                <div className="space-y-6">
                    {phaseDetails.map(phase => (
                        <div key={phase.id}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${phase.colors.progress}`}></span>
                                  <span className="font-bold text-gray-700 text-sm">{phase.name}</span>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${phase.colors.bg} ${phase.colors.text}`}>{phase.status}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 relative overflow-hidden border border-gray-200">
                                <div className={`${phase.colors.progress} h-4 rounded-full transition-all duration-500`} style={{ width: `${phase.phaseProgress}%` }}></div>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-lighten">{toPersianDigits(phase.phaseProgress)}%</span>
                            </div>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                <div>
                                    <span>هزینه مصرف شده: </span>
                                    <span className="font-bold text-gray-800">{formatBillion(phase.spentCost)}</span>
                                </div>
                                <div>
                                    <span>هزینه کل فاز: </span>
                                    <span className="font-bold">{formatBillion(phase.totalPhaseCost)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-base font-bold text-gray-800 mb-4">آنالیز هزینه تمام شده (هر متر)</h3>
                 <div className="h-48">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={financialData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}>
                              {financialData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                           </Pie>
                           <Tooltip content={({ active, payload }) => {
                               if (active && payload && payload.length) {
                                   return <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs"><p className="font-bold">{payload[0].name}</p><p className="text-gray-600">{formatCurrency(payload[0].value as number)} تومان</p></div>;
                               }
                               return null;
                           }}/>
                        </PieChart>
                     </ResponsiveContainer>
                 </div>
                 <div className="mt-4 space-y-2 text-xs">
                    {financialData.map(item => (
                        <div key={item.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.fill}}></span>
                                <span className="text-gray-600">{item.name}</span>
                            </div>
                            <span className="font-bold text-gray-700">{formatCurrency(Math.round(item.value))}</span>
                        </div>
                    ))}
                 </div>
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