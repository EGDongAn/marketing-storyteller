# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Marketing Storyteller** application that generates AI-powered visual stories for marketing campaigns. It uses Google's Gemini AI (Imagen and Flash models) to create illustrated stories from user prompts or uploaded images, with support for multiple languages and themes.

## Core Technologies

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini AI (@google/genai)
  - Text Generation: gemini-2.5-flash
  - Image Generation: imagen-4.0-generate-001
  - Image Editing: gemini-2.5-flash-image-preview
- **Styling**: CSS with custom theming system (dark, light, synthwave)
- **i18n**: Custom translation system (English, Korean)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Create `.env.local` file with:
```env
GEMINI_API_KEY=your_api_key_here
```

## Architecture

### Component Structure
```
/components
  StoryInputForm    # Handles user input and image upload
  StoryViewer       # Displays generated story pages
  ImageEditorModal  # AI-powered image editing with masking
  LoadingIndicator  # Loading states with i18n messages
  icons.tsx         # Custom SVG icon components

/services
  geminiService.ts  # All Gemini AI integrations
```

### Key Features

1. **Story Generation Flow**:
   - User provides text prompt or uploads image + prompt
   - System generates multi-page story with structured JSON schema
   - Each page gets AI-generated illustration matching the narrative
   - Support for style regeneration with different visual themes

2. **Image Editing Capabilities**:
   - AI-powered image editing with text prompts
   - Subject mask generation for selective editing
   - Canvas-based drawing for manual mask creation
   - History management with undo/redo

3. **Internationalization**:
   - Dynamic language switching (en, ko)
   - Comprehensive translation coverage
   - Theme-aware UI (dark, light, synthwave)

### State Management

The app uses React's useState for state management:
- `storyConfig`: Current story generation configuration
- `storyPages`: Generated story pages with images
- `editingPage`: Active page being edited
- `language`/`theme`: UI preferences

### Error Handling

- Rate limit detection with user-friendly messages
- JSON parsing validation for AI responses
- Graceful degradation for failed image generation
- Comprehensive error translation support

## API Integration Points

### Gemini Service Methods

- `generateStoryPages(prompt)`: Creates story structure with text and image prompts
- `generateImageForPage(prompt)`: Generates illustrations for story pages
- `editImageWithGemini(image, prompt, mask?)`: AI-powered image editing
- `generateSubjectMask(image)`: Creates segmentation masks for editing

### Response Schema

Stories are generated with strict JSON schema validation:
```typescript
{
  text: string,        // Story narration for the page
  imagePrompt: string  // Detailed prompt for illustration
}[]
```

## Performance Considerations

- Images are handled as base64 data URLs
- Vite's path aliasing configured with `@/` prefix
- TypeScript with strict mode disabled (noEmit: true)
- Environment variables injected at build time via Vite

## Deployment Notes

- Application connects to AI Studio (Google's platform)
- Requires valid Gemini API key with appropriate quotas
- Rate limiting considerations for image generation
- All AI processing happens client-side via API calls