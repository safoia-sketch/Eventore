import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const data = await authApi.getCurrentUser();
            setUser(data.user);
        } catch (error) {
            // A 401 response simply means there is no active session.
            if (error.status === 401) {
                setUser(null);
                return;
            }

            console.error(
                "Unable to retrieve current user:",
                error
            );

            setUser(null);
        }
    }, []);

    useEffect(() => {
        const loadCurrentUser = async () => {
            setLoading(true);
            await refreshUser();
            setLoading(false);
        };

        loadCurrentUser();
    }, [refreshUser]);

    const register = async (formData) => {
        return authApi.register(formData);
    };

    const login = async (formData) => {
        const data = await authApi.login(formData);

        setUser(data.user);

        return data;
    };

    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider."
        );
    }

    return context;
};