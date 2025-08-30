import React, { useState, useCallback, useEffect } from 'react';
import { StoryPage, StoryPageData } from './types';
import { generateStoryPages, generateImageForPage } from './services/geminiService';
import { getTranslator, Language, Theme, themes } from './i18n';
import StoryInputForm from './components/StoryInputForm';
import StoryViewer from './components/StoryViewer';
import ImageEditorModal from './components/ImageEditorModal';
import LoadingIndicator from './components/LoadingIndicator';
import { LogoIcon, DownloadIcon, CogIcon, XMarkIcon, CheckIcon as CheckCircleIcon } from './components/icons';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

const App: React.FC = () => {
  const [storyConfig, setStoryConfig] = useState<{prompt: string | object, pageCount: number} | null>(null);
  const [storyPages, setStoryPages] = useState<StoryPage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [editingPage, setEditingPage] = useState<StoryPage | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  
  const t = getTranslator(language);

  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.classList.remove('dark', 'light', 'synthwave');
    root.classList.add(theme);
  }, [theme, language]);

  const generateImagesSequentially = async (pagesData: StoryPageData[]) => {
    for (const [index, pageData] of pagesData.entries()) {
      try {
        const { imageUrl, mimeType } = await generateImageForPage(pageData.imagePrompt);
        setStoryPages(prev => prev.map(p => 
          p.id === `page-${index}` ? { ...p, imageUrl, mimeType, imageStatus: 'success' } : p
        ));
      } catch (err) {
        console.error(`Failed to generate image for page ${index}:`, err);
        setStoryPages(prev => prev.map(p => 
          p.id === `page-${index}` ? { ...p, imageStatus: 'error' } : p
        ));
      }
    }
  };

  const handleGenerateStory = useCallback(async (finalPrompt: string | object, pageCount: number) => {
    if (typeof finalPrompt === 'string' && !finalPrompt.trim()) {
      setError(t('errorPromptEmpty'));
      return;
    }
    
    setStoryConfig({ prompt: finalPrompt, pageCount });
    setIsLoading(true);
    setError(null);
    setStoryPages([]);

    try {
      setLoadingMessage(t('loadingStructure'));
      const pagesData: StoryPageData[] = await generateStoryPages(finalPrompt);

      const initialPages: StoryPage[] = pagesData.map((page, index) => ({
        ...page,
        id: `page-${index}`,
        imageStatus: 'pending',
      }));

      setStoryPages(initialPages);
      setIsLoading(false); // Stop main loading indicator
      setLoadingMessage('');

      // Sequentially generate images in the background
      generateImagesSequentially(pagesData);

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t('errorUnknown');
       if (message.includes('limit reached')) {
        setError(t('errorRateLimit'));
      } else {
        setError(message);
      }
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [t]);

  const handleRegenerateWithNewStyle = useCallback((newStylePromptPart: string) => {
    if (!storyConfig) return;

    let originalPrompt = '';
    
    if (typeof storyConfig.prompt === 'object' && storyConfig.prompt !== null && 'parts' in storyConfig.prompt) {
        const textPart = (storyConfig.prompt.parts as any[]).find(p => p.text);
        if (textPart) {
            originalPrompt = textPart.text;
        }
    } else if (typeof storyConfig.prompt === 'string') {
        originalPrompt = storyConfig.prompt;
    }

    if (!originalPrompt) {
        setError("Could not extract the original story prompt to regenerate.");
        return;
    }

    const styleRegex = /The overall visual style for the illustrations is '.*?'/g;
    let updatedPromptText = originalPrompt.replace(styleRegex, `The overall visual style for the illustrations is '${newStylePromptPart}'`);
    updatedPromptText = updatedPromptText.replace(/using keywords like '.*?'/g, `using keywords like '${newStylePromptPart}'`);
    
    let finalPrompt: string | object = updatedPromptText;

     if (typeof storyConfig.prompt === 'object' && storyConfig.prompt !== null && 'parts' in storyConfig.prompt) {
        const imagePart = (storyConfig.prompt.parts as any[]).find(p => p.inlineData);
        if(imagePart) {
            finalPrompt = {
                parts: [
                    imagePart,
                    { text: updatedPromptText }
                ]
            }
        }
    }
    
    handleGenerateStory(finalPrompt, storyConfig.pageCount);
  }, [storyConfig, handleGenerateStory]);
  
  const handleStartEdit = useCallback((page: StoryPage) => {
    setEditingPage(page);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingPage(null);
  }, []);

  const handleFinalSave = useCallback((finalImageUrl: string) => {
    if (!editingPage) return;
    
    setStoryPages(prevPages =>
      prevPages.map(p =>
        p.id === editingPage.id ? { ...p, imageUrl: finalImageUrl, imageStatus: 'success' } : p
      )
    );
    setEditingPage(null);
  }, [editingPage]);


  const handleReset = () => {
    setStoryPages([]);
    setStoryConfig(null);
    setError(null);
    setIsLoading(false);
  };
  
  const handleSaveToCloud = async () => {
    if (storyPages.length === 0 || storyPages.some(p => p.imageStatus !== 'success')) {
        setSaveState('error'); // Use toast to show not ready error.
        return;
    };
    setSaveState('saving');
    try {
      // Filter out pages without image URLs just in case
      const pagesToSave = storyPages.filter(p => p.imageUrl);
      const response = await fetch('/api/save-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: pagesToSave, title: pagesToSave[0].text.substring(0, 50) + '...' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('saveError'));
      }
      setSaveState('success');
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  };

  const Toast = () => {
    useEffect(() => {
      if (saveState === 'success' || saveState === 'error') {
        const timer = setTimeout(() => setSaveState('idle'), 3000);
        return () => clearTimeout(timer);
      }
    }, [saveState]);

    if (saveState === 'idle') return null;

    const isSuccess = saveState === 'success';
    let message = isSuccess ? t('saveSuccess') : t('saveError');
    if (saveState === 'error' && storyPages.some(p => p.imageStatus !== 'success')) {
        message = t('saveErrorNotReady');
    }


    return (
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-fade-in-up ${isSuccess ? 'bg-green-600' : 'bg-red-600'} text-white`}>
        {isSuccess ? <CheckCircleIcon className="w-6 h-6" /> : <XMarkIcon className="w-6 h-6" />}
        <span className="font-semibold">{message}</span>
      </div>
    );
  };
  
  const DownloadModal = () => {
    const handleDownloadText = () => {
        const fullText = storyPages.map((page, index) => `Page ${index + 1}\n\n${page.text}`).join('\n\n---\n\n');
        const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'marketing_story.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadImage = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `story_page_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[var(--bg-secondary)] w-full max-w-2xl rounded-2xl border border-[var(--border-color)] shadow-2xl p-6 relative flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-serif">{t('downloadModalTitle')}</h2>
                    <button onClick={() => setShowDownloadModal(false)} className="p-1 rounded-full hover:bg-[var(--bg-tertiary)]"><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <p className="text-[var(--text-secondary)] mb-6">{t('downloadModalDescription')}</p>
                
                <div className="mb-6">
                    <button onClick={handleDownloadText} className="w-full px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)] transition-colors inline-flex items-center justify-center gap-2">
                        <DownloadIcon className="w-5 h-5"/>
                        {t('downloadFullStory')}
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[50vh] pr-2 -mr-2 space-y-4">
                    {storyPages.map((page, index) => (
                        <div key={page.id} className="flex items-center justify-between bg-[var(--bg-primary)] p-3 rounded-lg">
                            <div className="flex items-center gap-4">
                               {page.imageUrl ? (
                                    <img src={page.imageUrl} alt={`Page ${index + 1}`} className="w-16 h-16 object-cover rounded-md" />
                                ) : (
                                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-md flex items-center justify-center">...</div>
                                )}
                                <div>
                                    <p className="font-semibold">{t('pageIndicator', index + 1, storyPages.length)}</p>
                                    <p className="text-sm text-[var(--text-secondary)] truncate max-w-xs">{page.text}</p>
                                </div>
                            </div>
                            <button onClick={() => page.imageUrl && handleDownloadImage(page.imageUrl, index)} disabled={!page.imageUrl} className="px-4 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-sm font-semibold rounded-full hover:bg-[var(--border-color)] disabled:opacity-50 disabled:cursor-not-allowed">
                                {t('download')}
                            </button>
                        </div>
                    ))}
                </div>
                
                 <button onClick={() => setShowDownloadModal(false)} className="mt-6 w-full px-5 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-full hover:bg-[var(--border-color)]">
                    {t('close')}
                </button>
            </div>
        </div>
    );
  };

  const SettingsDropdown = () => (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
      <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <CogIcon className="w-6 h-6" />
      </button>
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-2xl p-2 z-20">
          <div className="mb-2">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] px-2 mb-1">{t('language')}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="w-full p-1.5 text-sm bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md">
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] px-2 mb-1">{t('theme')}</label>
             {themes.map(th => (
                <button 
                  key={th.name} 
                  onClick={() => setTheme(th.name)} 
                  className={`w-full text-left text-sm p-1.5 rounded-md ${theme === th.name ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--bg-tertiary)]'}`}
                >
                  {t(th.tKey)}
                </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full max-w-4xl mx-auto text-center mb-8 relative">
        <div className="flex items-center justify-center gap-3 mb-2">
          <LogoIcon className="w-12 h-12 text-[var(--accent)]" />
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-[var(--text-primary)]">{t('headerTitle')}</h1>
        </div>
        <p className="text-[var(--text-secondary)]">{t('headerSubtitle')}</p>
        <SettingsDropdown />
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex-grow">
        {isLoading && <LoadingIndicator message={loadingMessage} />}
        
        {!isLoading && error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-6 text-center">
            <p><strong>{t('errorTitle')}</strong></p>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && storyPages.length === 0 && (
          <StoryInputForm
            onSubmit={handleGenerateStory}
            isLoading={isLoading}
            t={t}
          />
        )}
        
        {!isLoading && storyPages.length > 0 && (
          <StoryViewer 
            pages={storyPages} 
            onStartEdit={handleStartEdit}
            onReset={handleReset}
            onDownload={() => setShowDownloadModal(true)}
            onRegenerateWithNewStyle={handleRegenerateWithNewStyle}
            onSaveToCloud={handleSaveToCloud}
            isSaving={saveState === 'saving'}
            t={t}
          />
        )}
        
        {editingPage && (
          <ImageEditorModal
            page={editingPage}
            onClose={handleCancelEdit}
            onFinalSave={handleFinalSave}
            t={t}
          />
        )}
        {showDownloadModal && <DownloadModal />}
        <Toast />
      </main>
    </div>
  );
};

export default App;