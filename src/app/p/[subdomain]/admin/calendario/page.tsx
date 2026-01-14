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

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CalendarioPage() {
    const { token } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            if (!token) return;

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            // Get range from start of this month to end of this month
            // Actually we might want a bit of padding for displayed days from prev/next months
            // For simplicity, just fetch the whole month range
            const start = new Date(year, month, 1).toISOString();
            const end = new Date(year, month + 1, 0).toISOString();

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

        // Days from previous month to fill the first row
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        const days = [];

        // Add prev month days
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({
                date: new Date(year, month - 1, daysInPrevMonth - startingDayOfWeek + i + 1),
                isCurrentMonth: false,
            });
        }

        // Add current month days
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Add next month days to complete the grid (usually 35 or 42 cells)
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const getEventsForDay = (date: Date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.toDateString() === date.toDateString();
        });
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Calendario</h1>
                    <p className="text-gray-400 mt-1">Agenda mensual de sesiones</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-white"
                    >
                        ←
                    </button>
                    <h2 className="text-xl font-semibold text-white capitalize w-48 text-center">
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-white"
                    >
                        →
                    </button>
                </div>
                <Link
                    href="disponibilidad"
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Configurar Horarios
                </Link>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 flex flex-col">
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
                                    {dayEvents.map(event => (
                                        <Link
                                            key={event.id}
                                            href={`sesiones/${event.id}`}
                                            className="block px-2 py-1 rounded text-xs font-medium truncate hover:opacity-80 transition-opacity"
                                            style={{
                                                backgroundColor: `${event.color}33`,
                                                color: event.color,
                                                borderLeft: `3px solid ${event.color}`
                                            }}
                                        >
                                            {event.start.split('T')[1].substring(0, 5)} {event.title}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
