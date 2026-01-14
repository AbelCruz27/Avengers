'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Payment {
    id: string;
    amount: number;
    type: string;
    status: string;
    provider: string;
    createdAt: string;
    clientName: string;
    sessionName: string;
}

interface PaymentStats {
    totalRevenue: number;
    totalTransactions: number;
}

export default function PagosPage() {
    const { token } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<PaymentStats>({ totalRevenue: 0, totalTransactions: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        async function fetchPayments() {
            try {
                const res = await fetch('/api/admin/payments', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPayments(data.payments);
                    setStats(data.stats);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchPayments();
    }, [token]);

    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pagos e Ingresos</h1>
            <p className="text-gray-400 mb-8">Historial de transacciones y resumen financiero</p>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Ingresos Totales</p>
                            <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <span className="text-2xl">💳</span>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Transacciones</p>
                            <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white">Últimas Transacciones</h2>
                </div>

                {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50 text-left">
                                <tr>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300">Fecha</th>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300">Cliente</th>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300">Concepto</th>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300">Método</th>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300">Estado</th>
                                    <th className="px-6 py-3 text-sm font-medium text-gray-300 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-300">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                            <span className="text-gray-500 text-xs block">
                                                {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-white font-medium">{payment.clientName}</p>
                                            <p className="text-gray-500 text-xs">{payment.sessionName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {payment.type === 'DEPOSIT' ? 'Anticipo' : 'Pago Final'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 capitalize">
                                            {payment.provider}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                    payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {payment.status === 'COMPLETED' ? 'Completado' :
                                                    payment.status === 'PENDING' ? 'Pendiente' : 'Fallido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-medium">
                                                ${payment.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        No hay transacciones registradas aún.
                    </div>
                )}
            </div>
        </div>
    );
}
