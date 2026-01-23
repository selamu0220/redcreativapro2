/**
 * Test Page for Agent Mode Change Tracking
 * 
 * Provides a dedicated page for testing and demonstrating
 * the agent mode change tracking system.
 */

"use client";

import { AgentModeChangeTrackingDemo } from '../components/AgentModeChangeTrackingDemo';

export default function TestAgentModeChangesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <AgentModeChangeTrackingDemo />
    </div>
  );
}
