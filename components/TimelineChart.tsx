import React from 'react';
import { ConstructionPhase } from '../types';
import { toPersianDigits } from '../utils';

interface Props {
  phases: ConstructionPhase[];
  totalDuration: number;
  elapsedMonths: number;
}

const PHASE_COLORS = [
  'bg-sky-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-fuchsia-500',
  'bg-rose-500',
];

export const TimelineChart: React.FC<Props> = ({ phases, totalDuration, elapsedMonths }) => {
  if (totalDuration === 0) {
    return <div className="text-center text-gray-500">مدت زمان پروژه تعریف نشده است.</div>;
  }

  let accumulatedDuration = 0;

  return (
    <div className="space-y-4 text-xs">
      {/* Phases Legend & Bars */}
      <div className="relative h-12 bg-gray-100 rounded-lg">
        {phases.map((phase, index) => {
          const left = (accumulatedDuration / totalDuration) * 100;
          const width = (phase.durationMonths / totalDuration) * 100;
          accumulatedDuration += phase.durationMonths;
          
          return (
            <div
              key={phase.id}
              className={`absolute top-0 h-full flex items-center justify-center text-white font-bold text-center rounded-md transition-all duration-500 ${PHASE_COLORS[index % PHASE_COLORS.length]}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${phase.name}: ${toPersianDigits(phase.durationMonths)} ماه`}
            >
              <span className="truncate px-2">{phase.name}</span>
            </div>
          );
        })}
        {/* Progress Line */}
        <div 
          className="absolute top-0 left-0 h-full border-r-2 border-red-500 border-dashed transition-all duration-500"
          style={{ left: `${(elapsedMonths / totalDuration) * 100}%` }}
        >
          <div className="absolute -top-6 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] shadow-lg">
            {toPersianDigits(Math.round((elapsedMonths/totalDuration)*100))}%
          </div>
        </div>
      </div>

      {/* Timeline Axis */}
      <div className="relative h-4 flex justify-between">
        {[...Array(6)].map((_, i) => {
          const month = Math.round(totalDuration * (i / 5));
          return (
            <div key={i} className="flex flex-col items-center text-gray-400">
              <span className="w-px h-1.5 bg-gray-300"></span>
              <span>{toPersianDigits(month)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};