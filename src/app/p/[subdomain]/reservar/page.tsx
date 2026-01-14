'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SessionType {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: string;
    depositPercent: number;
    color: string | null;
}

interface Photographer {
    id: string;
    businessName: string;
    primaryColor: string | null;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

interface BookingPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
    const searchParams = useSearchParams();
    const preselectedType = searchParams.get('tipo');

    const [subdomain, setSubdomain] = useState<string>('');
    const [photographer, setPhotographer] = useState<Photographer | null>(null);
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(preselectedType);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Get params
    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    // Fetch photographer and session types
    useEffect(() => {
        if (!subdomain) return;

        async function fetchData() {
            try {
                const res = await fetch(`/api/photographers/${subdomain}`);
                if (res.ok) {
                    const data = await res.json();
                    setPhotographer(data.photographer);
                    setSessionTypes(data.sessionTypes);
                    if (preselectedType) {
                        setSelectedType(preselectedType);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [subdomain, preselectedType]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (!selectedDate || !selectedType || !subdomain) return;

        const dateToFetch = selectedDate;

        async function fetchSlots() {
            setLoadingSlots(true);
            try {
                const dateStr = dateToFetch.toISOString().split('T')[0];
                const res = await fetch(
                    `/api/photographers/${subdomain}/availability?date=${dateStr}&sessionTypeId=${selectedType}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setAvailableSlots(data.slots);
                }
            } catch (error) {
                console.error('Error fetching slots:', error);
            } finally {
                setLoadingSlots(false);
            }
        }
        fetchSlots();
    }, [selectedDate, selectedType, subdomain]);

    const selectedSession = sessionTypes.find(s => s.id === selectedType);
    const primaryColor = photographer?.primaryColor || '#8B5CF6';

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        // Add empty slots for days before first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add all days in month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const isDateDisabled = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700/50 py-4 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href={`/p/${subdomain}`} className="text-white font-semibold hover:text-gray-300">
                        ← {photographer?.businessName}
                    </Link>
                    <h1 className="text-lg font-medium text-white">Reservar Sesión</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-8 px-6">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Left Column - Selection */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Step 1: Select Session Type */}
                        <section className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm">1</span>
                                Selecciona el tipo de sesión
                            </h2>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {sessionTypes.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => {
                                            setSelectedType(session.id);
                                            setSelectedTime(null);
                                        }}
                                        className={`p-4 rounded-xl text-left transition-all ${selectedType === session.id
                                            ? 'border-2 bg-purple-600/20'
                                            : 'border border-gray-600 hover:border-gray-500'
                                            }`}
                                        style={{
                                            borderColor: selectedType === session.id ? primaryColor : undefined,
                                        }}
                                    >
                                        <h3 className="font-semibold text-white">{session.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{session.duration} minutos</p>
                                        <p className="text-lg font-bold text-white mt-2">
                                            ${Number(session.price).toLocaleString()} MXN
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Step 2: Select Date */}
                        {selectedType && (
                            <section className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm">2</span>
                                    Selecciona la fecha
                                </h2>

                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        ←
                                    </button>
                                    <h3 className="text-white font-medium capitalize">
                                        {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button
                                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        →
                                    </button>
                                </div>

                                {/* Days of Week */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                        <div key={day} className="text-center text-gray-500 text-sm py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {getDaysInMonth(currentMonth).map((date, index) => (
                                        <div key={index} className="aspect-square">
                                            {date && (
                                                <button
                                                    onClick={() => {
                                                        if (!isDateDisabled(date)) {
                                                            setSelectedDate(date);
                                                            setSelectedTime(null);
                                                        }
                                                    }}
                                                    disabled={isDateDisabled(date)}
                                                    className={`w-full h-full rounded-lg flex items-center justify-center text-sm transition-all ${isDateDisabled(date)
                                                        ? 'text-gray-600 cursor-not-allowed'
                                                        : selectedDate?.toDateString() === date.toDateString()
                                                            ? 'text-white'
                                                            : 'text-gray-300 hover:bg-gray-700'
                                                        }`}
                                                    style={{
                                                        backgroundColor: selectedDate?.toDateString() === date.toDateString()
                                                            ? primaryColor
                                                            : undefined,
                                                    }}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Step 3: Select Time */}
                        {selectedDate && (
                            <section className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm">3</span>
                                    Selecciona la hora
                                </h2>

                                <p className="text-gray-400 mb-4">
                                    {formatDate(selectedDate)}
                                </p>

                                {loadingSlots ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                                    </div>
                                ) : availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                onClick={() => slot.available && setSelectedTime(slot.time)}
                                                disabled={!slot.available}
                                                className={`py-2 px-3 rounded-lg text-sm transition-all ${!slot.available
                                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed line-through'
                                                    : selectedTime === slot.time
                                                        ? 'text-white'
                                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                                    }`}
                                                style={{
                                                    backgroundColor: selectedTime === slot.time ? primaryColor : undefined,
                                                }}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-8">
                                        No hay horarios disponibles para esta fecha
                                    </p>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 sticky top-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Resumen</h3>

                            {selectedSession ? (
                                <>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Sesión</span>
                                            <span className="text-white">{selectedSession.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Duración</span>
                                            <span className="text-white">{selectedSession.duration} min</span>
                                        </div>
                                        {selectedDate && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Fecha</span>
                                                <span className="text-white">
                                                    {selectedDate.toLocaleDateString('es-MX')}
                                                </span>
                                            </div>
                                        )}
                                        {selectedTime && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Hora</span>
                                                <span className="text-white">{selectedTime}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-700 pt-4 mb-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-400">Total</span>
                                            <span className="text-xl font-bold text-white">
                                                ${Number(selectedSession.price).toLocaleString()} MXN
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Anticipo ({selectedSession.depositPercent}%)</span>
                                            <span className="text-white">
                                                ${(Number(selectedSession.price) * selectedSession.depositPercent / 100).toLocaleString()} MXN
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={selectedTime
                                            ? `/p/${subdomain}/checkout?tipo=${selectedType}&fecha=${selectedDate?.toISOString().split('T')[0]}&hora=${selectedTime}`
                                            : '#'
                                        }
                                        className={`block w-full py-3 text-center text-white font-semibold rounded-xl transition-all ${selectedTime
                                            ? 'hover:opacity-90'
                                            : 'opacity-50 cursor-not-allowed'
                                            }`}
                                        style={{ backgroundColor: primaryColor }}
                                        onClick={(e) => !selectedTime && e.preventDefault()}
                                    >
                                        Continuar al pago
                                    </Link>
                                </>
                            ) : (
                                <p className="text-gray-400 text-center py-8">
                                    Selecciona un tipo de sesión para ver el resumen
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
