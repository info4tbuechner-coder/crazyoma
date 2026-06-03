
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
    return (
        <div style={{ fontFamily: "'Poppins', sans-serif", color: '#1f2937', padding: '2rem' }}>
            <header style={{ borderBottom: '2px solid #ddd', paddingBottom: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', margin: 0, color: '#8b5cf6' }}>
                    Crazy Oma's Analyse
                </h1>
                <p style={{ margin: '0.5rem 0 0', color: '#6b7280' }}>
                    Analyse vom: {new Date(result.timestamp).toLocaleString('de-DE')}
                </p>
            </header>

            <main>
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Zusammenfassung & Score
                    </h2>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontStyle: 'italic', color: '#4b5563', borderLeft: '3px solid #f472b6', paddingLeft: '1rem' }}>
                                "{zusammenfassung}"
                             </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: narzissmus_score > 60 ? '#ef4444' : (narzissmus_score > 30 ? '#f97316' : '#22c55e') }}>
                                {narzissmus_score}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', textTransform: 'uppercase' }}>Narzissmus-Score</div>
                        </div>
                    </div>
                </section>

                {(manipulations_index !== undefined || gaslighting_level || oma_sprichwort) && (
                    <section style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9fafb' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>🕵️‍♀️ Omas Detektor-Werte</h3>
                            {manipulations_index !== undefined && (
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <strong>Manipulations-Index:</strong> {manipulations_index}%
                                </p>
                            )}
                            {gaslighting_level && (
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
                                    <strong>Gaslighting-Gefahr:</strong> {gaslighting_level}
                                </p>
                            )}
                        </div>
                        {oma_sprichwort && (
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#8b5cf6', margin: '0 0 0.5rem 0' }}>👵 Omas Weisheit</h3>
                                <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.9rem', color: '#4b5563' }}>
                                    "{oma_sprichwort}"
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {gegenrede_tipps && gegenrede_tipps.length > 0 && (
                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                            🛡️ Abgrenzung & Gegenrede
                        </h2>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            {gegenrede_tipps.map((sentence, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                    "{sentence}"
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Erkannte Muster
                    </h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {erkannte_muster.map((pattern, index) => (
                            <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', backgroundColor: '#f9fafb' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#8b5cf6', margin: 0 }}>
                                    {pattern.muster_name}
                                </h3>
                                <blockquote style={{ margin: '0.5rem 0', paddingLeft: '1rem', borderLeft: '3px solid #d1d5db', fontStyle: 'italic', color: '#4b5563' }}>
                                    "{pattern.zitat}"
                                </blockquote>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#374151' }}>
                                    <strong style={{ color: '#1f2937' }}>Omas Deutung:</strong> {pattern.erklaerung}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                        Omas Ratschlag
                    </h2>
                     <p style={{ fontStyle: 'italic', color: '#4b5563', borderLeft: '3px solid #f472b6', paddingLeft: '1rem', marginBottom: '1.5rem' }}>
                        {omas_ratschlag.fazit}
                    </p>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {omas_ratschlag.tipps.map((tip, index) => (
                             <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                                 <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                                    {tip.titel}
                                </h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#374151' }}>
                                    {tip.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

             <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                <p>Generiert mit Crazy Oma - Analyse-Tool</p>
                <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>Dies ist keine psychologische Diagnose, sondern eine auf KI und Lebenserfahrung basierende Einschätzung.</p>
            </footer>
        </div>
    );
};

export default PrintableView;
