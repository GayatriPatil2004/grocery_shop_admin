import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CustomDatePicker({ value, onChange, placeholder = 'Select Date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  }

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Helper to format date back to 'YYYY-MM-DD'
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const handleDayClick = (day, isCurrentMonth, offset = 0) => {
    let targetYear = year;
    let targetMonth = month + offset;
    if (targetMonth < 0) {
      targetMonth = 11;
      targetYear -= 1;
    } else if (targetMonth > 11) {
      targetMonth = 0;
      targetYear += 1;
    }
    const formatted = formatDateString(targetYear, targetMonth, day);
    onChange(formatted);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    const formatted = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const cells = [];
  // Trailing days from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({ day: prevDaysInMonth - i, current: false, offset: -1 });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true, offset: 0 });
  }
  // Leading days from next month
  const totalCells = 42; // 6 rows * 7 days
  const remaining = totalCells - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false, offset: 1 });
  }

  // Format date for display on button
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    if (isNaN(date.getTime())) return placeholder;
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
  };

  return (
    <div className="relative w-full sm:w-48" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1a1a3e] text-slate-700 dark:text-slate-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 transition-all flex items-center justify-between cursor-pointer"
      >
        <span className="truncate">{getDisplayValue()}</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          {value && (
            <X 
              className="w-4 h-4 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          <Calendar className="w-4 h-4" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-[#13132e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 w-72 animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-800 dark:text-white text-sm">
              {monthNames[month]} {year}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a3e] text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1a1a3e] text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const cellDateStr = formatDateString(
                year + (cell.offset !== 0 && month + cell.offset < 0 ? -1 : month + cell.offset > 11 ? 1 : 0),
                (month + cell.offset + 12) % 12,
                cell.day
              );
              const isSelected = value === cellDateStr;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.day, cell.current, cell.offset)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : cell.current
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500 dark:hover:text-orange-400'
                      : 'text-slate-300 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-[#1a1a3e]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-xs font-bold text-orange-500 hover:text-orange-600"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
