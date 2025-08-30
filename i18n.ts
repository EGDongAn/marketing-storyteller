

export type Language = 'en' | 'ko';
export type Theme = 'dark' | 'light' | 'synthwave';

export const translations = {
  en: {
    // App Header
    headerTitle: 'Marketing Storyteller',
    headerSubtitle: 'Turn your products into viral stories with the power of AI.',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    
    // Themes
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSynthwave: 'Synthwave',

    // Errors
    errorTitle: 'Oops! Something went wrong.',
    errorUnknown: 'An unknown error occurred.',
    errorPromptEmpty: 'Please enter a story idea.',
    errorRateLimit: 'Image generation limit reached. Please wait a moment before trying again.',

    // Loading Messages
    loadingStructure: 'Dreaming up your story structure...',
    loadingScenes: 'Painting the scenes for your story... (This may take a moment)',
    loadingSceneProgress: (current: number, total: number) => `Painting scene ${current} of ${total}...`,
    
    // Story Input Form
    startWithImage: 'Start with an Image',
    startWithImageOptional: 'Optional: Upload a character or product',
    imageInspiration: 'Image will be used as inspiration.',
    customStoryTitle: 'Create Your Own Story',
    customStoryPlaceholder: 'e.g., A brave squirrel who wants to fly to the moon',
    imageStyle: 'Image Style:',
    pageCount: 'Number of Pages:',
    createStoryBtn: 'Create My Story',
    otherWays: 'Or try another way',
    adMakerTitle: 'Viral Ad Maker',
    adMakerDescription: 'Create a short ad for your product.',
    wizardTitle: 'Story Wizard',
    wizardDescription: 'Build a story step-by-step.',
    next: 'Next',

    // Ad Wizard
    adWizardTitle: 'Viral Ad Maker',
    adWizardConfirmTitle: 'Confirm Your Ad Details',
    adWizardTemplate: 'Template:',
    adWizardProduct: 'Product:',
    adWizardFeatures: 'Features:',
    adWizardStyle: 'Style:',
    adWizardScenes: 'Scenes:',
    adWizardBackToEdit: 'Back to Edit',
    adWizardGenerate: 'Generate Ad',
    adWizardStepTemplate: 'First, choose an ad template:',
    adWizardStepProductName: 'What is the name of your product?',
    adWizardStepProductFeatures: 'What are its key features? (comma separated)',
    adWizardStepImageStyle: 'Choose an image style:',
    adWizardStepSceneCount: 'Finally, how many scenes would you like?',

    // Story Wizard
    storyWizardTitle: 'Story Wizard',
    storyWizardStepGenre: 'First, choose or create a genre for your story:',
    storyWizardStepCharacter: 'Next, who is the main character?',
    storyWizardStepSetting: 'Where does the story take place?',
    storyWizardStepPlot: 'What is their main goal?',
    storyWizardStepImageStyle: 'Next, choose a visual style for your story:',
    storyWizardStepPageCount: 'Finally, how many pages should the story be?',
    
    // Story Viewer
    editImage: 'Edit Image',
    pageIndicator: (current: number, total: number) => `Page ${current} of ${total}`,
    startNewStory: 'Start New Story',
    changeStyle: 'Change Style',
    downloadStory: 'Download Story',
    saveToCloud: 'Save to Cloud',
    savingToCloud: 'Saving...',

    // Download Modal
    downloadModalTitle: 'Download Your Story',
    downloadModalDescription: 'Download the complete story text and each image individually.',
    downloadFullStory: 'Download Full Story (.txt)',
    download: 'Download',
    close: 'Close',
    
    // Style Change Modal
    styleChangeModalTitle: 'Change Image Style',
    styleChangeModalDescription: 'Choose a new style and all images in the story will be regenerated.',
    cancel: 'Cancel',

    // Image Editor
    editIllustration: 'Edit Illustration',
    editPlaceholder: 'Describe your change to the image...',
    applyAiEdit: 'Apply AI Edit',
    pen: 'Pen',
    aiSelect: 'AI Select',
    addBubble: 'Add Bubble',
    clearMask: 'Clear Mask',
    undo: 'Undo',
    saveAndClose: 'Save & Close',
    bubbleEditorTitle: 'Bubble Editor',
    bubbleFill: 'Fill:',
    bubbleText: 'Text:',
    bubbleBorder: 'Border:',
    bubbleDelete: 'Delete',
    loadingWand: 'Analyzing subject...',
    loadingEdit: 'Applying edit...',

    // Save to Cloud Notifications
    saveSuccess: 'Story saved successfully!',
    saveError: 'Failed to save story.',
  },
  ko: {
    // App Header
    headerTitle: '마케팅 스토리텔러',
    headerSubtitle: 'AI의 힘으로 당신의 제품을 바이럴 스토리로 만드세요.',
    settings: '설정',
    language: '언어',
    theme: '테마',

    // Themes
    themeDark: '다크',
    themeLight: '라이트',
    themeSynthwave: '신스웨이브',
    
    // Errors
    errorTitle: '오! 문제가 발생했습니다.',
    errorUnknown: '알 수 없는 오류가 발생했습니다.',
    errorPromptEmpty: '스토리 아이디어를 입력해주세요.',
    errorRateLimit: '이미지 생성 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',

    // Loading Messages
    loadingStructure: '스토리 구조를 구상하는 중...',
    loadingScenes: '장면을 그리는 중입니다... (시간이 걸릴 수 있습니다)',
    loadingSceneProgress: (current: number, total: number) => `${total}개 중 ${current}번째 장면을 그리는 중...`,

    // Story Input Form
    startWithImage: '이미지로 시작하기',
    startWithImageOptional: '선택: 캐릭터나 제품을 업로드하세요',
    imageInspiration: '이미지가 영감의 원천으로 사용됩니다.',
    customStoryTitle: '직접 이야기 만들기',
    customStoryPlaceholder: '예: 달에 가고 싶은 용감한 다람쥐',
    imageStyle: '이미지 스타일:',
    pageCount: '페이지 수:',
    createStoryBtn: '스토리 만들기',
    otherWays: '다른 방법으로 만들기',
    adMakerTitle: '바이럴 광고 제작기',
    adMakerDescription: '당신의 제품을 위한 짧은 광고를 만드세요.',
    wizardTitle: '스토리 마법사',
    wizardDescription: '단계별로 스토리를 구성합니다.',
    next: '다음',
    
    // Ad Wizard
    adWizardTitle: '바이럴 광고 제작기',
    adWizardConfirmTitle: '광고 정보 확인',
    adWizardTemplate: '템플릿:',
    adWizardProduct: '제품:',
    adWizardFeatures: '특징:',
    adWizardStyle: '스타일:',
    adWizardScenes: '장면 수:',
    adWizardBackToEdit: '수정하기',
    adWizardGenerate: '광고 생성',
    adWizardStepTemplate: '먼저, 광고 템플릿을 선택하세요:',
    adWizardStepProductName: '제품 이름이 무엇인가요?',
    adWizardStepProductFeatures: '핵심 특징은 무엇인가요? (쉼표로 구분)',
    adWizardStepImageStyle: '이미지 스타일을 선택하세요:',
    adWizardStepSceneCount: '마지막으로, 몇 개의 장면을 원하시나요?',

    // Story Wizard
    storyWizardTitle: '스토리 마법사',
    storyWizardStepGenre: '먼저, 이야기의 장르를 선택하거나 만들어보세요:',
    storyWizardStepCharacter: '다음으로, 주인공은 누구인가요?',
    storyWizardStepSetting: '이야기는 어디에서 일어나나요?',
    storyWizardStepPlot: '주인공의 목표는 무엇인가요?',
    storyWizardStepImageStyle: '다음으로, 이야기의 비주얼 스타일을 선택하세요:',
    storyWizardStepPageCount: '마지막으로, 몇 페이지 분량의 이야기를 만들까요?',
    
    // Story Viewer
    editImage: '이미지 편집',
    pageIndicator: (current: number, total: number) => `${total} 중 ${current} 페이지`,
    startNewStory: '새 스토리 시작',
    changeStyle: '스타일 변경',
    downloadStory: '스토리 다운로드',
    saveToCloud: '클라우드에 저장',
    savingToCloud: '저장 중...',

    // Download Modal
    downloadModalTitle: '스토리 다운로드',
    downloadModalDescription: '전체 스토리 텍스트와 각 이미지를 개별적으로 다운로드하세요.',
    downloadFullStory: '전체 스토리 다운로드 (.txt)',
    download: '다운로드',
    close: '닫기',
    
    // Style Change Modal
    styleChangeModalTitle: '이미지 스타일 변경',
    styleChangeModalDescription: '새로운 스타일을 선택하면 스토리의 모든 이미지가 다시 생성됩니다.',
    cancel: '취소',

    // Image Editor
    editIllustration: '일러스트 편집',
    editPlaceholder: '이미지에 적용할 변경사항을 설명하세요...',
    applyAiEdit: 'AI 편집 적용',
    pen: '펜',
    aiSelect: 'AI 선택',
    addBubble: '말풍선 추가',
    clearMask: '마스크 지우기',
    undo: '되돌리기',
    saveAndClose: '저장하고 닫기',
    bubbleEditorTitle: '말풍선 편집기',
    bubbleFill: '채우기:',
    bubbleText: '텍스트:',
    bubbleBorder: '테두리:',
    bubbleDelete: '삭제',
    loadingWand: '피사체 분석 중...',
    loadingEdit: '편집 적용 중...',
    
    // Save to Cloud Notifications
    saveSuccess: '스토리가 성공적으로 저장되었습니다!',
    saveError: '스토리 저장에 실패했습니다.',
  },
};

export const themes: { name: Theme, tKey: keyof typeof translations.en }[] = [
    { name: 'dark', tKey: 'themeDark' },
    { name: 'light', tKey: 'themeLight' },
    { name: 'synthwave', tKey: 'themeSynthwave' },
];

export const getTranslator = (lang: Language) => {
    return (key: keyof typeof translations.en, ...args: (string | number)[]) => {
        const template = translations[lang][key] || translations['en'][key];
        if (typeof template === 'function') {
            // FIX: Cast template to `any` to resolve spread argument error with dynamic function signatures.
            return (template as any)(...args);
        }
        return template;
    };
};