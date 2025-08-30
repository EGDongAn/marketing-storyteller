import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { StoryPage, Bubble } from '../types';
import { MagicWandIcon, XMarkIcon, TrashIcon, AutoSelectIcon, UndoIcon, CheckIcon, PencilIcon, BubbleIcon } from './icons';
import LoadingIndicator from './LoadingIndicator';
import { editImageWithGemini, generateSubjectMask } from '../services/geminiService';
import { getTranslator } from '../i18n';

type Translator = ReturnType<typeof getTranslator>;

interface ImageEditorModalProps {
  page: StoryPage;
  onClose: () => void;
  onFinalSave: (finalImageUrl: string) => void;
  t: Translator;
}

type Tool = 'pen' | 'wand' | 'bubble';
type PenSize = 20 | 35 | 50;

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ page, onClose, onFinalSave, t }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [history, setHistory] = useState<string[]>([page.imageUrl]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleCanvasRef = useRef<HTMLCanvasElement>(null);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [penSize, setPenSize] = useState<PenSize>(35);
  
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const currentImage = history[currentHistoryIndex];
  const selectedBubble = bubbles.find(b => b.id === selectedBubbleId);

  const getMousePos = (canvas: HTMLCanvasElement, evt: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const touch = 'touches' in evt ? evt.touches[0] : evt;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const clearMask = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  const drawBubbles = useCallback(() => {
    const canvas = bubbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    bubbles.forEach(bubble => {
        ctx.fillStyle = bubble.backgroundColor;
        ctx.strokeStyle = bubble.borderColor;
        ctx.lineWidth = 2;

        ctx.beginPath();
        if (bubble.shape === 'rounded') {
            ctx.roundRect(bubble.x, bubble.y, bubble.width, bubble.height, 10);
        } else {
            ctx.ellipse(bubble.x + bubble.width / 2, bubble.y + bubble.height / 2, bubble.width / 2, bubble.height / 2, 0, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = bubble.textColor;
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = bubble.text.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line, bubble.x + bubble.width / 2, bubble.y + bubble.height / 2 - (lines.length - 1) * 8 + index * 16);
        });
    });
  }, [bubbles]);

  const drawImageOnCanvas = useCallback((imageUrl: string) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        if(drawingCanvasRef.current) {
          drawingCanvasRef.current.width = parent.clientWidth;
          drawingCanvasRef.current.height = parent.clientHeight;
        }
        if(bubbleCanvasRef.current) {
          bubbleCanvasRef.current.width = parent.clientWidth;
          bubbleCanvasRef.current.height = parent.clientHeight;
        }
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawBubbles();
      clearMask();
    };
    img.src = imageUrl;
  }, [drawBubbles, clearMask]);
  
  useEffect(() => {
    drawImageOnCanvas(currentImage);
  }, [currentImage, drawImageOnCanvas]);

  useEffect(() => {
    drawBubbles();
  }, [bubbles, drawBubbles]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'pen') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(canvas, e);
    if (!ctx || !pos) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "rgba(255, 0, 255, 0.7)";
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [activeTool, penSize]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || activeTool !== 'pen') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getMousePos(canvas, e);
    if (!ctx || !pos) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, activeTool]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
    setHasDrawn(true);
  }, [isDrawing]);

  const handleMagicWandClick = async () => {
    clearMask();
    setIsApplyingEdit(true);
    setLoadingText(t('loadingWand'));
    setEditError(null);
    try {
        const { imageUrl: maskUrl } = await generateSubjectMask(currentImage, page.mimeType);
        const maskImage = new Image();
        maskImage.crossOrigin = "anonymous";
        maskImage.src = maskUrl;
        maskImage.onload = () => {
            const canvas = drawingCanvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
            setHasDrawn(true);
        };
    } catch (err) {
        setEditError(err instanceof Error ? err.message : 'Failed to generate mask.');
    } finally {
        setIsApplyingEdit(false);
    }
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsApplyingEdit(true);
    setLoadingText(t('loadingEdit'));
    setEditError(null);
    try {
        const maskDataUrl = hasDrawn ? drawingCanvasRef.current?.toDataURL('image/png') : undefined;
        const { imageUrl: newImageUrl } = await editImageWithGemini(currentImage, page.mimeType, editPrompt, maskDataUrl);
        const newHistory = history.slice(0, currentHistoryIndex + 1);
        newHistory.push(newImageUrl);
        setHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
        clearMask();
        setEditPrompt('');
    } catch (err) {
        setEditError(err instanceof Error ? err.message : 'Failed to apply edit.');
    } finally {
        setIsApplyingEdit(false);
    }
  };

  const handleAddBubble = () => {
    const newBubble: Bubble = {
        id: `bubble-${Date.now()}`,
        text: 'Hello!',
        x: 50, y: 50,
        width: 120, height: 60,
        shape: 'rounded',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderColor: '#000000'
    };
    setBubbles([...bubbles, newBubble]);
    setSelectedBubbleId(newBubble.id);
    setActiveTool('bubble');
  };
  
  const updateSelectedBubble = (props: Partial<Bubble>) => {
    if (!selectedBubbleId) return;
    setBubbles(bubbles.map(b => b.id === selectedBubbleId ? { ...b, ...props } : b));
  };


  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };
  
  const handleSaveAndClose = () => {
    const finalCanvas = document.createElement('canvas');
    const imageCanvas = imageCanvasRef.current;
    const bubblesCanvas = bubbleCanvasRef.current;

    if (!imageCanvas || !bubblesCanvas) return;

    finalCanvas.width = imageCanvas.width;
    finalCanvas.height = imageCanvas.height;
    
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the base image
    ctx.drawImage(imageCanvas, 0, 0);
    // Draw the speech bubbles on top
    ctx.drawImage(bubblesCanvas, 0, 0);

    const finalImageUrl = finalCanvas.toDataURL('image/png');
    onFinalSave(finalImageUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-secondary)] w-full max-w-4xl rounded-2xl border border-[var(--border-color)] shadow-2xl p-6 relative animate-fade-in flex flex-col md:flex-row gap-6">
        {/* Left: Canvas and Tools */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
            <div 
              className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-[var(--bg-primary)]"
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            >
                <canvas ref={imageCanvasRef} className="absolute inset-0 w-full h-full" />
                <canvas ref={drawingCanvasRef} className="absolute inset-0 w-full h-full opacity-70" />
                <canvas ref={bubbleCanvasRef} className="absolute inset-0 w-full h-full" />
                 {isApplyingEdit && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <LoadingIndicator message={loadingText} size="md" />
                    </div>
                )}
            </div>
             <div className="bg-[var(--bg-primary)] p-2 rounded-lg flex justify-between items-center">
                <div className="flex gap-1">
                    <button onClick={() => setActiveTool('pen')} className={`p-2 rounded-md ${activeTool === 'pen' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-tertiary)]'}`} title={t('pen')}><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={handleMagicWandClick} className={`p-2 rounded-md hover:bg-[var(--bg-tertiary)]`} title={t('aiSelect')}><AutoSelectIcon className="w-5 h-5"/></button>
                    <button onClick={handleAddBubble} className={`p-2 rounded-md ${activeTool === 'bubble' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-tertiary)]'}`} title={t('addBubble')}><BubbleIcon className="w-5 h-5"/></button>
                </div>

                {activeTool === 'pen' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPenSize(20)} className={`w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center ${penSize === 20 ? 'ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg-primary)]' : ''}`}><div className="w-2 h-2 bg-slate-800 rounded-full"></div></button>
                    <button onClick={() => setPenSize(35)} className={`w-7 h-7 rounded-full bg-slate-400 flex items-center justify-center ${penSize === 35 ? 'ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg-primary)]' : ''}`}><div className="w-3 h-3 bg-slate-800 rounded-full"></div></button>
                    <button onClick={() => setPenSize(50)} className={`w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center ${penSize === 50 ? 'ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--bg-primary)]' : ''}`}><div className="w-4 h-4 bg-slate-800 rounded-full"></div></button>
                  </div>
                )}

                <div className="flex gap-1">
                     <button onClick={clearMask} disabled={isApplyingEdit || !hasDrawn} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] disabled:opacity-50" title={t('clearMask')}><TrashIcon className="w-5 h-5"/></button>
                    <button onClick={handleUndo} disabled={isApplyingEdit || currentHistoryIndex === 0} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] disabled:opacity-50" title={t('undo')}><UndoIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-1/3 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold font-serif">{t('editIllustration')}</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--bg-tertiary)]"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-grow flex flex-col gap-4">
               <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder={t('editPlaceholder')}
                className="w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg"
                disabled={isApplyingEdit}
                rows={3}
              />
              <button
                    onClick={handleApplyEdit}
                    disabled={isApplyingEdit || !editPrompt.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] disabled:bg-slate-600"
                >
                    <MagicWandIcon className="w-5 h-5" />
                    <span>{t('applyAiEdit')}</span>
                </button>
              {editError && <p className="text-sm text-red-400">{editError}</p>}
            </div>

            {selectedBubble && (
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3">
                    <h3 className="text-lg font-semibold font-serif">{t('bubbleEditorTitle')}</h3>
                    <textarea value={selectedBubble.text} onChange={e => updateSelectedBubble({ text: e.target.value })} className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" rows={2}/>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <label className="flex items-center gap-2">{t('bubbleFill')} <input type="color" value={selectedBubble.backgroundColor} onChange={e => updateSelectedBubble({ backgroundColor: e.target.value })} className="w-full h-8 bg-transparent"/></label>
                        <label className="flex items-center gap-2">{t('bubbleText')} <input type="color" value={selectedBubble.textColor} onChange={e => updateSelectedBubble({ textColor: e.target.value })} className="w-full h-8 bg-transparent"/></label>
                        <label className="flex items-center gap-2">{t('bubbleBorder')} <input type="color" value={selectedBubble.borderColor} onChange={e => updateSelectedBubble({ borderColor: e.target.value })} className="w-full h-8 bg-transparent"/></label>
                         <button onClick={() => setBubbles(bubbles.filter(b => b.id !== selectedBubbleId))} className="bg-red-600/50 text-red-200 rounded-md p-1">{t('bubbleDelete')}</button>
                    </div>
                </div>
            )}
            <div className="flex flex-col gap-3 mt-auto pt-4">
                <div className="flex gap-3">
                    <button onClick={onClose} disabled={isApplyingEdit} className="w-full px-5 py-2.5 bg-[var(--bg-tertiary)] font-semibold rounded-full hover:bg-[var(--border-color)]">{t('cancel')}</button>
                     <button onClick={handleSaveAndClose} disabled={isApplyingEdit} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700">
                        <CheckIcon className="w-5 h-5" />
                        {t('saveAndClose')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;