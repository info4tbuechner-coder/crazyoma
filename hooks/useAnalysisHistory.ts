
import { useCallback, useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../AuthContext';
import type { AnalysisResult } from '../types';

const MAX_HISTORY_ITEMS = 50;

export const useAnalysisHistory = () => {
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setHistory([]);
                return;
            }
            if (!db) {
                // Read from localStorage when Firebase is not active
                const localHistory = localStorage.getItem(`crazy_oma_history_${user.uid}`);
                if (localHistory) {
                    try {
                        setHistory(JSON.parse(localHistory));
                    } catch {
                        setHistory([]);
                    }
                } else {
                    setHistory([]);
                }
                return;
            }
            try {
                const q = query(
                    collection(db, `users/${user.uid}/history`),
                    orderBy('timestamp', 'desc'),
                    limit(MAX_HISTORY_ITEMS)
                );
                const querySnapshot = await getDocs(q);
                const fetchedHistory: AnalysisResult[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedHistory.push(doc.data() as AnalysisResult);
                });
                setHistory(fetchedHistory);
            } catch (error) {
                console.error("Error fetching history from Firestore:", error);
            }
        };

        fetchHistory();
    }, [user]);

    const addAnalysis = useCallback(async (newAnalysis: AnalysisResult) => {
        if (!user) return;
        
        // Optimistic update
        setHistory(prevHistory => {
            const updatedHistory = [newAnalysis, ...prevHistory];
            if (updatedHistory.length > MAX_HISTORY_ITEMS) {
                return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
            }
            return updatedHistory;
        });

        if (!db) {
            // Store locally in offline mode
            const localHistoryKey = `crazy_oma_history_${user.uid}`;
            const localHistoryStr = localStorage.getItem(localHistoryKey) || '[]';
            let localList: AnalysisResult[] = [];
            try {
                localList = JSON.parse(localHistoryStr);
            } catch {}
            localList = [newAnalysis, ...localList].slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(localHistoryKey, JSON.stringify(localList));
            return;
        }

        try {
            await setDoc(doc(db, `users/${user.uid}/history`, newAnalysis.id), newAnalysis);
        } catch (error) {
            console.error("Error adding analysis:", error);
        }
    }, [user]);

    const removeAnalysis = useCallback(async (id: string) => {
        if (!user) return;

        // Optimistic update
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));

        if (!db) {
            // Remove locally in offline mode
            const localHistoryKey = `crazy_oma_history_${user.uid}`;
            const localHistoryStr = localStorage.getItem(localHistoryKey) || '[]';
            let localList: AnalysisResult[] = [];
            try {
                localList = JSON.parse(localHistoryStr);
            } catch {}
            localList = localList.filter(item => item.id !== id);
            localStorage.setItem(localHistoryKey, JSON.stringify(localList));
            return;
        }

        try {
            await deleteDoc(doc(db, `users/${user.uid}/history`, id));
        } catch (error) {
            console.error("Error removing analysis:", error);
        }
    }, [user]);

    const clearHistory = useCallback(async () => {
        if (!user) return;
        
        const currentHistory = [...history];
        setHistory([]);

        if (!db) {
            // Clear local history
            localStorage.removeItem(`crazy_oma_history_${user.uid}`);
            return;
        }

        try {
            const promises = currentHistory.map(item => 
                deleteDoc(doc(db, `users/${user.uid}/history`, item.id))
            );
            await Promise.all(promises);
        } catch (error) {
            console.error("Error clearing history:", error);
        }
    }, [user, history]);

    return { history, addAnalysis, removeAnalysis, clearHistory };
};
