import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { ProjectInputs } from '../types';
import { toPersianDigits } from '../utils';

interface Props {
  inputs: ProjectInputs;
}

const COLORS = ['#16a34a', '#fbbf24', '#3b82f6', '#ef4444'];

export const ProfitChart: React.FC<Props> = ({ inputs }) => {
  // Simulate cash flow and multiple scenarios over 42 months
  const data = [];
  let cumulativeCost = 0;
  
  const totalLandCost = (inputs.totalArea / 10) * inputs.unitSharePrice;
  const totalConstructionCost = inputs.totalArea * inputs.constructionCostPerMeter;
  
  // Growth factors from inputs (monthly rate approximation)
  const monthlyOptimisticRate = (inputs.optimisticGrowth / 100) / 12;
  const monthlyPessimisticRate = (inputs.pessimisticGrowth / 100) / 12;
  const monthlyRealisticRate = ((inputs.optimisticGrowth + inputs.pessimisticGrowth) / 200) / 12;

  for (let i = 0; i <= 42; i+=6) {
    let costChunk = 0;
    if (i === 0) costChunk = totalLandCost * 0.5; // Down payment
    else if (i <= 12) costChunk = (totalLandCost * 0.5) / 2; // Installments
    else costChunk = (totalConstructionCost / 30) * 6; // Construction

    cumulativeCost += costChunk;
    
    // Simulate Value Growth
    // We start with a base value that is slightly higher than cost (margin)
    // Note: In real world, market value of pre-sale grows.
    const baseValue = (inputs.totalArea / 10 * inputs.unitSharePrice) + (inputs.totalArea * inputs.constructionCostPerMeter); 
    const initialMargin = 1.15; // 15% initial margin logic
    const startVal = baseValue * initialMargin;

    // We scale the starting value for the graph to look realistic relative to cumulative cost
    // For graphing purposes, we assume 'Value' tracks with cost initially then diverges
    const currentBaseValue = Math.max(cumulativeCost * 1.1, (startVal * (i/42)));

    // Calculate different scenarios
    const valPessimistic = currentBaseValue * Math.pow(1 + monthlyPessimisticRate, i);
    const valRealistic = currentBaseValue * Math.pow(1 + monthlyRealisticRate, i);
    const valOptimistic = currentBaseValue * Math.pow(1 + monthlyOptimisticRate, i);

    data.push({
      month: `ماه ${toPersianDigits(i)}`,
      investment: cumulativeCost / 1000000000, // Billion Tomans
      realistic: valRealistic / 1000000000,
      optimistic: valOptimistic / 1000000000,
      pessimistic: valPessimistic / 1000000000,
    });
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRealistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{fontFamily: 'Vazirmatn', fontSize: 10}} />
          <YAxis tickFormatter={(val) => toPersianDigits(val)} tick={{fontFamily: 'Vazirmatn', fontSize: 10}} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip 
            formatter={(val: number, name: string) => {
                let label = '';
                if(name === 'optimistic') label = 'سناریو خوش‌بینانه';
                if(name === 'realistic') label = 'سناریو واقع‌بینانه';
                if(name === 'pessimistic') label = 'سناریو بدبینانه';
                if(name === 'investment') label = 'هزینه تجمعی';
                return [toPersianDigits(val.toFixed(1)) + ' میلیارد', label];
            }}
            contentStyle={{fontFamily: 'Vazirmatn', direction: 'rtl'}}
          />
          {/* We stack areas to create the 'range' effect implies Optimistic is the top bound */}
          <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeDasharray="5 5" fill="url(#colorOptimistic)" name="optimistic" />
          <Area type="monotone" dataKey="realistic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRealistic)" name="realistic" />
          <Area type="monotone" dataKey="pessimistic" stroke="#ef4444" strokeWidth={1} fillOpacity={0} name="pessimistic" />
          <Area type="monotone" dataKey="investment" stroke="#f59e0b" strokeWidth={2} fill="none" name="investment" />
          <Legend wrapperStyle={{fontFamily: 'Vazirmatn', fontSize: '10px'}} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LandUseChart: React.FC<Props> = ({ inputs }) => {
  const data = [
    { name: 'بنای مفید مسکونی', value: inputs.totalArea },
    { name: 'بنای تجاری', value: inputs.commercialArea },
    { name: 'مشاعات و امکانات', value: inputs.totalArea * 0.35 }, // Estimated common areas
  ];

  return (
     <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number) => toPersianDigits(val.toLocaleString()) + ' متر'} contentStyle={{fontFamily: 'Vazirmatn', direction: 'rtl'}} />
          <Legend wrapperStyle={{fontFamily: 'Vazirmatn', fontSize: '12px'}} />
        </PieChart>
      </ResponsiveContainer>
     </div>
  );
};

export const CashFlowChart: React.FC<Props> = ({ inputs }) => {
  const data = [];
  const totalShares = inputs.totalArea / 10;
  const addFee = inputs.additionalFee || 50000000;
  
  // Phase 1: Purchase (Month 0)
  const initialInflowPerShare = (inputs.unitSharePrice * 0.5) + addFee;
  
  // Phase 1 End/Phase 2 Start (Month 12)
  const secondaryInflowPerShare = inputs.unitSharePrice * 0.5;

  // Construction (Month 13 to 42 - 30 months)
  const totalConstructionCost = inputs.totalArea * inputs.constructionCostPerMeter;
  const monthlyConstructionCollection = totalConstructionCost / 30;

  for (let i = 0; i <= inputs.durationMonths; i++) {
    let inflow = 0;
    let outflow = 0;

    if (i === 0) {
      inflow += totalShares * initialInflowPerShare;
      outflow += (totalShares * initialInflowPerShare) * 0.9; // Land payment
    } else if (i === 12) {
      inflow += totalShares * secondaryInflowPerShare;
      outflow += (totalShares * secondaryInflowPerShare) * 0.8; // Settlements
    } else if (i > 12) {
      inflow += monthlyConstructionCollection;
      outflow += monthlyConstructionCollection * 0.95; // Construction cost
    } else {
      outflow += 1000000000; // Low overhead for months 1-11
    }

    data.push({
      month: i,
      inflow: inflow / 1000000000, 
      outflow: outflow / 1000000000
    });
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{fontFamily: 'Vazirmatn', fontSize: 10}} />
          <YAxis tickFormatter={(val) => toPersianDigits(val)} tick={{fontFamily: 'Vazirmatn', fontSize: 10}} label={{ value: 'میلیارد تومان', angle: -90, position: 'insideLeft', fontFamily: 'Vazirmatn', fontSize: 10 }}/>
          <Tooltip 
             formatter={(val: number) => [toPersianDigits(val.toFixed(1)) + ' میلیارد', '']}
             contentStyle={{fontFamily: 'Vazirmatn', direction: 'rtl'}}
             cursor={{fill: '#f3f4f6'}}
          />
          <Legend wrapperStyle={{fontFamily: 'Vazirmatn'}} />
          <Bar dataKey="inflow" fill="#16a34a" name="ورودی (شارژ)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="outflow" fill="#ef4444" name="خروجی (هزینه)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};