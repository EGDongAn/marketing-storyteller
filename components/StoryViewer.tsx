import React, { useState } from 'react';
import { StoryPage } from '../types';
import { EditIcon, ChevronLeftIcon, ChevronRightIcon, RefreshIcon, DownloadIcon, SparklesIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from './icons';
import { getTranslator } from '../i18n';
import LoadingIndicator from './LoadingIndicator';

type Translator = ReturnType<typeof getTranslator>;

interface StoryViewerProps {
  pages: StoryPage[];
  onStartEdit: (page: StoryPage) => void;
  onReset: () => void;
  onDownload: () => void;
  onRegenerateWithNewStyle: (newStyle: string) => void;
  onSaveToCloud: () => void;
  isSaving: boolean;
  t: Translator;
}

const imageStyleOptions = [
    { name: 'Japanese Anime (90s)', value: '90s Japanese anime style, vibrant, cinematic, detailed background' },
    { name: 'Korean Webtoon', value: 'Korean webtoon art style, bold lines, dynamic, cel shading' },
    { name: 'Photorealistic', value: 'hyperrealistic, photorealistic, cinematic, 8k' },
    { name: 'Children\'s Book', value: 'charming children\'s book illustration, whimsical, soft colors' },
    { name: 'Claymation', value: 'charming claymation style, stop-motion look, detailed textures, plasticine' },
    { name: 'Pixel Art', value: '16-bit pixel art, vibrant color palette, retro video game style' },
];


const StoryViewer: React.FC<StoryViewerProps> = ({ pages, onStartEdit, onReset, onDownload, onRegenerateWithNewStyle, onSaveToCloud, isSaving, t }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showStyleModal, setShowStyleModal] = useState(false);
  
  const allImagesLoaded = pages.every(p => p.imageStatus === 'success');

  const goToPrevious = () => {
    setCurrentPageIndex(prev => (prev === 0 ? pages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentPageIndex(prev => (prev === pages.length - 1 ? 0 : prev + 1));
  };

  const handleStyleChange = (styleValue: string) => {
    onRegenerateWithNewStyle(styleValue);
    setShowStyleModal(false);
  };
  
  const currentPage = pages[currentPageIndex];
  
  const StyleChangeModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-2xl border border-[var(--border-color)] shadow-2xl p-6 relative animate-fade-in">
        <h2 className="text-2xl font-bold font-serif mb-4">{t('styleChangeModalTitle')}</h2>
        <p className="text-[var(--text-secondary)] mb-6">{t('styleChangeModalDescription')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {imageStyleOptions.map(style => (
            <button
              key={style.name}
              onClick={() => handleStyleChange(style.value)}
              className="p-3 rounded-lg text-sm font-semibold transition-all bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-white"
            >
              {style.name}
            </button>
          ))}
        </div>
        <button onClick={() => setShowStyleModal(false)} className="mt-6 w-full px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-full hover:bg-[var(--border-color)]">
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-2xl bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] shadow-2xl p-4 sm:p-6 overflow-hidden">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden group bg-[var(--bg-primary)] flex items-center justify-center">
            {currentPage.imageStatus === 'pending' && <LoadingIndicator message={t('imageLoading')} size="md" />}
            {currentPage.imageStatus === 'error' && (
                <div className="text-center text-red-400 p-4">
                    <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-semibold">{t('imageErrorTitle')}</p>
                    <p className="text-sm">{t('imageErrorBody')}</p>
                </div>
            )}
            {currentPage.imageStatus === 'success' && currentPage.imageUrl && (
                 <>
                    <img src={currentPage.imageUrl} alt={currentPage.imagePrompt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                        onClick={() => onStartEdit(currentPage)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-800 font-semibold rounded-full shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-white transition-all transform hover:scale-110"
                        >
                        <EditIcon className="w-5 h-5" />
                        <span>{t('editImage')}</span>
                        </button>
                    </div>
                </>
            )}
        </div>
        <p className="mt-6 text-[var(--text-secondary)] text-lg leading-relaxed text-center">
          {currentPage.text}
        </p>
      </div>

      <div className="flex items-center justify-between w-full max-w-2xl">
        <button
          onClick={goToPrevious}
          className="p-3 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Previous Page"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <span className="text-[var(--text-secondary)] font-medium" aria-live="polite">
          {t('pageIndicator', currentPageIndex + 1, pages.length)}
        </span>
        <button
          onClick={goToNext}
          className="p-3 bg-[var(--bg-tertiary)] rounded-full hover:bg-[var(--accent)] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-slate-900"
          aria-label="Next Page"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-full hover:bg-[var(--border-color)] transition-colors"
        >
          <RefreshIcon className="w-5 h-5"/>
          {t('startNewStory')}
        </button>
         <button
          onClick={() => setShowStyleModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-full hover:bg-[var(--border-color)] transition-colors"
        >
          <SparklesIcon className="w-5 h-5"/>
          {t('changeStyle')}
        </button>
         <button
          onClick={onSaveToCloud}
          disabled={isSaving || !allImagesLoaded}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-full hover:bg-[var(--border-color)] transition-colors disabled:opacity-50 disabled:cursor-wait"
        >
          <CloudArrowUpIcon className="w-5 h-5"/>
          {isSaving ? t('savingToCloud') : t('saveToCloud')}
        </button>
        <button
          onClick={onDownload}
          disabled={!allImagesLoaded}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadIcon className="w-5 h-5"/>
          {t('downloadStory')}
        </button>
      </div>
      {showStyleModal && <StyleChangeModal />}
    </div>
  );
};

export default StoryViewer;