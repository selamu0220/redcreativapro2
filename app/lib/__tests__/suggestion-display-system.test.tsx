/**
 * Suggestion Display System Tests
 * 
 * Tests for the suggestion display components and queue management.
 * 
 * Requirements: 1.2, 1.4, 13.1
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionDisplay } from '../../components/SuggestionDisplay';
import { SuggestionCard } from '../../components/SuggestionCard';
import { SuggestionQueue } from '../suggestion-queue';
import { Suggestion } from '../real-time-analysis-engine';

// Mock suggestions for testing
const mockSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    type: 'grammar',
    originalText: 'Their going to the store',
    suggestedText: "They're going to the store",
    explanation: 'Incorrect use of "their" instead of "they\'re"',
    confidence: 0.95,
    position: { start: 0, end: 24 }
  },
  {
    id: 'sug-2',
    type: 'style',
    originalText: 'very good',
    suggestedText: 'excellent',
    explanation: 'More impactful word choice',
    confidence: 0.75,
    position: { start: 50, end: 59 }
  },
  {
    id: 'sug-3',
    type: 'seo',
    originalText: 'tips',
    suggestedText: 'SEO optimization tips',
    explanation: 'Include target keyword for better SEO',
    confidence: 0.80,
    position: { start: 100, end: 104 }
  },
  {
    id: 'sug-4',
    type: 'clarity',
    originalText: 'It is important to note that',
    suggestedText: 'Note that',
    explanation: 'Remove unnecessary filler phrase',
    confidence: 0.85,
    position: { start: 150, end: 178 }
  }
];

describe('SuggestionQueue', () => {
  it('should add suggestions to queue', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    expect(queue.getTotalCount()).toBe(4);
  });

  it('should limit visible suggestions to maxVisible', () => {
    const queue = new SuggestionQueue(2);
    queue.addSuggestions(mockSuggestions);
    
    const visible = queue.getVisible();
    expect(visible.length).toBe(2);
  });

  it('should calculate queued count correctly', () => {
    const queue = new SuggestionQueue(2);
    queue.addSuggestions(mockSuggestions);
    
    expect(queue.getQueuedCount()).toBe(2); // 4 total - 2 visible = 2 queued
  });

  it('should prioritize grammar suggestions over others', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    const visible = queue.getVisible();
    expect(visible[0].type).toBe('grammar'); // Grammar should be first
  });

  it('should remove suggestions by id', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    queue.remove('sug-1');
    expect(queue.getTotalCount()).toBe(3);
  });

  it('should prevent duplicate suggestions', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    queue.addSuggestions(mockSuggestions); // Add same suggestions again
    
    expect(queue.getTotalCount()).toBe(4); // Should still be 4, not 8
  });

  it('should clear all suggestions', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    queue.clear();
    expect(queue.isEmpty()).toBe(true);
  });

  it('should get suggestions by type', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    const grammarSuggestions = queue.getByType('grammar');
    expect(grammarSuggestions.length).toBe(1);
    expect(grammarSuggestions[0].id).toBe('sug-1');
  });

  it('should count suggestions by type', () => {
    const queue = new SuggestionQueue(3);
    queue.addSuggestions(mockSuggestions);
    
    const counts = queue.getCountByType();
    expect(counts.grammar).toBe(1);
    expect(counts.style).toBe(1);
    expect(counts.seo).toBe(1);
    expect(counts.clarity).toBe(1);
  });
});

describe('SuggestionCard', () => {
  it('should render suggestion content', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    expect(screen.getByText('Their going to the store')).toBeInTheDocument();
    expect(screen.getByText("They're going to the store")).toBeInTheDocument();
  });

  it('should call onAccept when accept button clicked', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    const acceptButton = screen.getByText('Aceptar');
    fireEvent.click(acceptButton);
    
    expect(mockAccept).toHaveBeenCalledTimes(1);
  });

  it('should call onReject when reject button clicked', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    const rejectButton = screen.getByText('Rechazar');
    fireEvent.click(rejectButton);
    
    expect(mockReject).toHaveBeenCalledTimes(1);
  });

  it('should display correct type indicator for grammar', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    expect(screen.getByText('Gramática')).toBeInTheDocument();
  });

  it('should display confidence score for high confidence suggestions', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]} // 95% confidence
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    expect(screen.getByText('95% confianza')).toBeInTheDocument();
  });
});

describe('SuggestionDisplay', () => {
  it('should render nothing when no suggestions', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    const { container } = render(
      <SuggestionDisplay
        suggestions={[]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render visible suggestions', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionDisplay
        suggestions={mockSuggestions}
        onAccept={mockAccept}
        onReject={mockReject}
        maxVisible={2}
      />
    );
    
    expect(screen.getByText('Sugerencias de IA')).toBeInTheDocument();
    expect(screen.getByText('2 visible, 2 en cola')).toBeInTheDocument();
  });

  it('should display keyboard shortcut hints', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionDisplay
        suggestions={mockSuggestions}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    expect(screen.getByText('Tab')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('should call onAccept when suggestion is accepted', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionDisplay
        suggestions={[mockSuggestions[0]]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    const acceptButton = screen.getByText('Aceptar');
    fireEvent.click(acceptButton);
    
    expect(mockAccept).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('should call onReject when suggestion is rejected', () => {
    const mockAccept = vi.fn();
    const mockReject = vi.fn();
    
    render(
      <SuggestionDisplay
        suggestions={[mockSuggestions[0]]}
        onAccept={mockAccept}
        onReject={mockReject}
      />
    );
    
    const rejectButton = screen.getByText('Rechazar');
    fireEvent.click(rejectButton);
    
    expect(mockReject).toHaveBeenCalledWith(mockSuggestions[0]);
  });
});
