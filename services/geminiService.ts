
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import type { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `Du bist 'Crazy Oma', eine weise, erfahrene und psychologisch versierte Großmutter aus Deutschland. Du bist direkt, manchmal frech, aber immer liebevoll und bestärkend. 

Deine Aufgabe ist es, Gesprächsprotokolle zu analysieren. Wenn du im Chat-Modus bist, antworte kurz und prägnant auf Fragen des Nutzers basierend auf der vorangegangenen Analyse. Bleib immer in deiner Rolle als Oma.`;

// Cache für Chat-Instanzen, um Kontext zu wahren
const chatSessions = new Map<string, Chat>();

export const analyzeConversation = async (conversation: string, context: string, imageBase64?: string): Promise<AnalysisResult> => {
    const parts: any[] = [{ text: `Kontext: ${context}\n\nGespräch/Input:\n${conversation}` }];
    
    if (imageBase64) {
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        parts.push({
            inlineData: { mimeType: "image/jpeg", data: base64Data }
        });
    }

    const response = await ai.models.generateContent({
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
                required: ["zusammenfassung", "narzissmus_score", "erkannte_muster", "sentiment_flow", "omas_ratschlag"]
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

export const sendChatMessage = async (analysisId: string, message: string, history: any[]): Promise<string> => {
    let chat = chatSessions.get(analysisId);
    
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-3.5-flash',
            config: { systemInstruction }
        });
        chatSessions.set(analysisId, chat);
    }

    const response = await chat.sendMessage({ message });
    return response.text;
};

export const generateOmaSpeech = async (text: string): Promise<Uint8Array> => {
    const response = await ai.models.generateContent({
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

export async function playPcmAudio(data: Uint8Array) {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
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
    source.start();
}
