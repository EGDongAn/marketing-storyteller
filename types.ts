export interface StoryPage {
  id: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string; // Can be undefined while generating
  mimeType?: string; // Can be undefined while generating
  imageStatus: 'pending' | 'success' | 'error';
}

// Type for the initial story structure returned by Gemini
export interface StoryPageData {
  text: string;
  imagePrompt: string;
}

export interface Bubble {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: 'rounded' | 'oval';
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}