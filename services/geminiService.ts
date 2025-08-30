import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { StoryPageData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const storyGenerationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: {
        type: Type.STRING,
        description: "A paragraph of the story for a single page. It should be engaging for the reader. If generating an ad script, this should be the narration for the scene.",
      },
      imagePrompt: {
        type: Type.STRING,
        description: "A detailed, vivid, and artistic prompt for an AI image generator to create an illustration for this part of the story. Describe characters, setting, mood, and style. Example: 'A cute, fluffy red panda wearing a tiny wizard hat, standing in an enchanted, glowing forest at twilight, digital art, fantasy style.' If the user provided a source image, ensure the character or product from the source image is consistently described in every prompt.",
      },
    },
    required: ["text", "imagePrompt"],
  },
};

export async function generateStoryPages(prompt: string | object): Promise<StoryPageData[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt, // Can be string or { parts: [...] }
      config: {
        responseMimeType: "application/json",
        responseSchema: storyGenerationSchema,
      },
    });

    const jsonText = response.text.trim();
    // A simple check to see if the response looks like JSON before parsing
    if (!jsonText.startsWith('[') || !jsonText.endsWith(']')) {
       throw new Error("AI returned a non-JSON response. Please try again.");
    }

    const pages = JSON.parse(jsonText) as StoryPageData[];
    if (!Array.isArray(pages) || pages.length === 0) {
      throw new Error("AI returned an invalid story structure. Please try a different prompt.");
    }
    return pages;
  } catch (error) {
    console.error("Error generating story:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the story from AI. The model returned malformed JSON.");
    }
    throw new Error("Failed to generate story from AI. The model may have returned an unexpected format.");
  }
}

export async function generateImageForPage(prompt: string): Promise<{ imageUrl: string, mimeType: string }> {
  try {
    const mimeType = 'image/png';
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: mimeType,
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
    return { imageUrl, mimeType };
  } catch (error) {
    console.error("Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("Image generation limit reached. Please wait a moment before trying again.");
    }
    throw new Error("Failed to generate image for a story page.");
  }
}

export async function editImageWithGemini(
  base64OriginalImage: string,
  originalMimeType: string,
  editPrompt: string,
  base64MaskImage?: string
): Promise<{ imageUrl: string, mimeType: string }> {
  try {
    const originalImageData = base64OriginalImage.split(',')[1];
    
    const parts: any[] = [
      {
        inlineData: {
          data: originalImageData,
          mimeType: originalMimeType,
        },
      },
      { text: editPrompt },
    ];

    if (base64MaskImage) {
      const maskData = base64MaskImage.split(',')[1];
      // Insert the mask between the original image and the text prompt.
      parts.splice(1, 0, {
        inlineData: {
          data: maskData,
          mimeType: 'image/png', // Masks are sent as PNGs
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      const newMimeType = imagePart.inlineData.mimeType;
      const newBase64Data = imagePart.inlineData.data;
      const newImageUrl = `data:${newMimeType};base64,${newBase64Data}`;
      return { imageUrl: newImageUrl, mimeType: newMimeType };
    } else {
      throw new Error("The AI did not return an edited image.");
    }
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit the image with the provided prompt.");
  }
}


export async function generateSubjectMask(
  base64OriginalImage: string,
  originalMimeType: string
): Promise<{ imageUrl: string, mimeType: string }> {
  try {
    const originalImageData = base64OriginalImage.split(',')[1];
    
    const parts = [
      {
        inlineData: {
          data: originalImageData,
          mimeType: originalMimeType,
        },
      },
      { text: "Task: Create a binary segmentation mask for the most prominent subject in this image. The subject must be solid white (#FFFFFF) and the background must be solid black (#000000). Return only the image file without any text." },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE], // We only expect an image back
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData) {
      const newMimeType = imagePart.inlineData.mimeType;
      const newBase64Data = imagePart.inlineData.data;
      const newImageUrl = `data:${newMimeType};base64,${newBase64Data}`;
      return { imageUrl: newImageUrl, mimeType: newMimeType };
    } else {
      throw new Error("The AI did not return a mask image.");
    }
  } catch (error) {
    console.error("Error generating subject mask:", error);
    throw new Error("Failed to generate the subject mask with AI.");
  }
}