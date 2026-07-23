import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('senfoire_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await API.get('/me');
                if (!cancelled) setUser(response.data);
            } catch (error) {
                console.error("Session expirée ou invalide");
                localStorage.removeItem('senfoire_token');
                try { await API.post('/logout'); } catch (_) {}
                if (!cancelled) setUser(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        checkLoggedIn();
        return () => { cancelled = true; };
    }, []);

    const login = async (identifiant, password) => {
        try {
            const response = await API.post('/login', { identifiant, password });

            if (response.data && response.data.access_token) {
                const { access_token, user } = response.data;

                localStorage.setItem('senfoire_token', access_token);
                setUser(user);
                return { success: true, role: user.role };
            }

            return { success: false, message: "Structure de réponse invalide." };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message
                    || (error.code === 'ECONNABORTED'
                        ? "Le serveur ne répond pas. Vérifiez que le backend est démarré."
                        : "Identifiants incorrects ou erreur serveur.")
            };
        }
    };

    const loginWithData = async (data) => {
        try {
            const response = await API.post('/login', {
                identifiant: data.email || data.telephone || data.pseudo,
                password: data.password,
            });

            if (response.data && response.data.access_token) {
                const { access_token, user } = response.data;
                localStorage.setItem('senfoire_token', access_token);
                setUser(user);
                return { success: true, role: user.role };
            }

            return { success: false, message: "Structure de réponse invalide." };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Identifiants incorrects ou erreur serveur."
            };
        }
    };

    const logout = async () => {
        try {
            await API.post('/logout');
        } catch (e) {
            // Ignorer l'erreur si le token est déjà expiré côté serveur
        }
        localStorage.removeItem('senfoire_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithData, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
