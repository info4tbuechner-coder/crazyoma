import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isConfigured } from './services/firebase';

export interface AppUser {
    uid: string;
    email: string | null;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    loginWithEmailPassword: (email: string, password: string) => Promise<void>;
    signUpWithEmailPassword: (email: string, password: string) => Promise<void>;
    isConfigured: boolean;
    googleAccessToken: string | null;
    loginWithGoogle: () => Promise<void>;
    isGoogleLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => {},
    loginWithEmailPassword: async () => {},
    signUpWithEmailPassword: async () => {},
    isConfigured: false,
    googleAccessToken: null,
    loginWithGoogle: async () => {},
    isGoogleLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    useEffect(() => {
        if (!auth || !isConfigured) {
            // Emulate with localStorage for non-firebase setup
            const localSession = localStorage.getItem('crazy_oma_local_session');
            if (localSession) {
                try {
                    setUser(JSON.parse(localSession));
                } catch {
                    setUser(null);
                }
            }
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email
                });
            } else {
                setUser(null);
                setGoogleAccessToken(null); // Clear access token when user signs out
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithEmailPassword = async (email: string, password: string) => {
        if (auth && isConfigured) {
            const credential = await signInWithEmailAndPassword(auth, email, password);
            if (credential.user) {
                setUser({
                    uid: credential.user.uid,
                    email: credential.user.email
                });
            }
            return;
        }

        // Local storage auth emulator
        const usersStr = localStorage.getItem('crazy_oma_local_users') || '[]';
        let localUsers: any[] = [];
        try {
            localUsers = JSON.parse(usersStr);
        } catch {}

        const matchedUser = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (matchedUser && matchedUser.password === password) {
            const loggedInUser = { uid: matchedUser.uid, email: matchedUser.email };
            localStorage.setItem('crazy_oma_local_session', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } else if (password === 'crazyoma!!') {
            // Backward compatibility password check
            const defaultUser = { uid: 'local_default', email: email || 'enkel@oma.de' };
            localStorage.setItem('crazy_oma_local_session', JSON.stringify(defaultUser));
            setUser(defaultUser);
        } else {
            throw new Error('Ungültige Anmeldedaten. Ist das Passwort korrekt? (Nutze "crazyoma!!" oder registriere ein neues Konto)');
        }
    };

    const signUpWithEmailPassword = async (email: string, password: string) => {
        if (auth && isConfigured) {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (credential.user) {
                setUser({
                    uid: credential.user.uid,
                    email: credential.user.email
                });
            }
            return;
        }

        // Local storage signup emulator
        const usersStr = localStorage.getItem('crazy_oma_local_users') || '[]';
        let localUsers: any[] = [];
        try {
            localUsers = JSON.parse(usersStr);
        } catch {}

        const userExists = localUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
            throw new Error('E-Mail-Adresse wird bereits von einem anderen Konto verwendet.');
        }

        const newUser = {
            uid: 'local_' + Math.random().toString(36).substr(2, 9),
            email,
            password
        };

        localUsers.push(newUser);
        localStorage.setItem('crazy_oma_local_users', JSON.stringify(localUsers));

        const sessionUser = { uid: newUser.uid, email: newUser.email };
        localStorage.setItem('crazy_oma_local_session', JSON.stringify(sessionUser));
        setUser(sessionUser);
    };

    const loginWithGoogle = async () => {
        setIsGoogleLoading(true);
        try {
            if (auth && isConfigured) {
                const provider = new GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/spreadsheets');
                const result = await signInWithPopup(auth, provider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential?.accessToken) {
                    setGoogleAccessToken(credential.accessToken);
                }
                if (result.user) {
                    setUser({
                        uid: result.user.uid,
                        email: result.user.email
                    });
                }
                return;
            }

            // Simulator if not configured
            const mockToken = "mock_google_sheets_token_" + Math.random().toString(36).substring(7);
            setGoogleAccessToken(mockToken);
            const loggedInUser = { uid: 'local_google_user', email: 'enkel.sheets@gmail.com' };
            localStorage.setItem('crazy_oma_local_session', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
        } catch (err: any) {
            console.error("Google Sign-In failed:", err);
            throw err;
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const logout = async () => {
        if (auth && isConfigured) {
            await signOut(auth);
            setUser(null);
            setGoogleAccessToken(null);
            return;
        }

        localStorage.removeItem('crazy_oma_local_session');
        setUser(null);
        setGoogleAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            logout,
            loginWithEmailPassword,
            signUpWithEmailPassword,
            isConfigured,
            googleAccessToken,
            loginWithGoogle,
            isGoogleLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
