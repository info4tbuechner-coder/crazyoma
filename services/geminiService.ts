
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import type { AnalysisResult } from '../types';

let aiInstance: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = process.env.API_KEY || (process.env as any).GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Huch! Oma kann dich nicht hören – es ist kein 'GEMINI_API_KEY' konfiguriert. Bitte erstelle eine .env-Datei mit GEMINI_API_KEY oder trage ihn im Settings/Secrets-Menü ein!");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

const systemInstruction = `Du bist 'Crazy Oma', eine weise, erfahrene und psychologisch versierte Großmutter aus Deutschland. Du bist direkt, manchmal frech, aber immer liebevoll und bestärkend. 

Deine Aufgabe ist es, Gesprächsprotokolle oder Screenshots auf Narzissmus und Manipulation zu analysieren.
Wenn du die strukturierte Analyse durchführst, befülle die Felder bitte wie folgt:
- zusammenfassung: Eine treffende Einschätzung der Situation aus deiner Sicht als lebenserfahrene Oma.
- narzissmus_score: Ein Wert von 0 bis 100, der den Grad an egozentrischem, empathielosem oder toxischem Verhalten widerspiegelt.
- manipulations_index: Ein Wert von 0 bis 100, der misst, wie stark manipulative Taktiken (wie Schuldzuweisungen, emotionale Erpressung, Victim-Blaming) vorliegen.
- gaslighting_level: Die Stufe des Gaslighting ("Keines", "Gering", "Mittel", "Hoch", "Extrem"), wo versucht wird, dem Gegenüber die eigene Realität auszureden.
- oma_sprichwort: Ein altkluges, passendes deutsches Sprichwort (gerne norddeutsch/maritim oder traditionell), das die Situation humorvoll auf den Punkt bringt.
- gegenrede_tipps: Ein Array mit 2-4 konkreten kurzen Mustersätzen, die der Nutzer direkt als schlagfertige Antwort oder Abgrenzung schreiben/sagen kann (im Sinne der "Grey Rock"-Methode: höflich, neutral, unaufgeregt, keine Angriffsfläche bietend).
- omas_ratschlag.fazit: Dein klares Schlusswort als Oma.
- omas_ratschlag.tipps: Praktische Oma-Tipps zur Bewältigung der Situation.

Wenn du im Chat-Modus bist, antworte kurz und prägnant auf Fragen des Nutzers basierend auf der vorangegangenen Analyse. Bleib immer in deiner Rolle als Oma.`;

// Cache für Chat-Instanzen, um Kontext zu wahren
const chatSessions = new Map<string, Chat>();

export const analyzeConversation = async (conversation: string, context: string, imageBase64?: string): Promise<AnalysisResult> => {
    // Sorge dafür, dass übermäßig lange Texte Omas Augen (und die Token-Grenzen von Gemini) nicht überfordern
    const maxChars = 55000;
    let safeConversation = conversation || '';
    if (safeConversation.length > maxChars) {
        safeConversation = safeConversation.slice(0, maxChars) + "\n\n[... Oma-Hinweis: Das Gespräch wurde gekürzt, da es zu lang war! ...]";
    }

    let safeContext = context || '';
    if (safeContext.length > 5000) {
        safeContext = safeContext.slice(0, 5000) + "...";
    }

    const parts: any[] = [{ text: `Kontext: ${safeContext}\n\nGespräch/Input:\n${safeConversation}` }];
    
    if (imageBase64) {
        const base64Data = (imageBase64.split(',')[1] || imageBase64).trim();
        parts.push({
            inlineData: { mimeType: "image/jpeg", data: base64Data }
        });
    }

    const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
            systemInstruction: systemInstruction + "\nGib deine Antwort als JSON gemäß dem Schema aus.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    zusammenfassung: { type: Type.STRING },
                    narzissmus_score: { type: Type.NUMBER },
                    manipulations_index: { type: Type.NUMBER },
                    gaslighting_level: { type: Type.STRING },
                    oma_sprichwort: { type: Type.STRING },
                    gegenrede_tipps: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    erkannte_muster: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                muster_name: { type: Type.STRING },
                                zitat: { type: Type.STRING },
                                erklaerung: { type: Type.STRING }
                            },
                            required: ["muster_name", "zitat", "erklaerung"]
                        }
                    },
                    sentiment_flow: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                label: { type: Type.STRING },
                                score: { type: Type.NUMBER }
                            },
                            required: ["label", "score"]
                        }
                    },
                    omas_ratschlag: {
                        type: Type.OBJECT,
                        properties: {
                            fazit: { type: Type.STRING },
                            tipps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        titel: { type: Type.STRING },
                                        text: { type: Type.STRING }
                                    },
                                    required: ["titel", "text"]
                                }
                            }
                        },
                        required: ["fazit", "tipps"]
                    }
                },
                required: [
                    "zusammenfassung",
                    "narzissmus_score",
                    "manipulations_index",
                    "gaslighting_level",
                    "oma_sprichwort",
                    "gegenrede_tipps",
                    "erkannte_muster",
                    "sentiment_flow",
                    "omas_ratschlag"
                ]
            }
        }
    });

    const result = JSON.parse(response.text.trim());
    const analysisId = new Date().toISOString() + Math.random();

    return {
        ...result,
        id: analysisId,
        timestamp: Date.now(),
        original_text: conversation || "[Bild-Analyse]",
        image_url: imageBase64,
        chat_history: []
    };
};

export const sendChatMessage = async (analysisId: string, message: string, result?: AnalysisResult): Promise<string> => {
    let chat = chatSessions.get(analysisId);
    
    if (!chat) {
        let customizedInstruction = systemInstruction;
        if (result) {
            customizedInstruction = `${systemInstruction}

ZUSÄTZLICHER KONTEXT DER AKTUELLEN ANALYSE:
Der Nutzer hat folgende Konversation zur Analyse eingereicht:
"${result.original_text || '[Bild/Screenshot-Inhalt]'}"

Hier ist das Analyse-Ergebnis, das du bereits ermittelt hast:
- Zusammenfassung/Einschätzung: "${result.zusammenfassung}"
- Narzissmus-Score: ${result.narzissmus_score}/100
- Manipulations-Index: ${result.manipulations_index ?? 'unbekannt'}%
- Gaslighting-Gefahr: ${result.gaslighting_level ?? 'Keine'}
- Passendes norddeutsches Sprichwort: "${result.oma_sprichwort ?? ''}"
- Vorgeschlagene Gegenrede / Kontermustersätze: ${result.gegenrede_tipps?.map(t => `"${t}"`).join(', ') ?? 'Keine'}

Bitte beziehe dich direkt auf diesen analysierten Dialog und diese Daten, wenn der Nutzer dir Detailfragen stellt oder nach Rat bittet! Beantworte alle Fragen im gewohnten Oma-Ton: liebevoll, pragmatisch, lebenserfahren und norddeutsch-frech.`;
        }

        chat = getAi().chats.create({
            model: 'gemini-3.5-flash',
            config: { systemInstruction: customizedInstruction }
        });
        chatSessions.set(analysisId, chat);
    }

    const response = await chat.sendMessage({ message });
    return response.text;
};

export const generateOmaSpeech = async (text: string): Promise<Uint8Array> => {
    const response = await getAi().models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Sag mit der Stimme einer weisen, norddeutschen Oma: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' } // 'Kore' klingt etwas gesetzter/weiblicher
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Kein Audio generiert");
    
    return decodeBase64ToUint8(base64Audio);
};

// Hilfsfunktionen für Audio
function decodeBase64ToUint8(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

let activeAudioContext: AudioContext | null = null;
let activeAudioSource: AudioBufferSourceNode | null = null;

export async function stopCurrentSpeech() {
    if (activeAudioSource) {
        try {
            activeAudioSource.stop();
        } catch (e) {}
        activeAudioSource = null;
    }
    if (activeAudioContext) {
        try {
            await activeAudioContext.close();
        } catch (e) {}
        activeAudioContext = null;
    }
}

export function playPcmAudio(data: Uint8Array): Promise<void> {
    return new Promise(async (resolve) => {
        await stopCurrentSpeech();

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("AudioContext is not supported in this browser.");
            resolve();
            return;
        }

        const ctx = new AudioContextClass({ sampleRate: 24000 });
        activeAudioContext = ctx;

        // Safe creation of Int16Array using a sliced aligned buffer
        const alignedBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const dataInt16 = new Int16Array(alignedBuffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        
        for (let i = 0; i < dataInt16.length; i++) {
            channelData[i] = dataInt16[i] / 32768.0;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        activeAudioSource = source;

        source.onended = () => {
            if (activeAudioContext === ctx) {
                ctx.close().catch(() => {});
                activeAudioContext = null;
                activeAudioSource = null;
            }
            resolve();
        };

        source.start();
    });
}
