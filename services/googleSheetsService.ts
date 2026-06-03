
import type { AnalysisResult } from '../types';

export interface SheetConfig {
    spreadsheetId: string;
    spreadsheetUrl: string;
}

/**
 * Erstellt eine neue Google-Tabelle für Omas Analysen-Tagebuch
 */
export const createOmaSpreadsheet = async (accessToken: string): Promise<SheetConfig> => {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: 'Crazy Omas Narzissmus-Tagebuch 👵📝'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Konnte Tabelle nicht erstellen: ${errorText}`);
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;
    const spreadsheetUrl = data.spreadsheetUrl;

    // Header initialisieren
    await initializeSheetHeaders(accessToken, spreadsheetId);

    return { spreadsheetId, spreadsheetUrl };
};

/**
 * Hilfsfunktion, um lange Feldwerte zu kürzen, damit sie die Zellengrenzen von Google Sheets (max. 50.000 Zeichen) nicht sprengen.
 */
export const truncateCellValue = (value: string, maxLength = 32000): string => {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength) + '\n\n[... Von Oma gekürzt, da der Inhalt zu lang für eine Tabellenzelle war ...]';
};

/**
 * Konvertiert ein vollständiges Analyse-Ergebnis in strukturierte Spalten-Daten für Google Sheets.
 */
export const formatAnalysisForColumns = (result: AnalysisResult): (string | number)[] => {
    const formattedDate = new Date(result.timestamp).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 1. Erkannte Muster strukturiert aufbereiten
    const patternsText = result.erkannte_muster.map((m, idx) => {
        return `${idx + 1}. Taktik: ${m.muster_name}\nZitat: "${m.zitat}"\nErklärung: ${m.erklaerung}`;
    }).join('\n\n---\n\n');

    // 2. Gegenrede / Tipps strukturiert aufbereiten
    const counterText = result.gegenrede_tipps && result.gegenrede_tipps.length > 0
        ? result.gegenrede_tipps.map(t => `• "${t}"`).join('\n')
        : 'Keine Vorschläge';

    // 3. Omas Ratschläge und Tipps strukturiert aufbereiten
    const adviceTips = result.omas_ratschlag.tipps.map((t, idx) => {
        return `Tipp ${idx + 1}: ${t.titel}\n${t.text}`;
    }).join('\n\n');
    
    const fullAdviceText = `FAZIT:\n"${result.omas_ratschlag.fazit}"\n\nAKTIONSSCHRITTE:\n${adviceTips}`;

    // 4. Originaltext aufbereiten
    const originalTextTruncated = result.original_text || '[Kein Text - Bild/Screenshot analysiert]';

    return [
        formattedDate,                                                  // Spalte A: Datum
        result.narzissmus_score,                                        // Spalte B: Score (0-100)
        result.manipulations_index ?? 'kA',                             // Spalte C: Manipulations-Index (%)
        result.gaslighting_level || 'Keines',                           // Spalte D: Gaslighting-Stufe
        truncateCellValue(result.zusammenfassung, 5000),                // Spalte E: Omas Einschätzung
        result.oma_sprichwort || '',                                    // Spalte F: Omas norddeutsches Sprichwort
        truncateCellValue(patternsText, 15000),                        // Spalte G: Erkannte Taktiken / Muster
        truncateCellValue(counterText, 8000),                           // Spalte H: Vorgeschlagene Kontersätze / Gegenrede
        truncateCellValue(fullAdviceText, 15000),                      // Spalte I: Omas Ratschlag & Handlungsplan
        truncateCellValue(originalTextTruncated, 10000),                // Spalte J: Original-Text / Dialog
        result.id                                                       // Spalte K: Analyse-ID
    ];
};

/**
 * Initialisiert die Kopfzeile der Tabelle
 */
const initializeSheetHeaders = async (accessToken: string, spreadsheetId: string) => {
    const headers = [
        'Datum', 
        'Narzissmus-Score (0-100)', 
        'Manipulations-Index (%)', 
        'Gaslighting-Stufe', 
        'Omas Einschätzung', 
        'Omas norddeutsches Sprichwort', 
        'Erkannte Taktiken / Muster', 
        'Vorgeschlagene Kontersätze / Gegenrede',
        'Omas Ratschlag & Handlungsplan',
        'Original-Text / Dialog',
        'Analyse-ID'
    ];

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:K1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            range: 'Sheet1!A1:K1',
            majorDimension: 'ROWS',
            values: [headers]
        })
    });

    if (!response.ok) {
        console.error('Konnte Tabellen-Kopfzeile nicht initialisieren', await response.text());
    }

    // Formatierung (Zentrierung & Fett)
    await formatSheetHeader(accessToken, spreadsheetId, headers.length);
};

/**
 * Formatiert die Kopfzeile schön mit einer Hintergrundfarbe und fettgedrucktem Text
 */
const formatSheetHeader = async (accessToken: string, spreadsheetId: string, columnsCount = 11) => {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [
                {
                    repeatCell: {
                        range: {
                            sheetId: 0,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: columnsCount
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.94, green: 0.92, blue: 0.98 }, // Zartes Lila (Oma-Farbe)
                                textFormat: { bold: true, fontSize: 11, fontFamily: 'Arial' },
                                horizontalAlignment: 'CENTER'
                            }
                        },
                        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                    }
                }
            ]
        })
    });
};

/**
 * Fügt eine Analyse als neue Zeile zur Google-Tabelle hinzu
 */
export const appendAnalysisToSheet = async (accessToken: string, spreadsheetId: string, result: AnalysisResult): Promise<void> => {
    const row = formatAnalysisForColumns(result);

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            range: 'Sheet1!A2',
            majorDimension: 'ROWS',
            values: [row]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Fehler beim Schreiben der Zeile in Google Sheets: ${errorText}`);
    }
};
