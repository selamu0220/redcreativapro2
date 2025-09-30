'use client';

import React from 'react';

export default function TestDebug() {
  console.log('🔥 TEST DEBUG COMPONENT RENDERED');
  
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      zIndex: 9999,
      border: '3px solid yellow',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      🚨 TEST DEBUG VISIBLE 🚨
    </div>
  );
}