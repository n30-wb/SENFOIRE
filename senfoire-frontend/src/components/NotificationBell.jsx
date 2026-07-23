import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const [notifRes, unreadRes] = await Promise.all([
                API.get('/notifications'),
                API.get('/notifications/unread-count'),
            ]);
            setNotifications(notifRes.data?.data || []);
            setUnreadCount(unreadRes.data?.count || 0);
        } catch { /* */ }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await API.post(`/notifications/${id}/lu`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* */ }
    };

    const markAllRead = async () => {
        try {
            await API.post('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
            setUnreadCount(0);
        } catch { /* */ }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-black text-sm text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] font-bold text-foire-primary hover:text-blue-900 cursor-pointer">
                                    Tout marquer lu
                                </button>
                            )}
                        </div>
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {notifications.slice(0, 20).map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => markAsRead(n.id)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!n.lu ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {!n.lu && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-relaxed ${!n.lu ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">
                                                    {new Date(n.created_at).toLocaleString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                <p className="text-3xl mb-2">🔔</p>
                                <p className="text-sm font-bold">Aucune notification</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
