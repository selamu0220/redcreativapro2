'use client';

/**
 * Preprompt Area Component
 * 
 * UI for pasting and managing writing samples for style learning:
 * - Text area for pasting samples
 * - Sample management (view, edit, delete)
 * - Word count display
 * - Minimum word count guidance
 * - Style profile update trigger
 * 
 * Requirements: 4.1, 4.5, 14.1, 14.2, 14.3
 */

import React, { useState, useEffect } from 'react';
import { WritingSample } from '../lib/style-learning-service';

interface PrepromptAreaProps {
    userId: string;
    onSamplesChange?: (samples: WritingSample[]) => void;
    minWordCount?: number;
}

export function PrepromptArea({
    userId,
    onSamplesChange,
    minWordCount = 500
}: PrepromptAreaProps) {
    const [samples, setSamples] = useState<WritingSample[]>([]);
    const [currentSample, setCurrentSample] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const currentWordCount = countWords(currentSample);
    const totalWordCount = samples.reduce((sum, s) => sum + s.wordCount, 0);
    const isValidSample = currentWordCount >= minWordCount;

    useEffect(() => {
        // Load existing samples from localStorage
        loadSamples();
    }, [userId]);

    const loadSamples = () => {
        if (typeof window === 'undefined') return;

        const key = `writing_samples_${userId}`;
        const stored = localStorage.getItem(key);

        if (stored) {
            try {
                const loadedSamples = JSON.parse(stored);
                setSamples(loadedSamples);
            } catch (error) {
                console.error('Failed to load samples', error);
            }
        }
    };

    const saveSamples = (newSamples: WritingSample[]) => {
        if (typeof window === 'undefined') return;

        const key = `writing_samples_${userId}`;
        localStorage.setItem(key, JSON.stringify(newSamples));
        setSamples(newSamples);
        onSamplesChange?.(newSamples);
    };

    const handleAddSample = () => {
        if (!currentSample.trim()) return;

        const newSample: WritingSample = {
            id: `sample-${Date.now()}`,
            content: currentSample,
            wordCount: currentWordCount,
            addedAt: Date.now()
        };

        const newSamples = [...samples, newSample];
        saveSamples(newSamples);
        setCurrentSample('');
    };

    const handleUpdateSample = () => {
        if (!editingId || !currentSample.trim()) return;

        const newSamples = samples.map(s =>
            s.id === editingId
                ? { ...s, content: currentSample, wordCount: currentWordCount }
                : s
        );

        saveSamples(newSamples);
        setEditingId(null);
        setCurrentSample('');
    };

    const handleEditSample = (sample: WritingSample) => {
        setEditingId(sample.id);
        setCurrentSample(sample.content);
        setIsAdding(true);
    };

    const handleDeleteSample = (id: string) => {
        const newSamples = samples.filter(s => s.id !== id);
        saveSamples(newSamples);
    };

    const handleCancel = () => {
        setCurrentSample('');
        setEditingId(null);
        setIsAdding(false);
    };

    return (
        <div className="preprompt-area">
            <div className="preprompt-header">
                <h3>Writing Style Samples</h3>
                <p className="preprompt-description">
                    Add samples of your writing to help AI learn your unique style.
                    Aim for at least {minWordCount} words per sample for best results.
                </p>
            </div>

            {/* Sample Statistics */}
            <div className="preprompt-stats">
                <div className="stat">
                    <span className="stat-label">Samples:</span>
                    <span className="stat-value">{samples.length}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Total Words:</span>
                    <span className="stat-value">{totalWordCount.toLocaleString()}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Status:</span>
                    <span className={`stat-value ${totalWordCount >= minWordCount ? 'ready' : 'insufficient'}`}>
                        {totalWordCount >= minWordCount ? '✓ Ready' : 'Need more words'}
                    </span>
                </div>
            </div>

            {/* Add/Edit Sample Form */}
            {isAdding ? (
                <div className="preprompt-form">
                    <textarea
                        className="preprompt-textarea"
                        value={currentSample}
                        onChange={(e) => setCurrentSample(e.target.value)}
                        placeholder="Paste a sample of your writing here..."
                        rows={12}
                    />

                    <div className="preprompt-form-footer">
                        <div className="word-count">
                            <span className={currentWordCount >= minWordCount ? 'valid' : 'invalid'}>
                                {currentWordCount} words
                            </span>
                            {currentWordCount < minWordCount && (
                                <span className="word-count-hint">
                                    (minimum {minWordCount} words recommended)
                                </span>
                            )}
                        </div>

                        <div className="preprompt-actions">
                            <button onClick={handleCancel} className="btn-secondary">
                                Cancel
                            </button>
                            <button
                                onClick={editingId ? handleUpdateSample : handleAddSample}
                                className="btn-primary"
                                disabled={!currentSample.trim()}
                            >
                                {editingId ? 'Update Sample' : 'Add Sample'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="btn-add-sample"
                >
                    + Add Writing Sample
                </button>
            )}

            {/* Existing Samples List */}
            {samples.length > 0 && (
                <div className="preprompt-samples-list">
                    <h4>Your Samples ({samples.length})</h4>
                    {samples.map((sample) => (
                        <div key={sample.id} className="sample-card">
                            <div className="sample-info">
                                <span className="sample-word-count">{sample.wordCount} words</span>
                                <span className="sample-date">
                                    {new Date(sample.addedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="sample-preview">
                                {sample.content.substring(0, 150)}...
                            </div>
                            <div className="sample-actions">
                                <button
                                    onClick={() => handleEditSample(sample)}
                                    className="btn-edit"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteSample(sample.id)}
                                    className="btn-delete"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .preprompt-area {
          padding: 24px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .preprompt-header h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .preprompt-description {
          margin: 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .preprompt-stats {
          display: flex;
          gap: 24px;
          margin: 24px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .stat-value.ready {
          color: #10b981;
        }

        .stat-value.insufficient {
          color: #f59e0b;
        }

        .preprompt-form {
          margin: 24px 0;
        }

        .preprompt-textarea {
          width: 100%;
          padding: 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .preprompt-textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .preprompt-form-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .word-count {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 14px;
        }

        .word-count .valid {
          color: #10b981;
          font-weight: 600;
        }

        .word-count .invalid {
          color: #666;
          font-weight: 600;
        }

        .word-count-hint {
          color: #999;
          font-size: 12px;
        }

        .preprompt-actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary, .btn-secondary, .btn-add-sample {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-add-sample {
          width: 100%;
          background: #3b82f6;
          color: white;
          padding: 16px;
          font-size: 16px;
        }

        .btn-add-sample:hover {
          background: #2563eb;
        }

        .preprompt-samples-list {
          margin-top: 32px;
        }

        .preprompt-samples-list h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .sample-card {
          padding: 16px;
          margin-bottom: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .sample-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          color: #666;
        }

        .sample-word-count {
          font-weight: 600;
          color: #3b82f6;
        }

        .sample-preview {
          margin: 8px 0;
          font-size: 14px;
          color: #374151;
          line-height: 1.5;
        }

        .sample-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-edit, .btn-delete {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-edit:hover {
          background: #d1d5db;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fecaca;
        }
      `}</style>
        </div>
    );
}

// Helper function
function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
