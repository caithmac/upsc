import React, { useState } from 'react';
import { EnhancedFeedback } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, KeyIcon, LayoutIcon, BarChart3Icon, LightbulbIcon, BookOpenIcon, ArrowRightIcon, DownloadIcon, PlusIcon, ShareIcon, QuestionMarkCircleIcon } from './icons';

interface FeedbackReportProps {
    feedback: EnhancedFeedback[] | null;
    onReset: () => void;
    isSample: boolean;
}

// Tooltip Component
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs text-white bg-slate-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {content}
            </div>
        </div>
    );
};

const getScoreLabel = (score: number): string => {
    if (score >= 7.5) return "Excellent";
    if (score >= 5) return "Good";
    return "Needs Improvement";
};

const getScoreColor = (score: number): string => {
    if (score >= 7.5) return "bg-green-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-red-500";
};

const SummaryCard: React.FC<{ feedback: EnhancedFeedback[] }> = ({ feedback }) => {
    const avgScore = feedback.reduce((acc, fb) => acc + fb.overallScore, 0) / feedback.length;

    return (
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100 animate-slideInUp">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Overall Performance</h2>
                    <p className="text-gray-600">{feedback.length} question(s) analyzed</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{avgScore.toFixed(1)}/10</div>
                    <div className="text-sm font-semibold text-gray-600">
                        {getScoreLabel(avgScore)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScoreBreakdown: React.FC<{ scores: EnhancedFeedback['dimensionalScores'] }> = ({ scores }) => {
    const scoreItems = [
        { key: 'contentAccuracy', label: "Content Accuracy", tooltip: "How factually correct and relevant your answer is." },
        { key: 'structurePresentation', label: "Structure", tooltip: "The logical flow, introduction, body, and conclusion." },
        { key: 'analyticalDepth', label: "Analytical Depth", tooltip: "Your ability to critically analyze and form arguments." },
        { key: 'examplesQuality', label: "Examples", tooltip: "Relevance and quality of examples used to support claims." },
        { key: 'keywordUsage', label: "Keywords", tooltip: "Use of specific, relevant terminology for the subject." },
        { key: 'currentAffairsRelevance', label: "Current Affairs", tooltip: "Integration of recent events and developments." },
    ];

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3Icon className="w-5 h-5 text-indigo-600" /> Score Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scoreItems.map((item) => {
                    const score = scores[item.key as keyof typeof scores]
                    return (
                        <div key={item.key}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center space-x-1">
                                    <span className="text-sm font-medium text-gray-600">{item.label}</span>
                                    <Tooltip content={item.tooltip}>
                                        <QuestionMarkCircleIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                    </Tooltip>
                                </div>
                                <span className="text-sm font-bold">{score.toFixed(1)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${getScoreColor(score)}`}
                                    style={{ width: `${(score / 10) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, onReset, isSample }) => {
    if (!feedback) return null;

    const handleDownload = () => {
        window.print();
    };

    const handleShare = async () => {
        const avgScore = feedback.reduce((acc, fb) => acc + fb.overallScore, 0) / feedback.length;
        const shareData = {
            title: 'UPSC AI Grader Report',
            text: `I just got my answer graded by the AI Grader and scored ${avgScore.toFixed(1)}/10! Check out this tool.`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                alert("Share feature is not supported on your browser.");
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 animate-fadeIn">
            <div id="print-area">
                <header className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800">AI Feedback Report</h2>
                    <p className="text-slate-600 mt-1">{isSample ? "This is a sample report to demonstrate the AI's capability." : "Here is the detailed evaluation of your answers."}</p>
                </header>

                <SummaryCard feedback={feedback} />

                <div className="space-y-10">
                    {feedback.map((fb, index) => (
                        <div key={index} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 animate-slideInUp" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="pb-4 border-b border-slate-200">
                                <p className="text-sm font-semibold text-indigo-600">Question {index + 1}</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{fb.question}</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                                <div className="lg:col-span-3 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6" /> Strengths</h3>
                                            <ul className="mt-2 pl-5 list-disc space-y-1 text-slate-700">{fb.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-amber-700 flex items-center gap-2"><AlertTriangleIcon className="w-6 h-6" /> Areas for Improvement</h3>
                                            <ul className="mt-2 pl-5 list-disc space-y-1 text-slate-700">{fb.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><LightbulbIcon className="w-5 h-5 text-yellow-600" /> Improvement Suggestions</h4>
                                        <ul className="space-y-2 text-slate-700 pl-6">{fb.improvementSuggestions.map((item, i) => <li key={i} className="relative before:content-['•'] before:absolute before:left-[-1em] before:text-indigo-500">{item}</li>)}</ul>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <ScoreBreakdown scores={fb.dimensionalScores} />
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><KeyIcon className="w-5 h-5 text-purple-600" /> Keyword Analysis</h4>
                                        <div>
                                            <h5 className="text-sm font-medium text-green-700">Used Correctly:</h5>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {fb.keywordsAnalysis.used.length > 0 ? fb.keywordsAnalysis.used.map((k, i) => <span key={i} className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-md">{k}</span>) : <span className="text-xs text-slate-500">None</span>}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <h5 className="text-sm font-medium text-amber-700">Should Include:</h5>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {fb.keywordsAnalysis.missing.length > 0 ? fb.keywordsAnalysis.missing.map((k, i) => <span key={i} className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded-md">{k}</span>) : <span className="text-xs text-slate-500">None</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6 no-print">
                <button onClick={handleDownload} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download Report</span>
                </button>
                <button onClick={onReset} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold">
                    <PlusIcon className="w-4 h-4" />
                    <span>{isSample ? 'Grade Your Own' : 'Analyze Another'}</span>
                </button>
                <button onClick={handleShare} className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold">
                    <ShareIcon className="w-4 h-4" />
                    <span>Share Results</span>
                </button>
            </div>
        </div>
    );
};