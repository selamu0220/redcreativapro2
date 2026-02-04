'use client';

import React, { useState, useEffect } from 'react';

interface TestItem {
  id: string;
  name?: string | null | undefined;
  category?: string | null | undefined;
  title?: string | null | undefined;
}

const TestLocaleCompare: React.FC = () => {
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'title'>('name');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data with potential null/undefined values
    const simulateCorruptData = () => {
      const items: TestItem[] = [
        { id: '1', name: 'Test 1', category: 'general', title: 'Title 1' },
        { id: '2', name: null, category: 'specific', title: 'Title 2' },
        { id: '3', name: undefined, category: null, title: undefined },
        { id: '4', name: 'Test 4', category: undefined, title: null },
        { id: '5' } as TestItem, // Missing all optional properties
      ];
      
      console.log('🧪 Test items loaded:', items);
      setTestItems(items);
    };

    simulateCorruptData();
  }, []);

  const sortItems = () => {
    try {
      console.log('🧪 Attempting to sort by:', sortBy);
      
      const sorted = [...testItems].sort((a, b) => {
        console.log('🧪 Comparing items:', { a, b });
        
        switch (sortBy) {
          case 'name':
            const nameA = a.name || '';
            const nameB = b.name || '';
            console.log('🧪 Name comparison:', { nameA, nameB, typeA: typeof nameA, typeB: typeof nameB });
            return nameA.localeCompare(nameB);
            
          case 'category':
            const categoryA = a.category || '';
            const categoryB = b.category || '';
            console.log('🧪 Category comparison:', { categoryA, categoryB, typeA: typeof categoryA, typeB: typeof categoryB });
            return categoryA.localeCompare(categoryB);
            
          case 'title':
            const titleA = a.title || '';
            const titleB = b.title || '';
            console.log('🧪 Title comparison:', { titleA, titleB, typeA: typeof titleA, typeB: typeof titleB });
            return titleA.localeCompare(titleB);
            
          default:
            return 0;
        }
      });
      
      console.log('🧪 Sorted successfully:', sorted);
      setTestItems(sorted);
      setError(null);
      
    } catch (err) {
      console.error('🧪 Error during sorting:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testDirectLocaleCompare = () => {
    try {
      console.log('🧪 Testing direct localeCompare calls...');
      
      // Test with various values
      const testValues = [null, undefined, '', 'test', 123, {}, []];
      
      testValues.forEach((value, index) => {
        try {
          const stringValue = String(value || '');
          console.log(`🧪 Testing value ${index}:`, { original: value, converted: stringValue, type: typeof stringValue });
          
          // This should trigger the error if there's an issue
          const result = stringValue.localeCompare('test');
          console.log(`🧪 localeCompare result for ${index}:`, result);
          
        } catch (err) {
          console.error(`🧪 Error with value ${index}:`, err);
          setError(`Error with value ${index}: ${err}`);
        }
      });
      
    } catch (err) {
      console.error('🧪 Error in direct test:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🧪 LocaleCompare Test Component</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setSortBy('name')}
          className={`px-3 py-1 rounded ${sortBy === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Sort by Name
        </button>
        <button
          onClick={() => setSortBy('category')}
          className={`px-3 py-1 rounded ${sortBy === 'category' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Sort by Category
        </button>
        <button
          onClick={() => setSortBy('title')}
          className={`px-3 py-1 rounded ${sortBy === 'title' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Sort by Title
        </button>
      </div>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={sortItems}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          🔄 Sort Items
        </button>
        <button
          onClick={testDirectLocaleCompare}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          🧪 Test Direct LocaleCompare
        </button>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Test Items:</h4>
        {testItems.map((item, index) => (
          <div key={item.id || index} className="p-2 bg-white border rounded text-sm">
            <div><strong>ID:</strong> {item.id || 'N/A'}</div>
            <div><strong>Name:</strong> {item.name === null ? 'null' : item.name === undefined ? 'undefined' : item.name || 'empty'}</div>
            <div><strong>Category:</strong> {item.category === null ? 'null' : item.category === undefined ? 'undefined' : item.category || 'empty'}</div>
            <div><strong>Title:</strong> {item.title === null ? 'null' : item.title === undefined ? 'undefined' : item.title || 'empty'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestLocaleCompare;
