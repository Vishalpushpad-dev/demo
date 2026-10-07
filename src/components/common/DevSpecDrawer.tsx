import React from 'react';
import { X, FileCode2, CheckCircle2, AlertTriangle, ArrowRight, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { ScreenSpecification } from '../../types/inventory';

interface DevSpecDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  spec?: ScreenSpecification;
}

export const DevSpecDrawer: React.FC<DevSpecDrawerProps> = ({ isOpen, onClose, spec }) => {
  if (!isOpen || !spec) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                  {spec.screenId}
                </span>
                <h2 className="text-base font-bold text-slate-900">{spec.screenName}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Developer Handover Architecture Specification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spec Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-slate-700">
          {/* Section 1 & 2: Purpose & Target Personas */}
          <div className="space-y-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">1. Business Purpose & Objective</h3>
              <p className="mt-1 text-slate-600 leading-relaxed">{spec.purpose}</p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-slate-800">Target User Personas:</span>{' '}
              <span className="text-slate-600">{spec.targetPersonas.join(' · ')}</span>
            </div>
          </div>

          {/* Section 3 & 4: Layout & Components */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              2. UI Layout & Component Hierarchy
            </h3>
            <p className="text-slate-600 bg-white p-3 rounded border border-slate-200">{spec.layout}</p>
            <div className="mt-2">
              <span className="font-semibold text-slate-800 block mb-1.5">Registered Components:</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {spec.components.map((comp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{comp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 5: Data Fields */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              3. Data Fields & Types
            </h3>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Field</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Req</th>
                    <th className="py-2 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {spec.dataFields.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 font-mono font-medium text-slate-900">{f.field}</td>
                      <td className="py-1.5 px-3 text-slate-600">{f.type}</td>
                      <td className="py-1.5 px-3">{f.required ? <span className="text-rose-600 font-bold">Yes</span> : 'No'}</td>
                      <td className="py-1.5 px-3 text-slate-600">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: User Actions & Shortcuts */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              4. User Actions & Keyboard Handlers
            </h3>
            <div className="space-y-1.5">
              {spec.userActions.map((act, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{act.action}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Trigger: {act.trigger} → Result: {act.result}</div>
                  </div>
                  {act.shortcut && (
                    <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-700 shrink-0">
                      {act.shortcut}
                    </kbd>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 7 & 8: Business Rules & Validation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                5. Business Logic Rules
              </h3>
              <ul className="space-y-1.5">
                {spec.businessRules.map((rule, idx) => (
                  <li key={idx} className="p-2 bg-blue-50/50 border border-blue-100 rounded text-slate-700">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                6. UI Validation Rules
              </h3>
              <ul className="space-y-1.5">
                {spec.validationRules.map((val, idx) => (
                  <li key={idx} className="p-2 bg-amber-50/50 border border-amber-100 rounded text-slate-700">
                    {val}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 9: Navigation Paths */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
              7. Navigation & Cross-Module Drill-Downs
            </h3>
            <ul className="space-y-1">
              {spec.navigationPaths.map((path, idx) => (
                <li key={idx} className="text-slate-600 p-2 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]">
                  {path}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 10: Screen States */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              8. UI State Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {spec.uiStates.map((st, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                  <div className="font-bold text-slate-900 text-xs">{st.state} State</div>
                  <div className="text-[11px] text-slate-600 mt-1">{st.description}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">Render: {st.visualBehavior}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Apex ERP Design System v4.2</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
};
