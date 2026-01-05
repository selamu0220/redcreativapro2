/**
 * Agent Mode Changes Summary Component
 * 
 * Displays a summary of all changes made by agent mode before applying them.
 * Allows users to review, accept all, reject all, or selectively apply changes.
 * 
 * Requirements: 2.3, 2.4
 */

"use client";

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Search,
  Zap
} from 'lucide-react';
import { AgentModeSession, TextChange, ChangesSummary } from '../lib/agent-mode-change-tracking';

interface AgentModeChangesSummaryProps {
  session: AgentModeSession;
  summary: ChangesSummary;
  onApplyAll: () => void;
  onRevertAll: () => void;
  onApplySelected: (changeIds: string[]) => void;
  onRevertSelected: (changeIds: string[]) => void;
  className?: string;
}

/**
 * Agent Mode Changes Summary Component
 * 
 * Provides a comprehensive view of all changes with controls for
 * accepting or rejecting them individually or in bulk.
 */
export function AgentModeChangesSummary({
  session,
  summary,
  onApplyAll,
  onRevertAll,
  onApplySelected,
  onRevertSelected,
  className = ''
}: AgentModeChangesSummaryProps) {
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string | null>(null);

  // Toggle change expansion
  const toggleExpanded = (changeId: string) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId);
    } else {
      newExpanded.add(changeId);
    }
    setExpandedChanges(newExpanded);
  };

  // Toggle change selection
  const toggleSelected = (changeId: string) => {
    const newSelected = new Set(selectedChanges);
    if (newSelected.has(changeId)) {
      newSelected.delete(changeId);
    } else {
      newSelected.add(changeId);
    }
    setSelectedChanges(newSelected);
  };

  // Select all changes
  const selectAll = () => {
    const filteredChanges = getFilteredChanges();
    setSelectedChanges(new Set(filteredChanges.map(c => c.id)));
  };

  // Deselect all changes
  const deselectAll = () => {
    setSelectedChanges(new Set());
  };

  // Get filtered changes based on type filter
  const getFilteredChanges = (): TextChange[] => {
    if (!filterType) return session.changes;
    return session.changes.filter(c => c.type === filterType);
  };

  // Get icon for change type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'structural':
        return <FileText className="w-4 h-4" />;
      case 'stylistic':
        return <Sparkles className="w-4 h-4" />;
      case 'seo':
        return <Search className="w-4 h-4" />;
      case 'clarity':
      case 'grammar':
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get color for change type
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'structural':
        return 'text-purple-600 bg-purple-50';
      case 'stylistic':
        return 'text-blue-600 bg-blue-50';
      case 'seo':
        return 'text-green-600 bg-green-50';
      case 'clarity':
        return 'text-yellow-600 bg-yellow-50';
      case 'grammar':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get color for impact level
  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'major':
        return 'text-red-600 bg-red-50';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50';
      case 'minor':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Format change type for display
  const formatType = (type: string): string => {
    const typeMap: Record<string, string> = {
      structural: 'Estructural',
      stylistic: 'Estilo',
      seo: 'SEO',
      clarity: 'Claridad',
      grammar: 'Gramática'
    };
    return typeMap[type] || type;
  };

  // Format impact for display
  const formatImpact = (impact: string): string => {
    const impactMap: Record<string, string> = {
      major: 'Mayor',
      moderate: 'Moderado',
      minor: 'Menor'
    };
    return impactMap[impact] || impact;
  };

  const filteredChanges = getFilteredChanges();
  const hasSelection = selectedChanges.size > 0;

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Cambios del Modo Agente
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {summary.totalChanges} cambios
            </span>
            <span className={`px-2 py-1 text-xs rounded ${getImpactColor(summary.estimatedImpact)}`}>
              Impacto {formatImpact(summary.estimatedImpact)}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-gray-900">{summary.totalChanges}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{summary.appliedCount}</div>
            <div className="text-xs text-gray-600">Aplicados</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</div>
            <div className="text-xs text-gray-600">Pendientes</div>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterType(null)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              filterType === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({summary.totalChanges})
          </button>
          {Object.entries(summary.byType).map(([type, count]) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatType(type)} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Changes List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredChanges.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay cambios para mostrar
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChanges.map((change) => {
              const isExpanded = expandedChanges.has(change.id);
              const isSelected = selectedChanges.has(change.id);
              const isApplied = session.appliedChanges.has(change.id);
              const isReverted = session.revertedChanges.has(change.id);

              return (
                <div
                  key={change.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelected(change.id)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      disabled={isApplied || isReverted}
                    />

                    {/* Change Content */}
                    <div className="flex-1 min-w-0">
                      {/* Change Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${getTypeColor(change.type)}`}>
                            {getTypeIcon(change.type)}
                            <span>{formatType(change.type)}</span>
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getImpactColor(change.impact)}`}>
                            {formatImpact(change.impact)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Confianza: {Math.round(change.confidence * 100)}%
                          </span>
                        </div>

                        {/* Status Badge */}
                        {isApplied && (
                          <span className="flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Aplicado</span>
                          </span>
                        )}
                        {isReverted && (
                          <span className="flex items-center space-x-1 text-xs text-red-600">
                            <XCircle className="w-3 h-3" />
                            <span>Revertido</span>
                          </span>
                        )}
                      </div>

                      {/* Change Reason */}
                      <p className="text-sm text-gray-700 mb-2">{change.reason}</p>

                      {/* Expand/Collapse Button */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(change.id)}
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            <span>Ocultar detalles</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            <span>Ver detalles</span>
                          </>
                        )}
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <div className="p-2 bg-red-50 rounded">
                            <div className="text-xs font-medium text-red-700 mb-1">Antes:</div>
                            <div className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                              {change.before || '(vacío)'}
                            </div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-xs font-medium text-green-700 mb-1">Después:</div>
                            <div className="text-sm text-gray-800 font-mono whitespace-pre-wrap">
                              {change.after || '(vacío)'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-700"
              disabled={filteredChanges.length === 0}
            >
              Seleccionar todos
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-blue-600 hover:text-blue-700"
              disabled={!hasSelection}
            >
              Deseleccionar todos
            </button>
            {hasSelection && (
              <span className="text-xs text-gray-600">
                ({selectedChanges.size} seleccionados)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Apply Selected */}
          {hasSelection && (
            <>
              <button
                type="button"
                onClick={() => onApplySelected(Array.from(selectedChanges))}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aplicar seleccionados</span>
              </button>
              <button
                type="button"
                onClick={() => onRevertSelected(Array.from(selectedChanges))}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar seleccionados</span>
              </button>
            </>
          )}

          {/* Apply/Revert All */}
          {!hasSelection && (
            <>
              <button
                type="button"
                onClick={onApplyAll}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={summary.pendingCount === 0}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aplicar todos</span>
              </button>
              <button
                type="button"
                onClick={onRevertAll}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                disabled={summary.pendingCount === 0}
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar todos</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
