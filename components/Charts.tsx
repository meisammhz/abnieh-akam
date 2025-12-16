import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar } from 'recharts';
import { ProjectInputs, UnitMix } from '../types';
import { toPersianDigits, formatCurrency } from '../utils';

interface Props {
  inputs: ProjectInputs;
}

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444'];

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100 text-xs min-w-[140px]">
         <div className="flex items-center gap-2 mb-2 justify-center">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill || data.fill }}></span>
            <span className="font-bold text-gray-700">{data.name}</span>
         </div>
         <div className="text-center font-bold text-gray-900 dir-ltr bg-gray-50 p-1 rounded border border-gray-50">
           {toPersianDigits(data.value.toLocaleString())}
           {data.unit === 'toman' ? ' تومان' : ' متر مربع'}
         </div>
      </div>
    );
  }
  return null;
};

export const ProgressDonutChart: React.FC<{ physical: number; time: number }> = ({ physical, time }) => {
  const data = [
    { name: 'پیشرفت زمانی', value: time, fill: '#e5e7eb' },
    { name: 'پیشرفت فیزیکی', value: physical, fill: '#16a34a' },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={({ active, payload }) => {
             if (active && payload && payload.length) {
                const data = payload[0];
                return (
                 <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.payload.fill }}></span>
                        <span className="font-medium text-gray-600">{data.name}: </span>
                        <span className="font-bold text-gray-800">{toPersianDigits(Math.round(data.value as number))}%</span>
                     </div>
                 </div>
                );
             }
             return null;
        }} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270}
          innerRadius="60%"
          outerRadius="80%"
          paddingAngle={0}
          dataKey="value"
          stroke="none"
        >
           {/* FIX: The 'cornerRadius' prop is not valid on a <Cell> component. It has been removed to fix the compilation error. */}
           <Cell key={`cell-0`} fill={data[0].fill} />
           <Cell key={`cell-1`} fill={data[1].fill} />
        </Pie>
         <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
            {toPersianDigits(Math.round(physical))}%
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium fill-gray-500">
            پیشرفت فیزیکی
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const CostBreakdownChart: React.FC<{ landCost: number; constructionCost: number }> = ({ landCost, constructionCost }) => {
  const data = [
    { name: 'زمین و تراکم', value: landCost, unit: 'toman' },
    { name: 'ساخت (پایه)', value: constructionCost, unit: 'toman' },
  ];
  const COLORS = ['#fb923c', '#60a5fa'];
  
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
        <Legend wrapperStyle={{fontFamily: 'Vazirmatn', fontSize: '12px', marginTop: '10px'}} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
};


export const LandUseChart: React.FC<Props> = ({ inputs }) => {
  // FIX: Updated component to use correct properties from ProjectInputs type.
  // Replaced `totalArea` with `netResidentialArea` and `commercialArea` with `netCommercialArea`.
  // Calculated common/service area accurately from `grossTotalArea`.
  const commonAndServiceArea = inputs.grossTotalArea - inputs.netResidentialArea - inputs.netCommercialArea;
  const data = [
    { name: 'بنای مفید مسکونی', value: inputs.netResidentialArea, unit: 'm2' },
    { name: 'بنای تجاری', value: inputs.netCommercialArea, unit: 'm2' },
    { name: 'مشاعات و امکانات', value: commonAndServiceArea, unit: 'm2' },
  ];
   const COLORS = ['#22c55e', '#f97316', '#8b5cf6'];


  return (
     <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend wrapperStyle={{fontFamily: 'Vazirmatn', fontSize: '12px'}} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
     </div>
  );
};


export const UnitDistributionChart: React.FC<{ data: UnitMix[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={180}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="size" 
          width={80} 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontFamily: 'Vazirmatn', fontSize: 12, fill: '#4b5563' }} 
        />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          content={({ active, payload }) => {
             if (active && payload && payload.length) {
                const data = payload[0];
                return (
                 <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-100 text-xs">
                     <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">{data.payload.size}: </span>
                        <span className="font-bold text-gray-800">{toPersianDigits(data.value)}% از واحدها</span>
                     </div>
                 </div>
                );
             }
             return null;
          }}
        />
        <Bar dataKey="percentage" barSize={20} radius={[0, 10, 10, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
