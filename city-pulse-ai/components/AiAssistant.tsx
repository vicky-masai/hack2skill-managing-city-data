
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ImagePayload } from '../types';
import { SendIcon, MicIcon, Loader2Icon, BotMessageSquareIcon, UserIcon, PaperclipIcon, XIcon } from './icons/Icons';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { toast } from 'sonner';

interface AiAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, image?: ImagePayload, previewUrl?: string | null) => void;
  isLoading: boolean;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePayload, setImagePayload] = useState<ImagePayload | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { text, isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

  useEffect(() => {
    if (text) {
      setInput(text);
    }
  }, [text]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const resetAllInput = () => {
    setInput('');
    setImagePreview(null);
    setImagePayload(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSend = () => {
    if (input.trim() || imagePayload) {
      onSendMessage(input.trim(), imagePayload ?? undefined, imagePreview);
      resetAllInput();
    }
  };
  
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetAllInput();
      startListening();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
        toast.error('Image size should be less than 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const [header, data] = base64String.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        
        if(mimeType && data) {
            setImagePreview(base64String);
            setImagePayload({ mimeType, data });
        } else {
            toast.error('Could not process the selected file.');
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read file.');
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800/50 rounded-l-lg">
      <div className="p-4 border-b border-gray-700/50 flex items-center space-x-3">
        <BotMessageSquareIcon className="w-6 h-6 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ai' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><BotMessageSquareIcon className="w-5 h-5 text-indigo-400" /></div>}
            <div className={`max-w-xs md:max-w-md rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-200 rounded-bl-lg'}`}>
              {msg.image && (
                <img src={msg.image} alt="User upload" className="rounded-t-lg w-full h-auto object-cover"/>
              )}
              {msg.text && (
                 <p className="text-sm whitespace-pre-wrap p-3">{msg.text}</p>
              )}
            </div>
             {msg.sender === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-400" /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><BotMessageSquareIcon className="w-5 h-5 text-indigo-400" /></div>
            <div className="px-4 py-3 bg-gray-700 rounded-2xl rounded-bl-lg">
              <Loader2Icon className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700/50">
        {imagePreview && (
            <div className="relative mb-2">
                <img src={imagePreview} alt="Preview" className="max-h-40 w-auto rounded-lg" />
                <button onClick={() => { setImagePreview(null); setImagePayload(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        <div className="flex items-center bg-gray-700 rounded-lg p-1">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-600 text-gray-400 rounded-full transition-colors">
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Listening..." : "Report an issue..."}
            rows={1}
            className="flex-1 bg-transparent p-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none resize-none"
            style={{maxHeight: '100px'}}
          />
           {hasRecognitionSupport && (
            <button
                onClick={handleVoiceClick}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-600 text-gray-400'}`}
            >
                <MicIcon className="w-5 h-5" />
            </button>
           )}
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !imagePayload) || isLoading}
            className="p-2 ml-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
