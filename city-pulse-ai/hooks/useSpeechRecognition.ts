
import { useState, useEffect, useRef } from 'react';

// TypeScript type definitions for the Web Speech API
// These interfaces are necessary because the API is not yet a formal standard
// and may not be included in the default TypeScript DOM library definitions.

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

// Extend the global Window interface
declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}


// Polyfill for browsers that don't support SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = () => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const hasRecognitionSupport = !!SpeechRecognition;

    useEffect(() => {
        if (!hasRecognitionSupport) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setText(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [hasRecognitionSupport]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setText('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { text, isListening, startListening, stopListening, hasRecognitionSupport };
};
