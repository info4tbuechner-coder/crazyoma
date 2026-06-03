import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Modal from './ui/Modal';
import Button from './ui/Button';
import PrintableView from './PrintableView';
import type { AnalysisResult } from '../types';

interface PrintPreviewModalProps {
    result: AnalysisResult;
    onClose: () => void;
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ result, onClose }) => {
    const printRoot = document.getElementById('print-root');

    // This effect manages rendering the component into the hidden #print-root div for printing.
    useEffect(() => {
        if (!printRoot) return;

        const root = createRoot(printRoot);
        root.render(<PrintableView result={result} />);

        return () => {
            // Delay unmount to allow React to cleanup properly before the modal closes.
            setTimeout(() => root.unmount(), 500);
        };
    }, [result, printRoot]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Druckvorschau / Export" size="full">
            <div className="space-y-4">
                <div 
                    className="bg-white h-[70vh] overflow-y-auto p-4 rounded-md shadow-inner"
                >
                     {/* The iframe provides an isolated preview that won't be affected by the main page's styles */}
                    <iframe 
                        srcDoc={`
                            <html>
                                <head>
                                    <title>Print Preview</title>
                                    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins:wght@400;600&display=swap" rel="stylesheet">
                                    <style>
                                        @media print { body { -webkit-print-color-adjust: exact; } }
                                        body { margin: 0; }
                                    </style>
                                </head>
                                <body>
                                    <div id="iframe-print-root"></div>
                                </body>
                            </html>
                        `}
                        className="w-full h-full border-0"
                        title="Druckvorschau"
                        onLoad={(e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            const iframeDoc = iframe.contentDocument;
                            if (iframeDoc) {
                                const iframeRootEl = iframeDoc.getElementById('iframe-print-root');
                                if (iframeRootEl) {
                                    // Create a new root for the iframe's content.
                                    createRoot(iframeRootEl).render(<PrintableView result={result} />);
                                }
                            }
                        }}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Schließen</Button>
                    <Button onClick={handlePrint}>Drucken</Button>
                </div>
            </div>
            {/* The actual print content is hidden and prepared for the browser's print function */}
            <style>
                {`
                    @media print {
                        body > #root {
                            display: none !important;
                        }
                        #print-root {
                            display: block !important;
                        }
                    }
                `}
            </style>
        </Modal>
    );
};

export default PrintPreviewModal;
