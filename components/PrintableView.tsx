
import React from 'react';
import type { AnalysisResult } from '../types';

interface PrintableViewProps {
    result: AnalysisResult;
}

const PrintableView: React.FC<PrintableViewProps> = ({ result }) => {
    const { 
        zusammenfassung, 
        narzissmus_score, 
        manipulations_index, 
        gaslighting_level, 
        oma_sprichwort, 
        gegenrede_tipps, 
        erkannte_muster, 
        omas_ratschlag 
    } = result;

    // Gaslighting color
    const getGaslightingColor = (level?: string) => {
        const lower = level?.toLowerCase() || '';
        if (lower.includes('extrem')) return '#dc2626'; // rot
        if (lower.includes('hoch')) return '#ea580c'; // orange
        if (lower.includes('mittel')) return '#ca8a04'; // gelb-orange
        return '#059669'; // gruen
    };

    const getScoreColor = (score: number) => {
        if (score > 70) return '#ef4444';
        if (score > 40) return '#f97316';
        return '#22c55e';
    };

    return (
        <div style={{ fontFamily: "'Poppins', 'Helvetica', sans-serif", color: '#1f2937', padding: '2.5rem', backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ borderBottom: '3px solid #8b5cf6', paddingBottom: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', margin: 0, color: '#8b5cf6', fontWeight: 'bold' }}>
                        Crazy Oma's Psychologische Analyse
                    </h1>
                    <p style={{ margin: '0.4rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Detaillierte Auswertung von Gesprächs- und Verhaltensmustern
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                        ID: {result.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>
                        {new Date(result.timestamp).toLocaleDateString('de-DE')} • {new Date(result.timestamp).toLocaleTimeString('de-DE')}
                    </p>
                </div>
            </header>

            <main>
                {/* Score Sektion */}
                <section style={{ marginBottom: '2.5rem', backgroundColor: '#fdfbfe', border: '1px solid #f3e8ff', borderRadius: '12px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        
                        {/* Score Gauge */}
                        <div style={{ textAlign: 'center', flex: '0 0 170px', padding: '1rem', background: '#fff', border: '1px solid #e9d5ff', borderRadius: '10px' }}>
                            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: getScoreColor(narzissmus_score), lineHeight: '1' }}>
                                {narzissmus_score}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', tracking: '0.05em', color: '#4b5563', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                                Narzissmus-Score
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '8px', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
                                <div style={{ width: `${narzissmus_score}%`, backgroundColor: getScoreColor(narzissmus_score), height: '100%' }}></div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={{ flex: '1', minWidth: '280px' }}>
                            <h2 style={{ fontSize: '1.25rem', color: '#7c3aed', margin: '0 0 0.5rem 0', fontWeight: '600' }}>
                                Omas Gesamtbeurteilung
                            </h2>
                            <p style={{ margin: 0, fontStyle: 'italic', color: '#374151', fontSize: '1rem', lineHeight: '1.6', borderLeft: '4px solid #a78bfa', paddingLeft: '1.2rem' }}>
                                "{zusammenfassung}"
                            </p>
                        </div>
                    </div>
                </section>

                {/* Detektoren */}
                {(manipulations_index !== undefined || gaslighting_level || oma_sprichwort) && (
                    <section style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem', backgroundColor: '#fafbfd' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                🕵️‍♀️ Detektor-Werte
                            </h3>
                            
                            {manipulations_index !== undefined && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: '500' }}>Anteil Manipulation</span>
                                        <strong>{manipulations_index}%</strong>
                                    </div>
                                    <div style={{ width: '100%', backgroundColor: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${manipulations_index}%`, backgroundColor: '#ec4899', height: '100%' }}></div>
                                    </div>
                                </div>
                            )}

                            {gaslighting_level && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: '500' }}>Gaslighting-Gefahr</span>
                                    <span style={{ 
                                        backgroundColor: `${getGaslightingColor(gaslighting_level)}15`, 
                                        color: getGaslightingColor(gaslighting_level), 
                                        fontWeight: 'bold', 
                                        fontSize: '0.8rem', 
                                        padding: '0.2rem 0.6rem', 
                                        borderRadius: '4px' 
                                    }}>
                                        {gaslighting_level}
                                    </span>
                                </div>
                            )}
                        </div>

                        {oma_sprichwort && (
                            <div style={{ border: '1px solid #e9d5ff', borderRadius: '10px', padding: '1.2rem', backgroundColor: '#faf8ff' }}>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#8b5cf6', margin: '0 0 0.5rem 0' }}>
                                    👵 Omas Lebensweisheit
                                </h3>
                                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.95rem', color: '#5b21b6', lineHeight: '1.5' }}>
                                    "{oma_sprichwort}"
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* Tipps & Gegenrede */}
                {gegenrede_tipps && gegenrede_tipps.length > 0 && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', borderBottom: '2px solid #e9d5ff', paddingBottom: '0.4rem', marginBottom: '1rem', color: '#5b21b6' }}>
                            🛡️ Abgrenzung & Gegenrede ("Grey Rocking")
                        </h2>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                            Nutze diese Sätze, um manipulative Angriffe abzuwehren, ohne emotionale Reaktionen anzubieten. Bleibe sachlich wie ein Kieselstein:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            {gegenrede_tipps.map((sentence, idx) => (
                                <li key={idx} style={{ marginBottom: '0.6rem', paddingLeft: '0.2rem', borderLeft: '3px solid #ec4899', listStyleType: 'none', fontStyle: 'italic', fontWeight: '500' }}>
                                    "{sentence}"
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Erkannte Muster */}
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', borderBottom: '2px solid #e9d5ff', paddingBottom: '0.4rem', marginBottom: '1.2rem', color: '#5b21b6' }}>
                        Erkannte Taktiken & Muster
                    </h2>
                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                        {erkannte_muster.map((pattern, index) => (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem', backgroundColor: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#7c3aed', margin: 0 }}>
                                        {index + 1}. {pattern.muster_name}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: '#ec4899', background: '#fdf2f8', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>Taktik erkannt</span>
                                </div>
                                <blockquote style={{ margin: '0.6rem 0', paddingLeft: '1rem', borderLeft: '3px dashed #d1d5db', fontStyle: 'italic', color: '#4b5563', fontSize: '0.9rem', backgroundColor: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '0  6px 6px 0' }}>
                                    "{pattern.zitat}"
                                </blockquote>
                                <p style={{ margin: '0.6rem 0 0', fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>
                                    <strong style={{ color: '#1f2937' }}>Omas Deutung:</strong> {pattern.erklaerung}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Ratschlag */}
                <section style={{ marginBottom: '1.5rem', pageBreakBefore: 'auto' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', borderBottom: '2px solid #e9d5ff', paddingBottom: '0.4rem', marginBottom: '1rem', color: '#5b21b6' }}>
                        👵 Omas Ratschlag & Handlungsplan
                    </h2>
                    <div style={{ fontStyle: 'italic', color: '#1e1b4b', borderLeft: '4px solid #db2777', paddingLeft: '1.2rem', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6', backgroundColor: '#fdf2f8', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                        "{omas_ratschlag.fazit}"
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {omas_ratschlag.tipps.map((tip, index) => (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', backgroundColor: '#ffffff' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.4rem 0' }}>
                                    🚀 Tipp {index + 1}: {tip.titel}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: '#4b5563', lineHeight: '1.5' }}>
                                    {tip.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <footer style={{ marginTop: '4rem', paddingTop: '1.2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', lineHeight: '1.5' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: '#6b7280' }}>Generiert mit Crazy Oma - Analyse-Tool</p>
                <p style={{ margin: 0 }}>Dieses Dokument ist für den persönlichen Gebrauch bestimmt. Es ist keine medizinische oder psychotherapeutische Diagnose, sondern eine erfahrungsbasierte Einschätzung.</p>
            </footer>
        </div>
    );
};

export default PrintableView;

