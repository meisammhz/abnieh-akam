import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

// Register fonts required by react-pdf-tailwind for Tailwind's "font-sans" and "font-mono"
// Use Vazirmatn to ensure Persian text and digits render correctly
Font.register({
  family: 'ui-sans-serif',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf'
});

Font.register({
  family: 'ui-monospace',
  src: 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf'
});
import { ProjectInputs, ProposalContent } from '../types';
import { toPersianDigits, getCurrentShamsiDate, formatCurrency } from '../utils';

// Create TailwindCSS style function
const tw = createTw({
  theme: {
    extend: {
      colors: {
        akam: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
});

interface PdfReportProps {
  inputs: ProjectInputs;
  content: ProposalContent;
}

const PdfReport: React.FC<PdfReportProps> = ({ inputs, content }) => {
  console.log('PdfReport rendering with inputs:', inputs);
  console.log('PdfReport rendering with content:', content);
  // Re-use some calculations from ProposalView for consistency
  const baseTotalConstructionCostPerMeter = inputs.constructionPhases.reduce((sum, phase) => sum + Number(phase.costPerMeter || 0), 0);
  const landCostPerMeter = inputs.unitSharePrice / inputs.unitShareSize;
  const totalBaseCostPerMeter = landCostPerMeter + baseTotalConstructionCostPerMeter;
  const totalCostWithOverheadPerMeter = totalBaseCostPerMeter * (1 + inputs.adminOverheadPercentage / 100);
  const initialValueGapPerMeter = inputs.marketPricePerMeter - totalCostWithOverheadPerMeter;

  const totalParkingArea = inputs.landArea * (inputs.parkingOccupancyPercentage / 100) * inputs.undergroundFloors;
  const groundFloorArea = inputs.landArea * (inputs.groundFloorOccupancyPercentage / 100) * 1;
  const totalResidentialArea = inputs.landArea * (inputs.residentialOccupancyPercentage / 100) * inputs.floors;
  const calculatedGrossArea = totalParkingArea + groundFloorArea + totalResidentialArea;
  const areaDifference = calculatedGrossArea - inputs.grossTotalArea;
  const differencePercentage = inputs.grossTotalArea > 0 ? Math.abs(areaDifference / inputs.grossTotalArea) * 100 : 0;
  const isConsistent = differencePercentage < 5; // Allow up to 5% variance for rounding etc.

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={tw('mb-6')}>
      <Text style={tw('text-xl font-bold text-gray-800 mb-3')}>{title}</Text>
      <View style={tw('text-sm text-gray-700 leading-6')}>
        {children}
      </View>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={tw('p-10 font-sans text-right')}>
        {/* Cover Page Elements */}
        <View style={tw('mb-10 text-center')}>
          <Text style={tw('text-xs text-blue-600 uppercase tracking-widest mb-2')}>گزارش امکان‌سنجی و طرح توجیهی</Text>
          <Text style={tw('text-3xl font-extrabold text-gray-900 mb-2')}>پروژه {inputs.projectName}</Text>
          <Text style={tw('text-sm text-gray-600')}>{inputs.projectVibe}</Text>
        </View>

        <View style={tw('flex flex-row justify-around text-sm text-gray-600 mb-10')}>
          <View style={tw('text-right pr-4 border-r-2 border-gray-300')}>
            <Text style={tw('font-bold text-gray-900')}>تاریخ گزارش</Text>
            <Text>{toPersianDigits(getCurrentShamsiDate())}</Text>
          </View>
          <View style={tw('text-right pr-4 border-r-2 border-gray-300')}>
            <Text style={tw('font-bold text-gray-900')}>موقعیت پروژه</Text>
            <Text>{inputs.location}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <Section title="خلاصه مدیریتی">
          <Text>{content.executiveSummary}</Text>
        </Section>

        {/* Architectural and Technical Deep Dive */}
        <Section title="تحلیل عمیق معماری و فنی">
          <Text>{content.architecturalDeepDive}</Text>
          <View style={tw('my-5 border border-gray-200 rounded-lg overflow-hidden')}>
            <Text style={tw('text-base font-bold text-gray-800 p-3 bg-gray-50 border-b border-gray-200')}>راستی‌آزمایی تراکم ساختمانی</Text>
            <View style={tw('w-full text-sm')}>
              <View style={tw('flex flex-row border-b border-gray-100 py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-600 text-xs')}>مساحت زمین</Text>
                <Text style={tw('w-1/2 font-mono text-left font-bold text-gray-700 text-sm')}>{toPersianDigits(inputs.landArea.toLocaleString())} م²</Text>
              </View>
              <View style={tw('flex flex-row border-b border-gray-100 py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-600 text-xs')}>مساحت کل پارکینگ‌ها ({toPersianDigits(inputs.undergroundFloors)} طبقه با اشغال {toPersianDigits(inputs.parkingOccupancyPercentage)}٪)</Text>
                <Text style={tw('w-1/2 font-mono text-left font-bold text-gray-700 text-sm')}>{toPersianDigits(Math.round(totalParkingArea).toLocaleString())} م²</Text>
              </View>
              <View style={tw('flex flex-row border-b border-gray-100 py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-600 text-xs')}>مساحت طبقه همکف (با اشغال {toPersianDigits(inputs.groundFloorOccupancyPercentage)}٪)</Text>
                <Text style={tw('w-1/2 font-mono text-left font-bold text-gray-700 text-sm')}>{toPersianDigits(Math.round(groundFloorArea).toLocaleString())} م²</Text>
              </View>
              <View style={tw('flex flex-row border-b border-gray-100 py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-600 text-xs')}>مساحت کل طبقات مسکونی ({toPersianDigits(inputs.floors)} طبقه با اشغال {toPersianDigits(inputs.residentialOccupancyPercentage)}٪)</Text>
                <Text style={tw('w-1/2 font-mono text-left font-bold text-gray-700 text-sm')}>{toPersianDigits(Math.round(totalResidentialArea).toLocaleString())} م²</Text>
              </View>
              <View style={tw('flex flex-row bg-gray-50 font-bold py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-800 text-sm')}>تراکم کل محاسبه شده (بر اساس سطح اشغال)</Text>
                <Text style={tw('w-1/2 font-mono text-left text-blue-600 text-sm')}>{toPersianDigits(Math.round(calculatedGrossArea).toLocaleString())} م²</Text>
              </View>
              <View style={tw('flex flex-row py-1 px-3')}>
                <Text style={tw('w-1/2 text-gray-800 text-sm')}>تراکم کل اعلامی پروژه</Text>
                <Text style={tw('w-1/2 font-mono text-left text-blue-600 text-sm')}>{toPersianDigits(inputs.grossTotalArea.toLocaleString())} م²</Text>
              </View>
            </View>
            <View style={tw(`p-3 text-center font-medium ${isConsistent ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`)}>
              <Text>
                {isConsistent 
                  ? `تطابق اعداد (با اختلاف جزئی ${toPersianDigits(differencePercentage.toFixed(1))}٪) نشان‌دهنده دقت بالای محاسبات و امکان‌سنجی پروژه است.`
                  : `اختلاف ${toPersianDigits(differencePercentage.toFixed(1))}٪ بین تراکم اعلامی و محاسبه‌شده نیازمند بازبینی است.`
                }
              </Text>
            </View>
          </View>
        </Section>

        {/* Location and Access Analysis */}
        <Section title="تحلیل استراتژیک موقعیت و دسترسی">
          <Text>{content.locationAndAccessAnalysis}</Text>
        </Section>

        {/* Financial Model and Profitability */}
        <Section title="مدل مالی و توجیه اقتصادی پروژه">
          <Text>{content.financialModelAndProfitability}</Text>
        </Section>

        {/* Investor Value Proposition */}
        <Section title="ارزش پیشنهادی برای سرمایه‌گذار">
          <Text>{content.investorValueProposition}</Text>
          <View style={tw('bg-slate-900 text-white rounded-lg p-5 my-5 text-center')}>
            <Text style={tw('text-lg font-bold mb-2')}>شکاف ارزشی: فرصت طلایی سرمایه‌گذاری</Text>
            <Text style={tw('text-xs text-slate-400 mb-4')}>مقایسه هزینه تمام شده (با بالاسری) با قیمت روز بازار (هر متر مربع)</Text>
            <View style={tw('flex flex-row justify-around items-center')}>
              <View style={tw('flex-1')}>
                <Text style={tw('text-sm text-slate-300')}>قیمت بازار</Text>
                <Text style={tw('text-2xl font-bold my-1 text-blue-400')}>{formatCurrency(inputs.marketPricePerMeter)}</Text>
              </View>
              <Text style={tw('text-2xl font-thin text-slate-500')}>-</Text>
              <View style={tw('flex-1')}>
                <Text style={tw('text-sm text-slate-300')}>قیمت تمام شده ما</Text>
                <Text style={tw('text-2xl font-bold my-1 text-amber-400')}>{formatCurrency(totalCostWithOverheadPerMeter)}</Text>
              </View>
              <Text style={tw('text-2xl font-thin text-slate-500')}>=</Text>
              <View style={tw('flex-1 bg-slate-800 p-3 rounded-lg border border-slate-700')}>
                <Text style={tw('text-sm text-emerald-400 font-bold')}>سود اولیه شما</Text>
                <Text style={tw('text-2xl font-extrabold my-1 text-white')}>{formatCurrency(initialValueGapPerMeter)}</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Investor Analysis */}
        <Section title="تحلیل سرمایه‌گذاری برای خریدار">
          <Text>{content.investorAnalysis.text}</Text>
        </Section>

        {/* Cooperative Analysis */}
        <Section title="تحلیل استراتژیک برای تعاونی">
          <Text>{content.cooperativeAnalysis.text}</Text>
        </Section>

        {/* Risk and Mitigation */}
        <Section title="تحلیل ریسک و راهکارهای مدیریتی">
          <View style={tw('border-blue-500 border-2 rounded-lg p-4 mb-6')}>
            <Text style={tw('text-sm text-amber-800')}>{content.riskAndMitigation}</Text>
          </View>
        </Section>

        {/* Footer */}
        <View style={tw('text-center mt-10 pt-10 border-t border-gray-100')}>
          <Text style={tw('text-xs text-gray-600 mb-2')}>تهیه شده توسط میثم میرمحمودزاده</Text>
          {inputs.companyLogo ? (
            <Image
              src={inputs.companyLogo}
              style={tw('mx-auto my-2')}
            />
          ) : (
            <Text style={tw('font-bold text-gray-800 text-sm')}>شرکت تعاونی عمرانی نوین ساز ابنیه آکام</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PdfReport;