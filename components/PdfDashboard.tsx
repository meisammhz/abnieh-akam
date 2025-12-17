import React from 'react';
import { Document, Page, Text, View, Font, Image } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import { ProjectInputs } from '../types';
import { toPersianDigits, getCurrentShamsiDate, formatCurrency } from '../utils';

// Register fonts for Tailwind mappings used by react-pdf-tailwind
Font.register({
  family: 'ui-sans-serif',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf'
});
Font.register({
  family: 'ui-monospace',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf'
});

const tw = createTw({});

interface Props {
  inputs: ProjectInputs;
}

const PdfDashboard: React.FC<Props> = ({ inputs }) => {
  const totalDuration = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.durationMonths || 0), 0);
  const years = totalDuration / 12;

  const totalCostToBuyer = inputs.installments.reduce((sum, inst) => sum + inst.amount, 0);

  const calcScenario = (growth: number) => {
    const futureValuePerMeter = inputs.marketPricePerMeter * Math.pow(1 + (growth / 100), years);
    const futureValueShare = futureValuePerMeter * inputs.unitShareSize;
    const afterCommission = futureValueShare * (1 - inputs.salesCommissionPercentage / 100);
    const buyerProfit = afterCommission - totalCostToBuyer;
    const totalRoi = totalCostToBuyer > 0 ? (buyerProfit / totalCostToBuyer) * 100 : 0;
    const annualRoi = years > 0 ? (Math.pow(1 + totalRoi / 100, 1 / years) - 1) * 100 : 0;
    return { totalCostToBuyer, futureValueShare: afterCommission, buyerProfit, annualRoi };
  };

  const realisticGrowth = (inputs.pessimisticMarketGrowth + inputs.optimisticMarketGrowth) / 2;
  const pessimistic = calcScenario(inputs.pessimisticMarketGrowth);
  const realistic = calcScenario(realisticGrowth);
  const optimistic = calcScenario(inputs.optimisticMarketGrowth);

  const netSellableArea = inputs.netResidentialArea + inputs.netCommercialArea;
  const commonAndServiceArea = inputs.grossTotalArea - netSellableArea;

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={tw('mb-6')}>
      <Text style={tw('text-lg font-bold text-gray-800 mb-3')}>{title}</Text>
      <View style={tw('text-sm text-gray-700 leading-6')}>
        {children}
      </View>
    </View>
  );

  const Row: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <View style={tw('flex flex-row justify-between border-b border-gray-100 py-1')}>
      <Text style={tw('text-xs text-gray-600')}>{label}</Text>
      <View style={tw('text-right')}>
        <Text style={tw('text-sm font-bold text-gray-800')}>{value}</Text>
        {sub ? <Text style={tw('text-xs text-gray-400')}>{sub}</Text> : null}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={tw('p-10 font-sans text-right')}>
        <View style={tw('mb-8 text-center')}>
          <Text style={tw('text-xs text-blue-600 uppercase tracking-widest mb-2')}>داشبورد خلاصه پروژه</Text>
          <Text style={tw('text-2xl font-extrabold text-gray-900 mb-2')}>پروژه {inputs.projectName}</Text>
          <Text style={tw('text-sm text-gray-600')}>{inputs.projectVibe}</Text>
        </View>

        <View style={tw('flex flex-row justify-around text-sm text-gray-600 mb-8')}>
          <View style={tw('text-right pr-4 border-r-2 border-gray-300')}>
            <Text style={tw('font-bold text-gray-900')}>تاریخ گزارش</Text>
            <Text>{toPersianDigits(getCurrentShamsiDate())}</Text>
          </View>
          <View style={tw('text-right pr-4 border-r-2 border-gray-300')}>
            <Text style={tw('font-bold text-gray-900')}>موقعیت پروژه</Text>
            <Text>{inputs.location}</Text>
          </View>
        </View>

        <Section title="شاخص‌های کلیدی پروژه">
          <Row label="مدت زمان پروژه" value={`${toPersianDigits(totalDuration)} ماه`} sub={`${toPersianDigits(years.toFixed(1))} سال`} />
          <Row label="متراژ کل مفید" value={`${toPersianDigits(netSellableArea.toLocaleString())} م²`} />
          <Row label="متراژ مفید مسکونی" value={`${toPersianDigits(inputs.netResidentialArea.toLocaleString())} م²`} />
          <Row label="متراژ مفید تجاری" value={`${toPersianDigits(inputs.netCommercialArea.toLocaleString())} م²`} />
          <Row label="مشاعات و خدماتی" value={`${toPersianDigits(commonAndServiceArea.toLocaleString())} م²`} sub={inputs.grossTotalArea > 0 ? `${toPersianDigits(((commonAndServiceArea / inputs.grossTotalArea) * 100).toFixed(1))}% از کل` : ''} />
        </Section>

        <Section title="خلاصه مالی (هر سهم)">
          <Row label="قیمت تمام‌شده برای خریدار" value={formatCurrency(Math.round(realistic.totalCostToBuyer))} />
          <Row label="ارزش فروش سهم (زمان تحویل) - محتمل" value={formatCurrency(Math.round(realistic.futureValueShare))} />
          <Row label="سود خالص خریدار - محتمل" value={`+${formatCurrency(Math.round(realistic.buyerProfit))}`} />
          <Row label="بازدهی سالانه - محتمل" value={`${toPersianDigits(realistic.annualRoi.toFixed(1))}٪`} />
        </Section>

        <Section title="سناریوها">
          <View style={tw('flex flex-row gap-3')}>
            <View style={tw('flex-1 bg-gray-50 rounded-lg border border-gray-200 p-3')}>
              <Text style={tw('text-xs text-rose-600 font-bold mb-2')}>بدبینانه</Text>
              <Row label="قیمت تمام‌شده" value={formatCurrency(Math.round(pessimistic.totalCostToBuyer))} />
              <Row label="ارزش فروش سهم" value={formatCurrency(Math.round(pessimistic.futureValueShare))} />
              <Row label="سود خالص" value={`+${formatCurrency(Math.round(pessimistic.buyerProfit))}`} />
              <Row label="بازدهی سالانه" value={`${toPersianDigits(pessimistic.annualRoi.toFixed(1))}٪`} />
            </View>
            <View style={tw('flex-1 bg-gray-50 rounded-lg border border-gray-200 p-3')}>
              <Text style={tw('text-xs text-blue-600 font-bold mb-2')}>محتمل</Text>
              <Row label="قیمت تمام‌شده" value={formatCurrency(Math.round(realistic.totalCostToBuyer))} />
              <Row label="ارزش فروش سهم" value={formatCurrency(Math.round(realistic.futureValueShare))} />
              <Row label="سود خالص" value={`+${formatCurrency(Math.round(realistic.buyerProfit))}`} />
              <Row label="بازدهی سالانه" value={`${toPersianDigits(realistic.annualRoi.toFixed(1))}٪`} />
            </View>
            <View style={tw('flex-1 bg-gray-50 rounded-lg border border-gray-200 p-3')}>
              <Text style={tw('text-xs text-emerald-600 font-bold mb-2')}>خوش‌بینانه</Text>
              <Row label="قیمت تمام‌شده" value={formatCurrency(Math.round(optimistic.totalCostToBuyer))} />
              <Row label="ارزش فروش سهم" value={formatCurrency(Math.round(optimistic.futureValueShare))} />
              <Row label="سود خالص" value={`+${formatCurrency(Math.round(optimistic.buyerProfit))}`} />
              <Row label="بازدهی سالانه" value={`${toPersianDigits(optimistic.annualRoi.toFixed(1))}٪`} />
            </View>
          </View>
        </Section>

        <View style={tw('text-center mt-10 pt-10 border-t border-gray-100')}>
          <Text style={tw('text-xs text-gray-600 mb-2')}>تهیه شده توسط میثم میرمحمودزاده</Text>
          {inputs.companyLogo ? (
            <Image src={inputs.companyLogo} style={tw('mx-auto my-2')} />
          ) : null}
        </View>
      </Page>
    </Document>
  );
};

export default PdfDashboard;