import React from 'react';
import { ReadingForm } from './ReadingForm';
import { MeterReading, TariffConfig } from '../types';
import { X } from 'lucide-react';

interface ReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reading: MeterReading) => void;
  initialData?: MeterReading | null;
  lastReading?: MeterReading | null;
  tariff: TariffConfig;
}

export const ReadingModal: React.FC<ReadingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lastReading,
  tariff,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-3xl rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {initialData ? 'Zählerstand bearbeiten' : 'Neue Zählerablesung erfassen'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Geben Sie die aktuellen Stände für Strom, PV, Speicher, Wärmepumpe und Wasser ein
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Form */}
        <ReadingForm
          initialData={initialData}
          lastReading={lastReading}
          tariff={tariff}
          onSave={(reading) => {
            onSave(reading);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
