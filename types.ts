
export interface NarcissisticPattern {
    muster_name: string;
    zitat: string;
    erklaerung: string;
}

export interface Advice {
    titel: string;
    text: string;
}

export interface SentimentPoint {
    label: string;
    score: number; // 0-100 (0=harmonisch, 100=hochtoxisch)
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface AnalysisResult {
    id: string;
    timestamp: number;
    zusammenfassung: string;
    narzissmus_score: number;
    manipulations_index?: number; // NEU: 0-100% Prozent
    gaslighting_level?: string;   // NEU: Gering, Mittel, Hoch, Extrem
    oma_sprichwort?: string;      // NEU: Ein passendes norddeutsches Sprichwort
    gegenrede_tipps?: string[];   // NEU: Konkrete Mustersätze zum Kontern
    erkannte_muster: NarcissisticPattern[];
    sentiment_flow: SentimentPoint[];
    omas_ratschlag: {
        fazit: string;
        tipps: Advice[];
    };
    original_text: string;
    image_url?: string;
    chat_history?: ChatMessage[];
}
