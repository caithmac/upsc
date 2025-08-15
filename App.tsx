import React, { useState, useCallback } from 'react';
import { EnhancedFeedback } from './types';
import { gradeAnswerSheet, transcribeAnswerSheet } from './services/geminiService';
import { AlertTriangleIcon, EditIcon, FileTextIcon, CheckIcon, ClockIcon, ShieldIcon } from './components/icons';
import { useFilePreview } from './hooks/useFilePreview';
import { sampleEnhancedFeedback } from './sample-data';
import { FileUpload } from './components/FileUpload';
import { LoadingIndicator } from './components/LoadingIndicator';
import { TranscriptionReview } from './components/TranscriptionReview';
import { FeedbackReport } from './components/FeedbackReport';

type AppState = 'initial' | 'file_uploaded' | 'transcribing' | 'reviewing_transcription' | 'grading' | 'feedback_ready';

// Sub-component for Progress Indicator
interface StepProps {
    number: number;
    title: string;
    active: boolean;
    completed: boolean;
}
const Step: React.FC<StepProps> = ({ number, title, active, completed }) => {
    const circleClasses = completed
        ? 'bg-blue-600 text-white'
        : active
        ? 'border-2 border-blue-600 text-blue-600'
        : 'border-2 border-gray-300 text-gray-500';
    const textClasses = active || completed ? 'text-blue-600 font-semibold' : 'text-gray-500';

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${circleClasses}`}>
                {completed ? <CheckIcon className="w-5 h-5" /> : number}
            </div>
            <p className={`text-sm ${textClasses}`}>{title}</p>
        </div>
    );
};

const ProgressIndicator: React.FC<{ step: number }> = ({ step }) => (
    <div className="w-full max-w-md mx-auto mb-12 animate-fadeIn">
        <div className="flex items-center justify-center">
            <Step number={1} title="Upload" active={step === 1} completed={step > 1} />
            <div className={`w-full h-0.5 mx-4 ${step > 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <Step number={2} title="Review" active={step === 2} completed={step > 2} />
            <div className={`w-full h-0.5 mx-4 ${step > 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <Step number={3} title="Results" active={step === 3} completed={step > 3} />
        </div>
    </div>
);


const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<EnhancedFeedback[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [appState, setAppState] = useState<AppState>('initial');
    const [transcribedParts, setTranscribedParts] = useState<string[]>([]);
    const [isSample, setIsSample] = useState<boolean>(false);

    const filePreview = useFilePreview(file);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setFeedback(null);
        setError(null);
        setAppState('file_uploaded');
    };

    const handleTranscribe = useCallback(async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setAppState('transcribing');
        setError(null);
        try {
            const result = await transcribeAnswerSheet(file);
            const parts = result.split('--- Q&A SEPARATOR ---').map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length === 0) {
                 setError("The AI could not find any questions or answers in the document. The document might be blank or the handwriting illegible.");
                 setAppState('file_uploaded');
            } else {
                setTranscribedParts(parts);
                setAppState('reviewing_transcription');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during transcription.");
            setAppState('file_uploaded');
        }
    }, [file]);

    const handleGrade = useCallback(async () => {
        if (!file || transcribedParts.length === 0) {
            setError("Cannot grade without a file and its transcription.");
            setAppState('reviewing_transcription');
            return;
        }
        setAppState('grading');
        setError(null);
        setFeedback(null);

        try {
            const fullTranscription = transcribedParts.join('\n\n--- Q&A SEPARATOR ---\n\n');
            const result = await gradeAnswerSheet(file, fullTranscription);
            setFeedback(result);
            setAppState('feedback_ready');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during grading.");
            setAppState('reviewing_transcription');
        }
    }, [file, transcribedParts]);
    
    const handleTranscriptionPartChange = (index: number, value: string) => {
        const newParts = [...transcribedParts];
        newParts[index] = value;
        setTranscribedParts(newParts);
    };

    const handleReset = () => {
        setFile(null);
        setFeedback(null);
        setError(null);
        setTranscribedParts([]);
        setAppState('initial');
        setIsSample(false);
    };

    const handleSampleSelect = () => {
        setFile(null); // No actual file for sample
        setFeedback(sampleEnhancedFeedback);
        setAppState('feedback_ready');
        setIsSample(true);
        setError(null);
    };
    
    const renderPreviewAndTranscribeButton = () => (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fadeIn">
            <div className="w-full p-4 bg-white rounded-lg shadow-md border border-slate-200">
                {file?.type.startsWith('image/') ? (
                    <img src={filePreview!} alt="Answer sheet preview" className="w-full h-auto rounded-md object-contain max-h-96" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-100 rounded-md">
                        <FileTextIcon className="w-20 h-20 text-slate-400" />
                        <p className="mt-4 text-lg font-medium text-slate-700">PDF Document</p>
                    </div>
                )}
                <p className="text-center mt-3 text-sm font-medium text-slate-600 truncate">{file?.name}</p>
            </div>
            <button
                onClick={handleTranscribe}
                className="flex items-center justify-center gap-2 px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
            >
                <EditIcon className="w-5 h-5" />
                Transcribe Answer
            </button>
        </div>
    );
    
    const renderContent = () => {
        if (error) {
             return (
                <div className="text-center py-12 animate-fadeIn">
                  <AlertTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {error}
                  </p>
                  <button onClick={handleReset} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">
                    Try Again
                  </button>
                </div>
            );
        }
        
        switch (appState) {
            case 'initial':
                return <FileUpload onFileSelect={handleFileSelect} onSampleSelect={handleSampleSelect} setError={setError} />;
            case 'file_uploaded':
                return renderPreviewAndTranscribeButton();
            case 'transcribing':
                return <LoadingIndicator stage="transcribing" />;
            case 'reviewing_transcription':
                return <TranscriptionReview 
                    file={file}
                    filePreview={filePreview}
                    transcribedParts={transcribedParts}
                    onTranscriptionPartChange={handleTranscriptionPartChange}
                    onGrade={handleGrade}
                    onReset={handleReset}
                />;
            case 'grading':
                 return <LoadingIndicator stage="grading" />;
            case 'feedback_ready':
                return <FeedbackReport feedback={feedback} onReset={handleReset} isSample={isSample} />;
            default:
                return <FileUpload onFileSelect={handleFileSelect} onSampleSelect={handleSampleSelect} setError={setError} />;
        }
    }
    
    const currentStep = {
        'initial': 1, 'file_uploaded': 1,
        'transcribing': 2, 'reviewing_transcription': 2,
        'grading': 3, 'feedback_ready': 3
    }[appState];

    return (
        <main className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 sm:p-8">
             <header className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  AI Grader for Civil Services
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8">
                  Get instant, detailed feedback on your handwritten answers to excel in your exams.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                      UPSC Pattern Analysis
                    </span>
                    <span className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-blue-500 mr-2" />
                      Instant Results
                    </span>
                    <span className="flex items-center">
                      <ShieldIcon className="w-4 h-4 text-purple-500 mr-2" />
                      AI-Powered Accuracy
                    </span>
                </div>
            </header>

            <div className="flex flex-col items-center justify-center">
                {!error && <ProgressIndicator step={currentStep} />}
                {renderContent()}
            </div>
        </main>
    );
};

export default App;