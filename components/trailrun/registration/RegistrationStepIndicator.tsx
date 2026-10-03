'use client';

import React from 'react';
import { FormStep, STEP_LABELS } from './types';

interface StepIndicatorProps {
  currentStep: FormStep;
}

export default function RegistrationStepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as FormStep;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;
          return (
            <div key={label} className="flex items-center gap-1.5 sm:gap-3 flex-1">
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-sm font-bold transition-all duration-300 shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-[#C9A227] text-[#0d1c32] shadow-md'
                      : 'bg-slate-100 text-slate-400 border border-black/10'
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  stepNum
                )}
              </div>
              <span className="hidden lg:block text-[11px] text-slate-500 font-medium">{label}</span>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] rounded-full mx-1 sm:mx-2 transition-colors duration-300 ${
                    isDone ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="lg:hidden text-center text-xs font-semibold text-[#C9A227] mt-3 uppercase tracking-wider">
        {STEP_LABELS[currentStep - 1]}
      </p>
    </div>
  );
}
