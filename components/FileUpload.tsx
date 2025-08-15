import React, { useState } from 'react';
import { UploadCloudIcon, MagicWandIcon } from './icons';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onSampleSelect: () => void;
    setError: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onSampleSelect, setError }) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
            onFileSelect(droppedFile);
        } else {
            setError("Please drop an image or PDF file.");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fadeIn">
            <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-300 w-full ${isDragging ? 'border-blue-400 bg-blue-100' : 'border-blue-300 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'}`}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <UploadCloudIcon className="w-16 h-16 mx-auto text-blue-400" />
                <h3 className="mt-4 text-xl font-semibold text-slate-800">Upload your answer sheet</h3>
                <p className="mt-2 text-sm text-slate-500">Drag & drop an image or PDF file or click to select</p>
                 <div className="mt-4 text-xs text-gray-400">
                    Supports: JPG, PNG, PDF • Max size: 10MB
                </div>
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    id="file-upload"
                    aria-label="File uploader"
                />
            </div>
             <div className="mt-6 flex items-center gap-2">
                <span className="text-slate-500">or</span>
                <button
                    onClick={onSampleSelect}
                    className="flex items-center gap-2 px-4 py-2 font-semibold text-indigo-600 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    <MagicWandIcon className="w-5 h-5" />
                    Try with a Sample
                </button>
            </div>
        </div>
    );
};