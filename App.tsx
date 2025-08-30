import React, { useState, useCallback, useEffect } from 'react';
import { StoryPage, StoryPageData } from './types';
import { generateStoryPages, generateImageForPage } from './services/geminiService';
import { getTranslator, Language, Theme, translations, themes } from './i18n';
import StoryInputForm from './components/StoryInputForm';
import StoryViewer from './components/StoryViewer';
import ImageEditorModal from './components/ImageEditorModal';
import LoadingIndicator from './components/LoadingIndicator';
import { LogoIcon, DownloadIcon, CogIcon } from './components/icons';

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
  
  const t = getTranslator(language);

  useEffect(() => {
    const root = window.document.documentElement;
    root.lang = language;
    root.classList.remove('dark', 'light', 'synthwave');
    root.classList.add(theme);
  }, [theme, language]);

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

      setLoadingMessage(t('loadingScenes'));
      
      const pagesWithImages: StoryPage[] = [];
      for (let i = 0; i < pagesData.length; i++) {
        const page = pagesData[i];
        setLoadingMessage(t('loadingSceneProgress', i + 1, pagesData.length));
        const { imageUrl, mimeType } = await generateImageForPage(page.imagePrompt);
        pagesWithImages.push({ ...page, id: `page-${i}`, imageUrl, mimeType });
      }

      setStoryPages(pagesWithImages);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : t('errorUnknown');
      if (message.includes('limit reached')) {
        setError(t('errorRateLimit'));
      } else {
        setError(message);
      }
    } finally {
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
        p.id === editingPage.id ? { ...p, imageUrl: finalImageUrl } : p
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
  
  const DownloadModal = () => { /* ... */ };

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
      </main>
    </div>
  );
};

export default App;
