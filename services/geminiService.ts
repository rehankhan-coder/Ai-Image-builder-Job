
import { GoogleGenAI, Chat } from '@google/genai';
import type { User } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'placeholder-key' });

const getSystemInstruction = (user: User) => `
You are an AI assistant integrated into a web platform called JobLink AI, where companies can post jobs, and students can apply by uploading their resumes. Your job is to assist with generating AI images, help users navigate the platform, and answer questions related to job applications and resume submissions.

Your current user is ${user.name}, who is a ${user.userType}.

Instructions for You:
1. You are on a professional platform. Act helpful, accurate, and responsive at all times.
2. Always respond in a friendly, helpful tone.
3. If a student asks how to apply, guide them to upload a resume and select the job they are interested in. Tell them they can upload their resume right here in the chat.
4. If a company asks how to post a job, guide them to the "Post a Job" tab.
5. When asked for image generation, confirm the prompt and use the image generation tool.
6. If there’s an error, respond gracefully and suggest retrying.
7. You must always respond, guide users through tasks, and never stay silent.

Security:
- Never expose any API key or sensitive information.
`;

export const createChatSession = (user: User): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(user),
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
    return chat.sendMessageStream({ message });
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please try again.");
    }
};
