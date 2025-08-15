import React from 'react';
import { FileTextIcon, SparklesIcon } from './icons';

interface TranscriptionReviewProps {
    file: File | null;
    filePreview: string | null;
    transcribedParts: string[];
    onTranscriptionPartChange: (index: number, value: string) => void;
    onGrade: () => void;
    onReset: () => void;
}

const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
};

export const TranscriptionReview: React.FC<TranscriptionReviewProps> = ({
    file,
    filePreview,
    transcribedParts,
    onTranscriptionPartChange,
    onGrade,
    onReset
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-4">
                 <h2 className="text-2xl font-bold text-slate-800">Your Answer Sheet</h2>
                 <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200 sticky top-8">
                      {file?.type.startsWith('image/') ? (
                         <img src={filePreview!} alt="Answer sheet" className="w-full h-auto rounded-md object-contain max-h-[70vh]" />
                     ) : (
                         <div className="flex flex-col items-center justify-center py-8 bg-slate-100 rounded-md">
                             <FileTextIcon className="w-24 h-24 text-slate-400" />
                             <p className="mt-4 text-lg font-medium text-slate-700">PDF Document</p>
                             <p className="mt-1 text-sm text-slate-500 truncate max-w-xs">{file?.name}</p>
                         </div>
                     )}
                 </div>
            </div>
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Review Transcriptions</h2>
                    <p className="text-slate-600 mt-1">The AI has identified {transcribedParts.length} answer(s). Please review and edit each one to ensure accuracy before grading.</p>
                </div>

                {transcribedParts.map((part, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                        <label htmlFor={`transcription-${index}`} className="block text-sm font-bold text-slate-700 mb-2">Answer #{index + 1}</label>
                        <textarea
                            id={`transcription-${index}`}
                            value={part}
                            onChange={(e) => onTranscriptionPartChange(index, e.target.value)}
                            className="w-full h-60 p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                            aria-label={`Transcribed text editor for answer ${index + 1}`}
                        />
                        <div className="text-right text-sm text-slate-500 mt-2 font-medium">
                            Word Count: {countWords(part)}
                        </div>
                    </div>
                ))}
               
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                     <button
                        onClick={onGrade}
                        disabled={transcribedParts.length === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Proceed to Grade
                    </button>
                    <button
                        onClick={onReset}
                        className="w-full sm:w-auto px-6 py-3 font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        </div>
    );
};