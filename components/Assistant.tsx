
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChatSession, sendMessageStream, generateImage, editImage } from '../services/geminiService';
import type { User, ChatMessage } from '../types';
import { MessageSender, AssistantMode } from '../types';
import { ChatBubbleLeftRightIcon, PhotoIcon, PaperAirplaneIcon, SparklesIcon, PaintBrushIcon, ArrowUpOnSquareIcon, XCircleIcon } from './icons';
import type { Chat } from '@google/genai';

interface AssistantProps {
  user: User;
}

const Assistant: React.FC<AssistantProps> = ({ user }) => {
  const [mode, setMode] = useState<AssistantMode>(AssistantMode.CHAT);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const [editedImageText, setEditedImageText] = useState<string | null>(null);

  const chatSession = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSession.current = createChatSession(user);
    setChatHistory([{
      sender: MessageSender.ASSISTANT,
      text: `Hello ${user.name}! I'm your AI assistant. How can I help you today? You can ask me about job applications, platform features, or even ask me to generate or edit an image.`
    }]);
  }, [user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleSendMessage = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: MessageSender.USER, text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    setError(null);

    const assistantMessage: ChatMessage = { sender: MessageSender.ASSISTANT, text: "" };
    setChatHistory(prev => [...prev, assistantMessage]);

    try {
      if (!chatSession.current) throw new Error("Chat session not initialized.");
      const stream = await sendMessageStream(chatSession.current, currentPrompt);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage && lastMessage.sender === MessageSender.ASSISTANT) {
            lastMessage.text += chunkText;
            return updatedHistory;
          }
          return prev;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      setChatHistory(prev => [...prev, { sender: MessageSender.ASSISTANT, text: `Sorry, something went wrong: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  }, [prompt, isLoading]);

  const handleEditImage = useCallback(async () => {
    if (!prompt.trim() || !sourceImageFile || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setEditedImageText(null);

    try {
        const base64Data = await fileToBase64(sourceImageFile);
        const { imageUrl, text } = await editImage(base64Data, sourceImageFile.type, prompt);
        setGeneratedImage(imageUrl);
        setEditedImageText(text);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
        setPrompt('');
    }
  }, [prompt, isLoading, sourceImageFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.type.startsWith('image/')) {
            setSourceImageFile(file);
            setGeneratedImage(null);
            setError(null);
        } else {
            setError('Please select a valid image file (e.g., PNG, JPG, WEBP).');
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === AssistantMode.CHAT) {
      handleSendMessage();
    } else if (mode === AssistantMode.IMAGE) {
      handleGenerateImage();
    } else {
      handleEditImage();
    }
  };
  
  const handleModeChange = (newMode: AssistantMode) => {
    setMode(newMode);
    setPrompt('');
    setError(null);
    setGeneratedImage(null);
    setEditedImageText(null);
    setSourceImageFile(null);
  };

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === MessageSender.USER ? 'justify-end' : ''}`}>
            {msg.sender === MessageSender.ASSISTANT && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 shadow-md"><SparklesIcon className="w-5 h-5"/></div>}
            <div className={`max-w-md p-3 rounded-2xl ${msg.sender === MessageSender.USER ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && chatHistory[chatHistory.length - 1]?.sender === MessageSender.ASSISTANT && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0 shadow-md"><SparklesIcon className="w-5 h-5"/></div>
            <div className="max-w-md p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-lg">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderImageGenerator = () => (
    <div className="p-4 text-center h-full flex flex-col items-center justify-center">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">AI Creative Studio</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">Powered by Rehan Khan</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Describe the image you want to create. Be as descriptive as possible for the best results!</p>
      </div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Generating your masterpiece...</p>
        </div>
      )}
      {error && <div className="my-4 p-3 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-lg">{error}</div>}
      {generatedImage && !isLoading && (
        <div className="my-6">
          <img src={generatedImage} alt="Generated by AI" className="rounded-lg shadow-lg mx-auto max-w-full h-auto" />
        </div>
      )}
    </div>
  );

  const renderImageEditor = () => (
    <div className="p-4 text-center h-full flex flex-col items-center justify-center">
        {!sourceImageFile ? (
            <div>
                 <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200">AI Image Editor</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Powered by Gemini NanoBanana</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Upload an image and tell me how you'd like to change it. For example: "add a hat on the cat".</p>
                 <label htmlFor="image-upload" className="cursor-pointer group">
                     <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors">
                         <ArrowUpOnSquareIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                         <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">Click to upload an image</p>
                         <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP up to 4MB</p>
                     </div>
                 </label>
                 <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                 {error && <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-lg">{error}</div>}
            </div>
        ) : (
             <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center my-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Applying magic edits...</p>
                    </div>
                )}
                {error && <div className="my-4 p-3 text-sm text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50 rounded-lg max-w-2xl w-full">{error}</div>}
                 
                {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mx-auto flex-1 items-center">
                    <div className="relative group">
                        <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 rounded-full">Original</p>
                        <img src={URL.createObjectURL(sourceImageFile)} alt="Source for editing" className="rounded-lg shadow-lg w-full h-auto" />
                        <button onClick={() => setSourceImageFile(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors" aria-label="Remove image">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="relative">
                        <p className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 rounded-full">Edited</p>
                        <div className="rounded-lg shadow-lg w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {generatedImage ? (
                                <img src={generatedImage} alt="Generated by AI" className="rounded-lg w-full h-full object-contain" />
                            ) : (
                                <PhotoIcon className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                            )}
                        </div>
                    </div>
                </div>}

                {editedImageText && !isLoading && (
                    <div className="mt-4 p-3 text-sm text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800 rounded-lg max-w-2xl w-full">
                        <p>{editedImageText}</p>
                    </div>
                )}
             </div>
        )}
    </div>
  );

  return (
    <div className="flex flex-col h-full -m-6 md:-m-8">
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="p-1 inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button onClick={() => handleModeChange(AssistantMode.CHAT)} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-all ${mode === AssistantMode.CHAT ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
            Chat
          </button>
          <button onClick={() => handleModeChange(AssistantMode.IMAGE)} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-all ${mode === AssistantMode.IMAGE ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
            <PhotoIcon className="w-5 h-5 mr-2" />
            Generate Image
          </button>
          <button onClick={() => handleModeChange(AssistantMode.IMAGE_EDIT)} className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center transition-all ${mode === AssistantMode.IMAGE_EDIT ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>
            <PaintBrushIcon className="w-5 h-5 mr-2" />
            Edit Image
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {mode === AssistantMode.CHAT && renderChat()}
        {mode === AssistantMode.IMAGE && renderImageGenerator()}
        {mode === AssistantMode.IMAGE_EDIT && renderImageEditor()}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === AssistantMode.CHAT ? 'Ask me anything...' :
              mode === AssistantMode.IMAGE ? 'Describe an image... e.g., a cat in a spacesuit' :
              'Describe your edit... e.g., make the cat wear a party hat'
            }
            className="w-full pl-4 pr-16 py-3 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-lg focus:outline-none focus:ring-0 transition-colors"
            disabled={isLoading || (mode === AssistantMode.IMAGE_EDIT && !sourceImageFile)}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || (mode === AssistantMode.IMAGE_EDIT && !sourceImageFile)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white disabled:from-slate-400 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 transform hover:scale-110 disabled:scale-100"
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assistant;
