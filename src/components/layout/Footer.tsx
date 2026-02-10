import { Code2 } from 'lucide-react';
export function Footer() {
  return <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-slate-600 text-center sm:text-left">
            © 2024 Kaduna State Judiciary. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-slate-500">
            <Code2 className="h-4 w-4" />
            <span className="text-xs">
              Developed by{' '}
              <span className="font-semibold text-slate-700">
                Prince E.N Ebereekpendu
              </span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="font-mono text-[10px] text-slate-400">
                NDAPGS/FMSIS/COM052024/4646
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>;
}