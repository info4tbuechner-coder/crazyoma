
import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface PdfPreviewModalProps {
    file: File;
    onClose: () => void;
    onExtract: (text: string) => void;
}

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ file, onClose, onExtract }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [isExtracting, setIsExtracting] = useState(false);
    const canvasRef = useCallback((node: HTMLCanvasElement) => {
        if (node !== null) {
            renderPdf(node);
        }
    }, [file]);

    const renderPdf = async (canvas: HTMLCanvasElement) => {
        try {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                const typedarray = new Uint8Array(this.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                setNumPages(pdf.numPages);
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                        canvas: canvas
                    };
                    await page.render(renderContext).promise;
                }
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Failed to render PDF", error);
        }
    };

    const handleExtractText = async () => {
        setIsExtracting(true);
        try {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                const typedarray = new Uint8Array(this.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                    fullText += pageText + '\n';
                }
                onExtract(fullText.trim());
            };
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error("Failed to extract text from PDF", error);
            alert("Oma konnte den Text aus diesem PDF nicht lesen. Versuch es nochmal, Kindchen.");
            setIsExtracting(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="PDF Vorschau & Import" size="full">
            <div className="space-y-4">
                <p className="text-sm text-slate-400">Oma zeigt dir die erste Seite zur Vorschau. Wenn alles passt, klicke auf "Text importieren", um den gesamten Inhalt zu übernehmen ({numPages} Seiten).</p>
                <div className="bg-slate-800 p-4 rounded-lg overflow-auto max-h-[50vh]">
                    <canvas ref={canvasRef}></canvas>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose}>Abbrechen</Button>
                    <Button onClick={handleExtractText} isLoading={isExtracting}>
                        Text importieren
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PdfPreviewModal;
