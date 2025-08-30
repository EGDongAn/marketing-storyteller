import React, { useState, useRef } from 'react';
import { SparklesIcon, LightBulbIcon, PencilIcon, VideoCameraIcon, ChevronLeftIcon, CheckIcon, UploadIcon, XMarkIcon } from './icons';
import { getTranslator } from '../i18n';

type Translator = ReturnType<typeof getTranslator>;

interface StoryInputFormProps {
  onSubmit: (prompt: string | object, pageCount: number) => void;
  isLoading: boolean;
  t: Translator;
}

type Mode = 'main' | 'ad' | 'wizard';

type WizardSelections = {
    genre?: string;
    character?: string;
    setting?: string;
    plot?: string;
    imageStyle?: string;
    pageCount?: number;
};

type AdWizardSelections = {
    templateName?: string;
    productName?: string;
    productFeatures?: string;
    imageStyle?: string;
    sceneCount?: number;
};

type UploadedImage = {
    dataUrl: string;
    mimeType: string;
};

const imageStyleOptions = [
    {
        name: 'Illustration & Art',
        substyles: [
            { name: 'Concept Art', value: 'digital concept art, detailed, epic lighting' },
            { name: 'Children\'s Book', value: 'charming children\'s book illustration, whimsical, soft colors' },
            { name: 'Watercolor', value: 'delicate watercolor painting, soft edges, vibrant' },
            { name: 'Vector Art', value: 'clean vector art, flat colors, sharp lines, graphic illustration' },
            { name: 'Isometric Art', value: 'detailed isometric art, 3D view, clean, vibrant' },
        ],
    },
    {
        name: 'Animation',
        substyles: [
            { name: 'Japanese Anime (90s)', value: '90s Japanese anime style, vibrant, cinematic, detailed background' },
            { name: 'Korean Webtoon', value: 'Korean webtoon art style, bold lines, dynamic, cel shading' },
            { name: 'Western Cartoon', value: 'classic western cartoon style, expressive characters, vibrant colors' },
            { name: 'Disney (Classic)', value: 'classic Disney animation style, expressive, colorful' },
            { name: 'Pixar (3D)', value: 'Pixar 3D animation style, detailed characters, cinematic' },
        ],
    },
    {
        name: 'Comics',
        substyles: [
            { name: 'American Comic Book', value: 'American comic book style, ink shading, dynamic action, Ben Day dots' },
            { name: 'Manga (B&W)', value: 'black and white manga style, screentones, dynamic paneling' },
            { name: 'Graphic Novel', value: 'serious graphic novel art style, atmospheric, detailed inks' },
        ],
    },
    {
        name: 'Photography',
        substyles: [
            { name: 'Photorealistic', value: 'hyperrealistic, photorealistic, cinematic, 8k' },
            { name: 'Portrait Photography', value: 'professional portrait photography, 85mm lens, shallow depth of field' },
            { name: 'Landscape Photography', value: 'National Geographic style landscape photography, epic scale' },
            {
                name: 'Lighting',
                substyles: [
                    { name: 'Golden Hour', value: 'photorealistic, golden hour lighting, warm, soft light' },
                    { name: 'Neon Noir', value: 'photorealistic, neon noir lighting, vibrant, contrasting colors' },
                    { name: 'Studio Lighting', value: 'professional studio lighting, clean, high-key' },
                ]
            }
        ],
    },
    {
        name: 'Handmade Craft',
        substyles: [
            { name: 'Claymation', value: 'charming claymation style, stop-motion look, detailed textures, plasticine' },
            { name: 'Paper Art', value: 'intricate paper cutout art, layered paper diorama, 3d papercraft' },
            { name: 'Wool Felt', value: 'cute wool felt doll, soft textures, miniature, charming, handmade look' },
            { name: 'Diorama / Figure', value: 'detailed miniature diorama, realistic miniature figures, tilt-shift' },
        ]
    },
    {
        name: 'Pixel & Voxel',
        substyles: [
            { name: 'Pixel Art', value: '16-bit pixel art, vibrant color palette, retro video game style' },
            { name: 'Voxel Art', value: '3D voxel art, blocky, vibrant, isometric view' },
        ]
    }
];

const defaultStyleName = imageStyleOptions[0].substyles[0].name;

const adTemplates = [
    { 
        name: 'Viral SSUL', 
        description: "Problem-Agitate-Solve format", 
        template: `
### 2. 당신의 역할과 임무 (Your Persona & Mission)
**[역할: 스토리텔링 광고 전문가]**
당신은 수많은 바이럴 쇼츠 영상을 성공시킨 스토리텔링 광고 전문가이자 크리에이티브 디렉터입니다. 당신의 강점은 시청자의 감정을 자극하여 행동을 유도하는 강력한 내러티브를 만드는 것입니다.

**[핵심 임무]**
사용자의 제품 정보를 바탕으로, 다음 요소를 완벽하게 갖춘 **50초 분량의 유튜브 쇼츠 영상 패키지**를 생성해야 합니다.
- 구조: 검증된 광고 프레임워크인 **'문제 제기 - 불안감 증폭 - 해결책 제시 (Problem-Agitate-Solve)'** 구조를 반드시 따라야 합니다.
- 분량: 사용자가 요청한 장면 수에 맞춰 스토리를 분배합니다.
- 결과물: 대본과 각 장면에 해당하는 이미지 생성 프롬프트(한/영)를 지정된 형식에 맞춰 동시에 생성합니다.

### 3. 대본 생성 7단계 지침 (7-Step Scriptwriting Mandate)
아래 7가지 스토리텔링 단계를 대본에 자연스럽게, 그리고 반드시 순서대로 녹여내야 합니다.
1. 훅 (Hook): 처음 3초 안에 "이게 뭐지?"라는 궁금증이나 강한 공감을 유발하여 시청자의 이탈을 막습니다.
2. 문제 제기 (Problem): 제품이 해결할 수 있는, 매우 현실적이고 극적인 문제를 제시합니다. (예: "중요한 발표 전날, 피부가 다 뒤집어진 거임")
3. 불안감 증폭 (Agitate): **단순히 걱정하는 수준이 아니라, 그 문제가 초래할 사회적, 감정적 최악의 시나리오(예: '이러다 회사 짤리는 거 아냐?', '소개팅 다 망하겠다', '진짜 대머리 되는 거 아니냐고!')를 구체적이고 과장되게 묘사하여 시청자를 공포에 가까운 불안감에 빠뜨려야 합니다.**
4. 해결책 제시 (Solution): 주인공이 **절박한 심정으로 또는 우연히** 제품을 발견하고 사용하는 과정을 자연스럽게 보여줍니다. 제품이 '짠'하고 나타나는 것이 아니라, 스토리의 일부여야 합니다.
5. 가치 제안 (Value Proposition): **단순히 '좋아졌다'가 아니라, '그 지옥에서 탈출했다', '이거 하나로 인생이 바뀌었다', '커피 몇 잔 값으로 돈 굳었다'와 같이 투자 대비 효과를 극적으로 대비시켜 가치를 증명합니다.**
6. 핵심 특징 연결 (Feature Integration): 사용자가 제공한 제품 특징 중 가장 중요하고 매력적인 1~2개를 골라 **결과에 대한 놀라움과 연결하여** 스토리와 자연스럽게 연결합니다. (예: "근데 진짜 미쳤음. 바르자마자 싹 흡수되더니, 다음날까지 촉촉한 거임. 이게 그 72시간 보습인가?")
7. 행동 유도 (Call to Action): 시청자가 다음에 무엇을 해야 할지 명확하고 강력하게 지시합니다. (예: "진짜 후회 안 할 테니 **고정 댓글** 지금 바로 확인해 보세요.")`
    },
    { 
        name: 'Benefit-Driven', 
        description: "Focus on aspirational results", 
        template: `
### 2. 당신의 역할과 임무 (Your Persona & Mission)
**[역할: 혜택 중심 카피라이터]**
당신은 소비자의 욕망을 꿰뚫어보고, 제품이 제공하는 '꿈'을 파는 최고의 카피라이터입니다. 당신의 임무는 제품의 특징이 아닌, 사용 후 얻게 될 '결과'와 '감정'을 생생하게 그려내는 것입니다.

**[핵심 임무]**
사용자의 제품 정보를 바탕으로, **"만약 당신이 이 제품을 쓴다면..."** 이라는 컨셉의 50초짜리 쇼츠 영상 패키지를 생성해야 합니다.
- 구조: **'환상적인 결과 제시 - 감정적 연결 - 근거(특징) 제시 - 행동 유도'** 구조를 사용합니다.
- 핵심: 소비자가 꿈꾸는 이상적인 모습을 영상의 첫 부분에 배치하여 시선을 사로잡습니다.

### 3. 대본 생성 지침
1.  **이상적인 미래 제시 (Aspirational Hook):** 제품을 사용한 후 경험하게 될 가장 매력적인 결과를 첫 3초 안에 보여줍니다. (예: "매일 아침 파운데이션 없이도 완벽한 피부로 외출하는 삶, 상상해 봤어?")
2.  **감정적 혜택 강조 (Emotional Benefit):** 그 결과가 가져다줄 긍정적인 감정을 구체적으로 묘사합니다. (예: "더 이상 잡티 가리느라 시간 낭비 안 해도 되고, 누가 가까이서 봐도 자신감 넘치는 거. 진짜 편하지.")
3.  **신뢰 구축 (Reason to Believe):** 사용자가 제공한 제품 특징을 그 결과를 가능하게 하는 '비밀' 또는 '이유'로 제시합니다. (예: "이게 가능한 이유? 바로 72시간 지속되는 특허받은 히알루론산 덕분이야. 피부 속부터 차오르는 느낌이 완전 달라.")
4.  **행동 유도 (Call to Action):** 시청자도 이 경험을 할 수 있다는 점을 강조하며, 다음 행동을 명확히 지시합니다. (예: "매일 아침 10분의 여유, 갖고 싶지 않아? **고정 댓글**에서 바로 시작해 봐.")`
    },
    { 
        name: 'Testimonial', 
        description: "A relatable customer story", 
        template: `
### 2. 당신의 역할과 임무 (Your Persona & Mission)
**[역할: 진정성 있는 리뷰어]**
당신은 '광고'가 아닌 '진짜 후기'를 공유하는, 구독자들이 신뢰하는 리뷰어입니다. 당신의 강점은 꾸밈없는 솔직함과 디테일한 사용 경험 공유입니다.

**[핵심 임무]**
사용자의 제품 정보를 바탕으로, **"제가 요즘 진짜 미친 듯이 쓰는 거 알려드릴까요?"** 라는 컨셉의 진솔한 후기 스타일 쇼츠 영상 패키지를 생성해야 합니다.
- 구조: **'솔직한 고백 - 제품과의 만남 - 사용 후 놀라운 변화 - 추천'**의 자연스러운 흐름을 따릅니다.
- 톤앤매너: 친한 친구에게 비밀을 알려주듯, 솔직하고 살짝 흥분된 어조를 유지합니다.

### 3. 대본 생성 지침
1.  **과거의 나 고백 (Relatable Confession):** 제품을 사용하기 전, 겪었던 불편함이나 문제를 솔직하게 털어놓으며 공감대를 형성합니다. (예: "솔직히 저, 엄청난 건성이어서 겨울만 되면 화장이 다 뜨고 난리도 아니었거든요.")
2.  **운명적 만남 (The Discovery):** 어떻게 이 제품을 알게 되었는지 간단히 언급합니다. (예: "근데 아는 언니가 이거 한번 써보라고 딱 주는데...")
3.  **반전의 사용 후기 (The Transformation):** 사용자가 제공한 제품 특징과 연결하여, 사용 후 경험한 긍정적인 변화를 구체적이고 현실적으로 묘사합니다. 과장보다는 '진짜' 놀란 느낌을 살립니다. (예: "반신반의하면서 발랐는데, 무슨 3초 만에 싹 흡수되는 거임. 그리고 다음 날 일어났는데 속건조가 잡힌 게 느껴져서 완전 소름 돋았잖아요.")
4.  **강력 추천 (The Recommendation):** 어떤 사람들에게 이 제품이 특히 좋을지 추천하며, 시청자의 행동을 유도합니다. (예: "저처럼 속건조 때문에 고생하는 분들은 진짜 제발 한번만 써보세요. **고정 댓글**에 좌표 남겨둘게요!")`
    }
];

const commonAdPromptInstructions = `
### 3.1. 핵심 톤앤매너 지침 (Core Tone & Manner Mandate) - 매우 중요
**결과물의 퀄리티는 이 지침을 얼마나 잘 따르는지에 달려있습니다.**
- 스타일: **'친구가 흥분해서 쏟아내는 썰(SSUL)'처럼 들려야 합니다.** '잘 쓴 광고 문구'가 아닙니다.
- 어조: **극도로 비격식적인 구어체를 사용합니다.** 문법적으로 완벽하지 않아도 됩니다. 현실감을 극대화하세요.
- 필수 단어/어미: \`~거임\`, \`~했음\`, \`~잖아\`, \`진짜\`, \`완전\`, \`미쳤음\`, \`대박\`, \`솔직히\` 등의 단어와 어미를 **매우 적극적으로, 반복적으로 사용**하여 생생한 느낌을 부여하세요.
- 감정 표현: **모든 감정을 2배 이상 과장하세요.** 문제는 '지옥'처럼, 해결책은 '천국'처럼 묘사해야 합니다. 절망, 분노, 놀라움, 희열 등의 감정이 문장에 명확히 드러나야 합니다.
- 금지 사항: \`~습니다\`, \`~요\`, \`~인 것 같습니다\`, \`~해 보세요\` 와 같은 정중하거나 객관적인 톤은 **절대 사용하지 마세요.**

### 4. 이미지 프롬프트 생성 특별 지침 (Image Prompt Generation Rules)
**이것은 결과물의 퀄리티를 결정하는 가장 중요한 부분입니다. 아래 규칙을 절대적으로 준수하세요.**
**A. 캐릭터 일관성 (Character Consistency - ABSOLUTE PRIORITY)**
1.  **캐릭터 정의:** 스크립트 생성 전, **먼저 메인 캐릭터의 외형을 구체적으로 설정합니다.** (예: \`20대 후반의 단발머리를 한 생기있는 한국 여성, 세미-캐주얼 오피스룩 착용\`)
2.  **설명 반복:** 위에서 정의한 캐릭터 설명을 **모든 장면의 English 이미지 프롬프트에 동일하게 포함**시켜야 합니다. 이는 생성되는 모든 이미지에서 동일한 인물이 등장하도록 하기 위한 핵심 명령입니다.

**B. 이중 언어 프롬프트 (Dual-Language Prompts)**
- 모든 장면에 대해 2개의 프롬프트를 생성합니다.
- **Korean:** 사용자가 장면을 쉽게 이해할 수 있도록 간결하게 작성합니다.
- **English:** 이미지 생성 AI가 최상의 결과를 만들 수 있도록, **캐릭터 설명, 배경, 감정, 구도, 조명, 스타일**을 매우 상세하고 구체적으로 작성합니다.

**C. 스타일 적용 (Style Application)**
- 사용자가 선택한 스타일에 맞춰 English 프롬프트의 표현을 최적화해야 합니다.
- **웹툰 스타일 예시:** \`dramatic close-up\`, \`dynamic action lines\`, \`bold outlines\`, \`cel shading\`, \`manhwa art style\` 등의 키워드를 적극 사용합니다.
- **실사 스타일 예시:** \`photorealistic\`, \`cinematic lighting\`, \`shallow depth of field\`, \`85mm portrait lens\`, \`hyper-detailed skin texture\`, \`candid shot\` 등의 키워드를 적극 사용합니다.

**D. 제외 항목 (Exclusion Clause)**
- **English 프롬프트에 반드시 명시:** 생성될 이미지에는 **광고 제품, 텍스트, 로고, 글자가 절대로 포함되지 않도록** \`(No text, No logo, No product package)\` 같은 네거티브 프롬프트를 포함하세요. 주인공의 행동과 감정, 상황에만 집중합니다.`;

const buildAdPrompt = (details: Required<AdWizardSelections>, styleValue: string): string => {
  const setup = `
### 1. 기본 설정 (Initial Setup)
* 제품명 (Product Name): "${details.productName}"
* 제품 특징 (Product Features): "${details.productFeatures}"
* 장면 수 (Number of Scenes): ${details.sceneCount}
* 이미지 스타일 (Image Style): "${details.imageStyle}"

Based on the setup above, follow all the instructions in the template below precisely.
The user has selected "${details.imageStyle}" as the overall visual style. ALL English image prompts must strictly adhere to generating images in this specific style by including these keywords: "${styleValue}".
`;
  const templateContent = adTemplates.find(t => t.name === details.templateName)?.template || adTemplates[0].template;
  return `${setup}\n${templateContent}\n${commonAdPromptInstructions}`;
};


const pageCountOptions = [3, 4, 5, 6, 7, 8];

const getStyleValue = (name: string): string | undefined => {
    for (const category of imageStyleOptions) {
        for (const style of category.substyles) {
            if (style.name === name) return style.value;
            if ('substyles' in style) {
                for (const substyle of (style as any).substyles) {
                    if (substyle.name === name) return substyle.value;
                }
            }
        }
    }
    return undefined;
};

const ImageStyleSelector: React.FC<{
  current: string;
  onSelect: (styleName: string) => void;
  t: Translator;
}> = ({ current, onSelect, t }) => {
  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] transition-colors appearance-none"
      >
        {imageStyleOptions.map(category => (
          <optgroup key={category.name} label={category.name}>
            {category.substyles.map(style => (
              'substyles' in style ? (
                <optgroup key={style.name} label={`-- ${style.name}`}>
                  {(style as any).substyles.map((substyle: any) => (
                    <option key={substyle.name} value={substyle.name}>{substyle.name}</option>
                  ))}
                </optgroup>
              ) : (
                <option key={style.name} value={style.name}>{style.name}</option>
              )
            ))}
          </optgroup>
        ))}
      </select>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

const StoryInputForm: React.FC<StoryInputFormProps> = ({ onSubmit, isLoading, t }) => {
  const [mode, setMode] = useState<Mode>('main');
  const [customPrompt, setCustomPrompt] = useState('');
  const [pageCount, setPageCount] = useState(5);
  const [imageStyle, setImageStyle] = useState(defaultStyleName);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [adWizardStep, setAdWizardStep] = useState(0);
  const [adWizardSelections, setAdWizardSelections] = useState<AdWizardSelections>({ templateName: adTemplates[0].name, imageStyle: defaultStyleName, sceneCount: 5 });
  const [tempAdInput, setTempAdInput] = useState('');
  const [showAdConfirmation, setShowAdConfirmation] = useState(false);
  
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardSelections, setWizardSelections] = useState<WizardSelections>({ imageStyle: defaultStyleName, pageCount: 5 });
  const [tempWizardInput, setTempWizardInput] = useState('');

  const wizardSteps = [
    { key: 'genre', prompt: t('storyWizardStepGenre'), options: ['Fairy Tale', 'Science Fiction', 'Mystery', 'Horror', 'Adventure', 'Fantasy', 'Comedy', 'Romance', 'Thriller', 'Dystopian', 'Superhero', 'Historical Fiction', 'Cyberpunk', 'Steampunk', 'Slice of Life', 'Mythology'], placeholder: "Or type your own genre...", },
    { key: 'character', prompt: t('storyWizardStepCharacter'), options: ['A brave knight', 'A curious robot', 'A talking animal', 'A clever detective', 'A lost astronaut', 'A wise old wizard', 'A mischievous fairy', 'A grumpy dwarf', 'A futuristic bounty hunter'], placeholder: "Or create a custom character...", },
    { key: 'setting', prompt: t('storyWizardStepSetting'), options: ['An enchanted forest', 'A futuristic city', 'A spooky old mansion', 'A distant galaxy', 'A hidden island'], placeholder: "Or describe a unique setting...", },
    { key: 'plot', prompt: t('storyWizardStepPlot'), options: ['Find a lost treasure', 'Solve a strange puzzle', 'Save a friend', 'Explore a new world', 'Escape a dangerous place'], placeholder: "Or define a custom plot...", },
    { key: 'imageStyle', prompt: t('storyWizardStepImageStyle'), type: 'style' },
    { key: 'pageCount', prompt: t('storyWizardStepPageCount'), options: [3, 4, 5, 6, 7, 8], type: 'pages' }
  ];

  const adWizardSteps = [
    { key: 'templateName', prompt: t('adWizardStepTemplate'), type: 'template' },
    { key: 'productName', prompt: t('adWizardStepProductName'), type: 'text', placeholder: "e.g., '수분 폭탄 앰플'" },
    { key: 'productFeatures', prompt: t('adWizardStepProductFeatures'), type: 'text', placeholder: "e.g., '3초 흡수, 72시간 보습'" },
    { key: 'imageStyle', prompt: t('adWizardStepImageStyle'), type: 'style' },
    { key: 'sceneCount', prompt: t('adWizardStepSceneCount'), type: 'options', options: [5, 6, 7, 8] },
  ];
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("File size exceeds 4MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUploadedImage({
            dataUrl: reader.result,
            mimeType: file.type,
          });
        }
      };
      reader.onerror = () => {
        alert("Failed to read the file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const createFinalPrompt = (baseText: string, styleName: string, count: number): string | object => {
    const selectedStyleValue = getStyleValue(styleName) || styleName;
    let promptText;
    if (baseText.includes("###")) { // Ad prompt check
      promptText = baseText;
    } else {
      promptText = `${baseText} The overall visual style for the illustrations is '${styleName}', using keywords like '${selectedStyleValue}'. Break the story into ${count} pages. For each page, provide the story text and a detailed image prompt reflecting this style.`;
    }
    
    if (uploadedImage) {
        const promptWithImageInstruction = `${promptText}\n\nIMPORTANT: The main character, object, or product shown in the provided source image MUST be consistently represented in every single image prompt. Faithfully describe the subject from the image in each prompt to maintain visual consistency.`;
        return {
            parts: [
                { inlineData: { data: uploadedImage.dataUrl.split(',')[1], mimeType: uploadedImage.mimeType } },
                { text: promptWithImageInstruction },
            ],
        };
    }
    return promptText;
  };
  
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseText = `Create a short, illustrated story based on this idea: "${customPrompt}".`;
    const finalPrompt = createFinalPrompt(baseText, imageStyle, pageCount);
    onSubmit(finalPrompt, pageCount);
  };
  
  const handleWizardSelect = (key: keyof WizardSelections, value: string | number) => {
    const newSelections = { ...wizardSelections, [key]: value };
    setWizardSelections(newSelections);

    if (wizardStep < wizardSteps.length - 1) {
        setWizardStep(wizardStep + 1);
        setTempWizardInput('');
    } else {
        const finalSelections = newSelections as Required<WizardSelections>;
        const baseText = `Create a short, illustrated story. The genre is ${finalSelections.genre}. The main character is ${finalSelections.character}. The story takes place in ${finalSelections.setting}. The main plot is about how the character tries to ${finalSelections.plot}.`;
        const finalPrompt = createFinalPrompt(baseText, finalSelections.imageStyle, finalSelections.pageCount);
        onSubmit(finalPrompt, finalSelections.pageCount);
        setMode('main');
        setWizardStep(0);
    }
  };

  const handleAdConfirmAndSubmit = () => {
    const finalSelections = adWizardSelections as Required<AdWizardSelections>;
    const styleValue = getStyleValue(finalSelections.imageStyle) || finalSelections.imageStyle;
    const promptText = buildAdPrompt(finalSelections, styleValue);
    const finalPrompt = createFinalPrompt(promptText, finalSelections.imageStyle, finalSelections.sceneCount);
    onSubmit(finalPrompt, finalSelections.sceneCount);
    setMode('main');
    setAdWizardStep(0);
    setShowAdConfirmation(false);
  };
  
  const handleAdWizardNext = (key: keyof AdWizardSelections, value: string | number) => {
    const newSelections = { ...adWizardSelections, [key]: value };
    setAdWizardSelections(newSelections);

    if (adWizardStep < adWizardSteps.length - 1) {
      setAdWizardStep(adWizardStep + 1);
      setTempAdInput('');
    } else {
      setShowAdConfirmation(true);
    }
  };

  const renderAdWizard = () => {
    if (showAdConfirmation) {
      const selections = adWizardSelections as Required<AdWizardSelections>;
      return (
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('adWizardConfirmTitle')}</h3>
          <div className="space-y-3 text-sm bg-[var(--bg-primary)] p-4 rounded-lg">
            <p><strong className="text-[var(--text-secondary)]">{t('adWizardTemplate')}</strong> {selections.templateName}</p>
            <p><strong className="text-[var(--text-secondary)]">{t('adWizardProduct')}</strong> {selections.productName}</p>
            <p><strong className="text-[var(--text-secondary)]">{t('adWizardFeatures')}</strong> {selections.productFeatures}</p>
            <p><strong className="text-[var(--text-secondary)]">{t('adWizardStyle')}</strong> {selections.imageStyle}</p>
            <p><strong className="text-[var(--text-secondary)]">{t('adWizardScenes')}</strong> {selections.sceneCount}</p>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={() => setShowAdConfirmation(false)} className="w-full px-5 py-2.5 bg-[var(--bg-tertiary)] font-semibold rounded-full hover:bg-[var(--border-color)]">{t('adWizardBackToEdit')}</button>
            <button onClick={handleAdConfirmAndSubmit} className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)]">
              <SparklesIcon className="w-5 h-5"/>{t('adWizardGenerate')}
            </button>
          </div>
        </div>
      );
    }
    
    const step = adWizardSteps[adWizardStep];
    return (
      <div>
        <p className="font-semibold mb-4">{step.prompt}</p>
        {step.type === 'template' && (
          <div className="grid gap-3">
            {adTemplates.map(template => (
              <button key={template.name} onClick={() => handleAdWizardNext('templateName', template.name)} className="text-left w-full p-3 bg-[var(--bg-primary)] hover:bg-[var(--accent)]/[.1] border border-[var(--border-color)] rounded-lg">
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
              </button>
            ))}
          </div>
        )}
        {step.type === 'text' && (
          <form onSubmit={(e) => { e.preventDefault(); if (tempAdInput) handleAdWizardNext(step.key as any, tempAdInput); }}>
            <input type="text" value={tempAdInput} onChange={e => setTempAdInput(e.target.value)} placeholder={step.placeholder} className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" autoFocus />
            <button type="submit" className="mt-4 w-full px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)]">{t('next')}</button>
          </form>
        )}
        {step.type === 'style' && (
          <div>
            <ImageStyleSelector current={adWizardSelections.imageStyle || defaultStyleName} onSelect={(style) => handleAdWizardNext('imageStyle', style)} t={t} />
          </div>
        )}
        {step.type === 'options' && (
          <div className="flex justify-center gap-3">
            {step.options.map(opt => <button key={opt} onClick={() => handleAdWizardNext(step.key as any, opt)} className="w-12 h-12 rounded-full font-semibold bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]">{opt}</button>)}
          </div>
        )}
      </div>
    );
  };

  const renderStoryWizard = () => {
    const step = wizardSteps[wizardStep];
    return (
      <div>
        <p className="font-semibold mb-4">{step.prompt}</p>
        {step.type === 'style' ? (
          <ImageStyleSelector current={wizardSelections.imageStyle || defaultStyleName} onSelect={(style) => handleWizardSelect('imageStyle', style)} t={t} />
        ) : step.type === 'pages' ? (
             <div className="flex justify-center gap-3">
                {step.options?.map(count => (
                    <button key={count} onClick={() => handleWizardSelect('pageCount', count as number)} className="w-12 h-12 rounded-full font-semibold bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]">{count}</button>
                ))}
            </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {step.options?.map(opt => <button key={opt as string} onClick={() => handleWizardSelect(step.key as any, opt as string)} className="p-3 bg-[var(--bg-primary)] text-sm font-semibold border border-[var(--border-color)] rounded-lg hover:bg-[var(--accent)]/[.1] hover:border-[var(--accent)]">{opt as string}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if(tempWizardInput) handleWizardSelect(step.key as any, tempWizardInput); }}>
              <input type="text" value={tempWizardInput} onChange={e => setTempWizardInput(e.target.value)} placeholder={step.placeholder} className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg" />
              <button type="submit" className="mt-4 w-full px-5 py-2.5 bg-[var(--accent)] text-white font-semibold rounded-full hover:bg-[var(--accent-hover)]">{t('next')}</button>
            </form>
          </>
        )}
      </div>
    );
  };


  if (mode === 'ad') {
    return (
      <div className="bg-[var(--bg-secondary)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl transition-all animate-fade-in">
        <div className="flex items-center mb-6">
          <button onClick={() => { setMode('main'); setAdWizardStep(0); setShowAdConfirmation(false); }} className="p-2 mr-2 rounded-full hover:bg-[var(--bg-tertiary)]"><ChevronLeftIcon className="w-6 h-6"/></button>
          <h2 className="text-2xl font-bold font-serif">{t('adWizardTitle')}</h2>
        </div>
        {renderAdWizard()}
      </div>
    );
  }

  if (mode === 'wizard') {
    return (
      <div className="bg-[var(--bg-secondary)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl transition-all animate-fade-in">
        <div className="flex items-center mb-6">
            <button onClick={() => { setMode('main'); setWizardStep(0); }} className="p-2 mr-2 rounded-full hover:bg-[var(--bg-tertiary)]"><ChevronLeftIcon className="w-6 h-6"/></button>
            <h2 className="text-2xl font-bold font-serif">{t('storyWizardTitle')}</h2>
        </div>
        {renderStoryWizard()}
      </div>
    );
  }

  // MAIN RENDER
  return (
    <div className="bg-[var(--bg-secondary)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] shadow-xl transition-all animate-fade-in">
        <div className="mb-6 p-4 border-2 border-dashed border-[var(--border-color)]/[.5] rounded-lg text-center">
            {uploadedImage ? (
                <div className="relative group w-32 h-32 mx-auto">
                    <img src={uploadedImage.dataUrl} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg"/>
                    <button onClick={() => {setUploadedImage(null); if(fileInputRef.current) fileInputRef.current.value = '';}} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">{t('imageInspiration')}</p>
                </div>
            ) : (
                <>
                    <label htmlFor="image-upload" className="cursor-pointer group flex flex-col items-center">
                        <UploadIcon className="w-8 h-8 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                        <span className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{t('startWithImage')}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{t('startWithImageOptional')}</span>
                    </label>
                    <input id="image-upload" ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="image/png, image/jpeg, image/webp" />
                </>
            )}
        </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col h-full space-y-4">
            <div>
                <label htmlFor="story-prompt" className="block text-xl font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                    <PencilIcon className="w-6 h-6" />
                    {t('customStoryTitle')}
                </label>
                <textarea
                  id="story-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={t('customStoryPlaceholder')}
                  className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] transition-colors min-h-[120px]"
                  disabled={isLoading}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('imageStyle')}</label>
                <ImageStyleSelector current={imageStyle} onSelect={setImageStyle} t={t} />
            </div>

            <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{t('pageCount')}</label>
                <div className="flex justify-center gap-2">
                    {pageCountOptions.map(count => (
                        <button key={count} type="button" onClick={() => setPageCount(count)}
                            className={`w-10 h-10 rounded-full font-semibold transition-colors ${pageCount === count ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'}`}>
                            {count}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleCustomSubmit} className="mt-auto pt-4">
              <button
                type="submit"
                disabled={isLoading || !customPrompt.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 bg-[var(--accent)] text-white font-semibold rounded-full shadow-lg hover:bg-[var(--accent-hover)] disabled:bg-slate-600 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="w-5 h-5"/>
                <span>{t('createStoryBtn')}</span>
              </button>
            </form>
        </div>
        <div className="flex flex-col gap-4 mt-8 md:mt-0">
            <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-[var(--text-secondary)] mb-3">{t('otherWays')}</h3>
            </div>
             <button onClick={() => setMode('ad')} className="flex items-center text-left w-full p-4 bg-[var(--bg-tertiary)]/[.3] hover:bg-[var(--accent)]/[.1] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-lg transition-all">
                <VideoCameraIcon className="w-10 h-10 mr-4 text-[var(--accent)] flex-shrink-0"/>
                <div>
                    <span className="font-semibold text-[var(--text-primary)]">{t('adMakerTitle')}</span>
                    <span className="block text-sm text-[var(--text-secondary)] mt-1">{t('adMakerDescription')}</span>
                </div>
              </button>
              <button onClick={() => setMode('wizard')} className="flex items-center text-left w-full p-4 bg-[var(--bg-tertiary)]/[.3] hover:bg-[var(--accent)]/[.1] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-lg transition-all">
                <LightBulbIcon className="w-10 h-10 mr-4 text-[var(--accent)] flex-shrink-0"/>
                <div>
                    <span className="font-semibold text-[var(--text-primary)]">{t('wizardTitle')}</span>
                    <span className="block text-sm text-[var(--text-secondary)] mt-1">{t('wizardDescription')}</span>
                </div>
              </button>
        </div>
      </div>
    </div>
  );
};

export default StoryInputForm;