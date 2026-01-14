'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Availability {
    id?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const DEFAULT_AVAILABILITY: Availability[] = DAYS.map((_, index) => ({
    dayOfWeek: index,
    startTime: '09:00',
    endTime: '18:00',
    isActive: index >= 1 && index <= 5, // Mon-Fri active by default
}));

export default function DisponibilidadPage() {
    const { token } = useAuth();
    const [availability, setAvailability] = useState<Availability[]>(DEFAULT_AVAILABILITY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        async function fetchAvailability() {
            if (!token) return;

            try {
                const res = await fetch('/api/admin/availability', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.availability.length > 0) {
                        // Merge with defaults
                        const merged = DEFAULT_AVAILABILITY.map(def => {
                            const existing = data.availability.find((a: Availability) => a.dayOfWeek === def.dayOfWeek);
                            return existing || def;
                        });
                        setAvailability(merged);
                    }
                }
            } catch (error) {
                console.error('Error fetching availability:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchAvailability();
    }, [token]);

    const handleToggle = (dayOfWeek: number) => {
        setAvailability(prev => prev.map(a =>
            a.dayOfWeek === dayOfWeek ? { ...a, isActive: !a.isActive } : a
        ));
    };

    const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
        setAvailability(prev => prev.map(a =>
            a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ availability }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Disponibilidad guardada correctamente' });
            } else {
                const data = await res.json();
                throw new Error(data.error);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Error al guardar'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Disponibilidad</h1>
                <p className="text-gray-400 mt-1">
                    Configura los días y horarios en los que puedes recibir sesiones
                </p>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Schedule */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden">
                {availability.map((day, index) => (
                    <div
                        key={day.dayOfWeek}
                        className={`p-4 flex items-center gap-4 ${index !== availability.length - 1 ? 'border-b border-gray-700/50' : ''
                            }`}
                    >
                        {/* Toggle */}
                        <button
                            onClick={() => handleToggle(day.dayOfWeek)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${day.isActive ? 'bg-purple-600' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${day.isActive ? 'left-7' : 'left-1'
                                    }`}
                            />
                        </button>

                        {/* Day Name */}
                        <span className={`w-28 font-medium ${day.isActive ? 'text-white' : 'text-gray-500'}`}>
                            {DAYS[day.dayOfWeek]}
                        </span>

                        {/* Time Inputs */}
                        {day.isActive ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="time"
                                    value={day.startTime}
                                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <span className="text-gray-400">a</span>
                                <input
                                    type="time"
                                    value={day.endTime}
                                    onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        ) : (
                            <span className="text-gray-500 text-sm">No disponible</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>

            {/* Info */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-sm">
                    💡 <strong>Tip:</strong> Puedes bloquear días específicos (vacaciones, días festivos)
                    desde la sección de Calendario.
                </p>
            </div>
        </div>
    );
}
