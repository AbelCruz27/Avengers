'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    status: string;
    color: string;
}

interface CalendarioPageProps {
    params: Promise<{ subdomain: string }>;
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarioPage({ params }: CalendarioPageProps) {
    const { token } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        async function fetchEvents() {
            if (!token) return;

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = new Date(year, month - 1, 1).toISOString();
            const end = new Date(year, month + 2, 0).toISOString();

            try {
                const res = await fetch(`/api/admin/calendar?start=${start}&end=${end}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, [token, currentDate]);

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({
                date: new Date(year, month - 1, daysInPrevMonth - startingDayOfWeek + i + 1),
                isCurrentMonth: false,
            });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    };

    const getHoursOfDay = () => {
        return Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const changeWeek = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (delta * 7));
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getEventsForHour = (date: Date, hour: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            const eventHour = parseInt(event.start.split('T')[1].split(':')[0]);
            return eventDate.toDateString() === date.toDateString() && eventHour === hour;
        });
    };

    const formatEventTime = (start: string) => {
        return start.split('T')[1].substring(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Calendario</h1>
                    <p className="text-gray-400 mt-1">Tu agenda de sesiones</p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === mode
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {mode === 'month' ? 'Mes' : mode === 'week' ? 'Semana' : 'Día'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={goToToday}
                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={() => viewMode === 'month' ? changeMonth(-1) : changeWeek(-1)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-white"
                    >
                        ←
                    </button>
                    <h2 className="text-lg font-semibold text-white capitalize w-48 text-center">
                        {viewMode === 'day'
                            ? currentDate.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })
                            : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        }
                    </h2>
                    <button
                        onClick={() => viewMode === 'month' ? changeMonth(1) : changeWeek(1)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-white"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden flex flex-col">

                {viewMode === 'month' && (
                    <>
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 border-b border-gray-700/50">
                            {WEEKDAYS.map(day => (
                                <div key={day} className="py-3 text-center text-gray-400 font-medium text-sm">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                            {getDaysInMonth().map((dayObj, index) => {
                                const dayEvents = getEventsForDay(dayObj.date);
                                const isToday = dayObj.date.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[100px] border-b border-r border-gray-700/30 p-2 transition-colors ${!dayObj.isCurrentMonth ? 'bg-gray-900/40 text-gray-600' : 'text-gray-300 hover:bg-gray-700/20'
                                            } ${isToday ? 'bg-purple-900/10' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-purple-600 text-white' : ''
                                                }`}>
                                                {dayObj.date.getDate()}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map(event => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className="block w-full text-left px-2 py-1 rounded text-xs font-medium truncate hover:opacity-80 transition-opacity"
                                                    style={{
                                                        backgroundColor: `${event.color}33`,
                                                        color: event.color,
                                                        borderLeft: `3px solid ${event.color}`
                                                    }}
                                                >
                                                    {formatEventTime(event.start)} {event.title.split(' - ')[0]}
                                                </button>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <p className="text-xs text-gray-500 px-2">+{dayEvents.length - 3} más</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {viewMode === 'week' && (
                    <div className="flex-1 flex flex-col">
                        {/* Week Header */}
                        <div className="grid grid-cols-8 border-b border-gray-700/50">
                            <div className="py-3 text-center text-gray-500 text-sm">Hora</div>
                            {getWeekDays().map((date, i) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                return (
                                    <div key={i} className={`py-3 text-center ${isToday ? 'bg-purple-900/20' : ''}`}>
                                        <p className="text-gray-400 text-xs">{WEEKDAYS[i]}</p>
                                        <p className={`text-lg font-medium ${isToday ? 'text-purple-400' : 'text-white'}`}>
                                            {date.getDate()}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Time Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {getHoursOfDay().map(hour => (
                                <div key={hour} className="grid grid-cols-8 border-b border-gray-700/30 min-h-[60px]">
                                    <div className="p-2 text-gray-500 text-xs text-right pr-3 border-r border-gray-700/30">
                                        {hour}:00
                                    </div>
                                    {getWeekDays().map((date, i) => {
                                        const hourEvents = getEventsForHour(date, hour);
                                        return (
                                            <div key={i} className="p-1 border-r border-gray-700/30 relative">
                                                {hourEvents.map(event => (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => setSelectedEvent(event)}
                                                        className="absolute inset-x-1 px-2 py-1 rounded text-xs font-medium truncate"
                                                        style={{
                                                            backgroundColor: `${event.color}33`,
                                                            color: event.color,
                                                            borderLeft: `3px solid ${event.color}`
                                                        }}
                                                    >
                                                        {event.title}
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewMode === 'day' && (
                    <div className="flex-1 overflow-y-auto">
                        {getHoursOfDay().map(hour => {
                            const hourEvents = getEventsForHour(currentDate, hour);
                            return (
                                <div key={hour} className="flex border-b border-gray-700/30 min-h-[80px]">
                                    <div className="w-20 p-3 text-gray-500 text-sm text-right border-r border-gray-700/30 flex-shrink-0">
                                        {hour}:00
                                    </div>
                                    <div className="flex-1 p-2 relative">
                                        {hourEvents.map(event => (
                                            <button
                                                key={event.id}
                                                onClick={() => setSelectedEvent(event)}
                                                className="w-full text-left p-3 rounded-lg mb-1"
                                                style={{
                                                    backgroundColor: `${event.color}22`,
                                                    borderLeft: `4px solid ${event.color}`
                                                }}
                                            >
                                                <p className="font-medium text-white">{event.title}</p>
                                                <p className="text-sm text-gray-400">
                                                    {formatEventTime(event.start)} - {event.end.split('T')[1].substring(0, 5)}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: selectedEvent.color }}
                            />
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                        <p className="text-gray-400 mb-4">
                            {new Date(selectedEvent.start).toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                            <br />
                            {formatEventTime(selectedEvent.start)} - {selectedEvent.end.split('T')[1].substring(0, 5)}
                        </p>
                        <Link
                            href={`/p/${subdomain}/admin/sesiones/${selectedEvent.id}`}
                            className="block w-full py-3 bg-purple-600 text-white text-center font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Ver Detalles de Sesión
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
