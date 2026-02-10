import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, User, FolderOpen, ArrowRight } from 'lucide-react';
interface SearchResult {
  id: string;
  type: 'case' | 'document' | 'user';
  title: string;
  subtitle: string;
  link: string;
}
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function SearchModal({
  isOpen,
  onClose
}: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Mock search results - updated with encoded links
  const allResults: SearchResult[] = [{
    id: '1',
    type: 'case',
    title: 'State vs. Abdullahi Musa',
    subtitle: 'KDH/2024/001 • Criminal',
    link: `/cases/${encodeURIComponent('KDH/2024/001')}`
  }, {
    id: '2',
    type: 'case',
    title: 'Land Dispute: Zaria GRA',
    subtitle: 'KDH/2024/015 • Civil',
    link: `/cases/${encodeURIComponent('KDH/2024/015')}`
  }, {
    id: '3',
    type: 'document',
    title: 'Affidavit of Service',
    subtitle: 'Filed yesterday • PDF',
    link: '/documents'
  }, {
    id: '4',
    type: 'user',
    title: 'Hon. Justice Ibrahim',
    subtitle: 'High Court Judge',
    link: '/staff'
  }, {
    id: '5',
    type: 'case',
    title: 'Contract Breach: ABC Ltd',
    subtitle: 'KDH/2024/022 • Commercial',
    link: `/cases/${encodeURIComponent('KDH/2024/022')}`
  }];
  const filteredResults = query ? allResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase())) : [];
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const handleResultClick = (link: string) => {
    navigate(link);
    onClose();
  };
  return <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b border-slate-200 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input ref={inputRef} type="text" placeholder="Search cases, documents, staff..." className="flex-1 bg-transparent border-none text-lg focus:outline-none placeholder:text-slate-400" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Escape' && onClose()} />
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query === '' ? <div className="p-8 text-center text-slate-500">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-10" />
              <p className="text-sm">Type to start searching...</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs cursor-pointer hover:bg-slate-200" onClick={() => setQuery('State vs')}>
                  State vs...
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs cursor-pointer hover:bg-slate-200" onClick={() => setQuery('Affidavit')}>
                  Affidavit
                </span>
                <span className="px-2 py-1 bg-slate-100 rounded text-xs cursor-pointer hover:bg-slate-200" onClick={() => setQuery('Justice')}>
                  Justice
                </span>
              </div>
            </div> : filteredResults.length > 0 ? <div className="space-y-1">
              {filteredResults.map(result => <div key={result.id} onClick={() => handleResultClick(result.link)} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                  <div className={`p-2 rounded-lg ${result.type === 'case' ? 'bg-blue-100 text-blue-600' : result.type === 'document' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {result.type === 'case' ? <FolderOpen className="h-5 w-5" /> : result.type === 'document' ? <FileText className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 group-hover:text-primary transition-colors">
                      {result.title}
                    </h4>
                    <p className="text-xs text-slate-500">{result.subtitle}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </div>)}
            </div> : <div className="p-8 text-center text-slate-500">
              <p>No results found for "{query}"</p>
            </div>}
        </div>

        <div className="bg-slate-50 px-4 py-2 text-xs text-slate-400 flex justify-between border-t border-slate-100">
          <span>Press ESC to close</span>
          <span>Search powered by Kaduna High Court System</span>
        </div>
      </div>
    </div>;
}