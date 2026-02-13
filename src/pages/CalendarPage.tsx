import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { calendarApi, ApiError } from '../services/api';
import { useCases } from '../contexts/CasesContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Download,
  Plus,
  X,
  Search,
  Gavel,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';


interface Hearing {
  id: string;
  caseId: string;
  title: string;
  type: string;
  date: string;
  time: string;
  court: string;
  judge: string;
  color: string;
  priority?: string;
  status?: string;
  lawyer?: string;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const { cases } = useCases();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterCourt, setFilterCourt] = useState('');
  const [filterJudge, setFilterJudge] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ today: 0, thisWeek: 0 });

  // Fetch hearings from backend
  const fetchHearings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Calculate date range for current month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      
      const response = await calendarApi.getHearings({
        startDate,
        endDate,
        court: filterCourt || undefined,
      });
      
      if (response.success && response.data) {
        const formattedHearings: Hearing[] = (response.data as unknown[]).map((h: unknown) => {
          const hearing = h as Record<string, unknown>;
          return {

          id: (hearing.id as string) || `${hearing.caseId as string}-${hearing.date as string}`,
          caseId: hearing.caseId as string,
          title: hearing.title as string,
          type: hearing.type as string,
          date: hearing.date as string,
          time: (hearing.time as string) || '09:00',
          court: (hearing.court as string) || 'Unassigned',
          judge: (hearing.judge as string) || 'Unassigned',
          color: (hearing.color as string) || 'bg-slate-600',
          priority: hearing.priority as string | undefined,
          status: hearing.status as string | undefined,
          lawyer: hearing.lawyer as string | undefined
          };
        });

        setHearings(formattedHearings);
      } else {
        // Fallback to cases data if API fails
        const fallbackHearings = cases
          .filter(c => c.nextHearing && c.nextHearing !== 'TBD' && c.court)
          .map(c => ({
            id: `${c.id}-${c.nextHearing}`,
            caseId: c.id,
            title: c.title,
            type: c.type,
            date: c.nextHearing,
            time: '09:00',
            court: c.court || 'Unassigned',
            judge: c.judge || 'Unassigned',
            color: c.color,
            priority: c.priority,
            status: c.status
          }));
        setHearings(fallbackHearings);
      }

      // Fetch stats
      const statsResponse = await calendarApi.getCalendarStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as { today: number; thisWeek: number });
      }
    } catch (err) {
      console.error('Failed to fetch hearings:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load calendar data');
      // Fallback to cases data
      const fallbackHearings = cases
        .filter(c => c.nextHearing && c.nextHearing !== 'TBD' && c.court)
        .map(c => ({
          id: `${c.id}-${c.nextHearing}`,
          caseId: c.id,
          title: c.title,
          type: c.type,
          date: c.nextHearing,
          time: '09:00',
          court: c.court || 'Unassigned',
          judge: c.judge || 'Unassigned',
          color: c.color,
          priority: c.priority,
          status: c.status
        }));
      setHearings(fallbackHearings);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, filterCourt, cases]);

  // Fetch hearings when dependencies change
  useEffect(() => {
    fetchHearings();
  }, [fetchHearings]);


  // Filter hearings
  const filteredHearings = useMemo(() => {
    return hearings.filter(h => {
      const matchesCourt = !filterCourt || h.court === filterCourt;
      const matchesJudge = !filterJudge || h.judge === filterJudge;
      const matchesSearch = !searchQuery || 
        h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.caseId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourt && matchesJudge && matchesSearch;
    });
  }, [hearings, filterCourt, filterJudge, searchQuery]);

  // Get unique courts and judges for filters
  const courts = useMemo(() => [...new Set(cases.map(c => c.court).filter((c): c is string => Boolean(c)))], [cases]);
  const judges = useMemo(() => [...new Set(cases.map(c => c.judge).filter((j): j is string => Boolean(j)))], [cases]);



  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);

  // Get hearings for a specific date
  const getHearingsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredHearings.filter(h => {
      const hearingDate = new Date(h.date).toISOString().split('T')[0];
      return hearingDate === dateStr;
    });
  };

  // Handle date click
  const handleDateClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      const dayHearings = getHearingsForDate(date);
      if (dayHearings.length > 0) {
        setSelectedHearing(dayHearings[0]);
        setShowHearingModal(true);
      }
    }
  };

  // Handle hearing click
  const handleHearingClick = (hearing: Hearing) => {
    setSelectedHearing(hearing);
    setShowHearingModal(true);
  };

  // Export calendar to CSV
  const exportCalendar = () => {
    const csvContent = [
      ['Case ID', 'Title', 'Type', 'Date', 'Time', 'Court', 'Judge'].join(','),
      ...filteredHearings.map(h => [
        h.caseId,
        `"${h.title}"`,
        h.type,
        h.date,
        h.time,
        `"${h.court}"`,
        `"${h.judge}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hearings-calendar-${currentDate.toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (isLoading) {
    return (
      <Layout title="Calendar">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Hearings Calendar" showLogoBanner={false}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hearings Calendar</h1>
              <p className="text-sm text-slate-500">
                {filteredHearings.length} scheduled hearings • {stats.today} today • {stats.thisWeek} this week
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchHearings}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCalendar}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/cases')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Schedule Hearing
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-5 w-5" />
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchHearings} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}


        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filterCourt}
                onChange={(e) => setFilterCourt(e.target.value)}
                options={[
                  { value: '', label: 'All Courts' },
                  ...courts.map(c => ({ value: c, label: c }))
                ]}
                className="w-40"
              />
              <Select
                value={filterJudge}
                onChange={(e) => setFilterJudge(e.target.value)}
                options={[
                  { value: '', label: 'All Judges' },
                  ...judges.map(j => ({ value: j, label: j }))
                ]}
                className="w-48"
              />
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('month')}
                  className="text-xs"
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('week')}
                  className="text-xs"
                >
                  Week
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-slate-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <Card className="overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 bg-slate-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {days.map((date, index) => {
                const dayHearings = getHearingsForDate(date);
                const isToday = date && 
                  date.toDateString() === new Date().toDateString();
                const isSelected = date && selectedDate && 
                  date.toDateString() === selectedDate.toDateString();

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`
                      min-h-[100px] p-2 border-b border-r border-slate-100 cursor-pointer
                      transition-colors hover:bg-slate-50
                      ${!date ? 'bg-slate-50/50' : ''}
                      ${isToday ? 'bg-blue-50/50' : ''}
                      ${isSelected ? 'ring-2 ring-inset ring-indigo-500' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className={`
                          text-sm font-medium mb-1
                          ${isToday ? 'text-blue-600 bg-blue-100 w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}
                        `}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayHearings.slice(0, 3).map((hearing, hIndex) => (
                            <div
                              key={hIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHearingClick(hearing);
                              }}
                              className={`
                                text-[10px] p-1 rounded truncate cursor-pointer
                                hover:opacity-80 transition-opacity
                                ${hearing.color.replace('bg-', 'bg-opacity-20 text-').replace('600', '800')}
                                ${hearing.color.replace('bg-', 'bg-').replace('600', '100')}
                              `}
                            >
                              {hearing.time} - {hearing.title.substring(0, 20)}...
                            </div>
                          ))}
                          {dayHearings.length > 3 && (
                            <div className="text-[10px] text-slate-500 text-center">
                              +{dayHearings.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <Card className="p-4">
            <div className="space-y-4">
              {filteredHearings.slice(0, 20).map((hearing, index) => (
                <div
                  key={index}
                  onClick={() => handleHearingClick(hearing)}
                  className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className={`w-1 h-12 rounded-full ${hearing.color}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{hearing.title}</h4>
                      <Badge variant="secondary" className="text-[10px]">{hearing.type}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(hearing.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {hearing.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {hearing.court}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gavel className="h-3 w-3" />
                        {hearing.judge}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/cases/${encodeURIComponent(hearing.caseId)}`)}>
                    View Case
                  </Button>
                </div>
              ))}
              {filteredHearings.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No hearings scheduled for this period.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Upcoming Hearings Summary */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Upcoming Hearings (Next 7 Days)
          </h3>
          <div className="space-y-3">
            {filteredHearings
              .filter(h => {
                const hearingDate = new Date(h.date);
                const today = new Date();
                const diffTime = hearingDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
              })
              .slice(0, 5)
              .map((hearing, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${hearing.color}`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{hearing.title}</p>
                      <p className="text-sm text-slate-500">
                        {hearing.caseId} • {hearing.court}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">
                      {new Date(hearing.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-sm text-slate-500">{hearing.time}</p>
                  </div>
                </div>
              ))}
            {filteredHearings.filter(h => {
              const hearingDate = new Date(h.date);
              const today = new Date();
              const diffTime = hearingDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 7;
            }).length === 0 && (
              <p className="text-center text-slate-500 py-4">No upcoming hearings in the next 7 days.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Hearing Detail Modal */}
      {showHearingModal && selectedHearing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Hearing Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowHearingModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className={`h-2 rounded-full ${selectedHearing.color} mb-4`}></div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Case Title</label>
                <p className="font-semibold text-slate-900">{selectedHearing.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Case ID</label>
                  <p className="font-mono text-slate-900">{selectedHearing.caseId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Type</label>
                  <Badge variant="secondary">{selectedHearing.type}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Date</label>
                  <p className="text-slate-900">
                    {new Date(selectedHearing.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Time</label>
                  <p className="text-slate-900">{selectedHearing.time}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Court</label>
                <p className="text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {selectedHearing.court}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-500">Judge</label>
                <p className="text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  {selectedHearing.judge}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowHearingModal(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowHearingModal(false);
                  navigate(`/cases/${encodeURIComponent(selectedHearing.caseId)}`);
                }}
              >
                View Case
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
