import type { StoryPage } from '../types';

// Helper to convert data URL to Blob
const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Could not parse MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

export const config = {
    runtime: 'edge',
    maxDuration: 300,
};

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { pages, title } = (await request.json()) as { pages: StoryPage[], title: string };
        const { SUPABASE_URL, SUPABASE_ANON_KEY, NOTION_API_KEY, NOTION_DATABASE_ID, SUPABASE_BUCKET_ID } = process.env;
        
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !NOTION_API_KEY || !NOTION_DATABASE_ID || !SUPABASE_BUCKET_ID) {
            return new Response(JSON.stringify({ error: 'Server configuration missing for save functionality.' }), { status: 500 });
        }

        // --- 1. Upload images to Supabase Storage ---
        const uploadedImageUrls: string[] = [];
        for (const page of pages) {
            if (!page.imageUrl) continue; // Skip pages that failed to generate an image

            const blob = dataURLtoBlob(page.imageUrl);
            const fileName = `story-image-${Date.now()}-${Math.random().toString(36).substring(2)}.png`;
            
            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET_ID}/${fileName}`;

            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': blob.type,
                    'x-upsert': 'true',
                },
                body: blob,
            });

            if (!uploadResponse.ok) {
                const errorBody = await uploadResponse.text();
                console.error(`Supabase upload failed: ${errorBody}`);
                throw new Error(`Failed to upload image ${pages.indexOf(page) + 1}.`);
            }
            
            // Construct the public URL directly
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_ID}/${fileName}`;
            uploadedImageUrls.push(publicUrl);
        }

        // --- 2. Create Notion Page ---
        const notionApiUrl = 'https://api.notion.com/v1/pages';
        const notionBlocks = pages.flatMap((page, index) => {
            const imageUrl = uploadedImageUrls[index];
            if (!imageUrl) return []; // Don't create blocks for missing images

            return [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: `Page ${index + 1}` } }],
                    },
                },
                {
                    object: 'block',
                    type: 'image',
                    image: {
                        type: 'external',
                        external: { url: imageUrl },
                    },
                },
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{ type: 'text', text: { content: page.text || '' } }],
                    },
                },
            ];
        });
        
        const notionPageData = {
            parent: { database_id: NOTION_DATABASE_ID },
            properties: {
                Name: {
                    title: [{ text: { content: title || 'Marketing Story' } }],
                },
            },
            children: notionBlocks,
        };

        const notionResponse = await fetch(notionApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify(notionPageData),
        });

        if (!notionResponse.ok) {
            const errorBody = await notionResponse.json();
            console.error('Notion API error:', errorBody);
            throw new Error('Failed to create Notion page.');
        }

        return new Response(JSON.stringify({ success: true, message: 'Story saved successfully!' }), { status: 200 });

    } catch (error) {
        console.error('Save story handler error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
}