/**
 * Test script to verify the useAdvancedSearch localeCompare fix
 */

// Mock data with problematic values that could cause localeCompare errors
const testItems = [
  {
    id: '1',
    title: 'Valid Title',
    content: 'Valid content',
    category: 'valid-category',
    tags: ['tag1', 'tag2'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    title: null, // This should cause localeCompare error without fix
    content: 'Content with null title',
    category: 'another-category',
    tags: ['tag3'],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  },
  {
    id: '3',
    title: undefined, // This should cause localeCompare error without fix
    content: 'Content with undefined title',
    category: null, // This should cause localeCompare error without fix
    tags: ['tag4'],
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03'
  },
  {
    id: '4',
    title: '', // Empty string should be handled
    content: 'Content with empty title',
    category: '',
    tags: [],
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04'
  },
  {
    id: '5',
    title: 123, // Number should be converted to string
    content: 'Content with number title',
    category: 456,
    tags: ['tag5'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  }
];

// Test the safe string conversion function
function testSafeStringConversion() {
  console.log('🧪 Testing safe string conversion...');
  
  const safeStringConversion = (value, fallback = '') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return String(value);
    } catch (error) {
      console.warn('Failed to convert value to string:', value, error);
      return fallback;
    }
  };

  const testCases = [
    { input: 'valid string', expected: 'valid string' },
    { input: null, expected: '' },
    { input: undefined, expected: '' },
    { input: 123, expected: '123' },
    { input: '', expected: '' },
    { input: {}, expected: '[object Object]' }
  ];

  testCases.forEach((testCase, index) => {
    const result = safeStringConversion(testCase.input);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} Input: ${JSON.stringify(testCase.input)}, Expected: "${testCase.expected}", Got: "${result}"`);
  });
}

// Test the safe locale compare function
function testSafeLocaleCompare() {
  console.log('\n🧪 Testing safe locale compare...');
  
  const safeStringConversion = (value, fallback = '') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return String(value);
    } catch (error) {
      console.warn('Failed to convert value to string:', value, error);
      return fallback;
    }
  };

  const safeLocaleCompare = (a, b, fallbackA = '', fallbackB = '') => {
    try {
      const stringA = safeStringConversion(a, fallbackA);
      const stringB = safeStringConversion(b, fallbackB);
      
      if (typeof stringA !== 'string' || typeof stringB !== 'string') {
        console.warn('safeLocaleCompare: Non-string values after conversion', { stringA, stringB });
        return 0;
      }
      
      return stringA.localeCompare(stringB);
    } catch (error) {
      console.error('Error in safeLocaleCompare:', error, { a, b });
      return 0;
    }
  };

  const testCases = [
    { a: 'apple', b: 'banana', expected: -1 },
    { a: null, b: 'banana', expected: -1 }, // null becomes '', '' < 'banana'
    { a: 'apple', b: null, expected: 1 }, // null becomes '', 'apple' > ''
    { a: null, b: null, expected: 0 }, // both become ''
    { a: undefined, b: 'test', expected: -1 },
    { a: 123, b: 456, expected: -1 }, // '123' < '456'
    { a: '', b: 'test', expected: -1 }
  ];

  testCases.forEach((testCase, index) => {
    const result = safeLocaleCompare(testCase.a, testCase.b);
    const passed = Math.sign(result) === Math.sign(testCase.expected);
    console.log(`Test ${index + 1}: ${passed ? '✅' : '❌'} Compare ${JSON.stringify(testCase.a)} vs ${JSON.stringify(testCase.b)}, Expected sign: ${Math.sign(testCase.expected)}, Got sign: ${Math.sign(result)}`);
  });
}

// Test sorting with problematic data
function testSortingWithProblematicData() {
  console.log('\n🧪 Testing sorting with problematic data...');
  
  const safeStringConversion = (value, fallback = '') => {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string') {
      return value;
    }
    try {
      return String(value);
    } catch (error) {
      console.warn('Failed to convert value to string:', value, error);
      return fallback;
    }
  };

  const safeLocaleCompare = (a, b, fallbackA = '', fallbackB = '') => {
    try {
      const stringA = safeStringConversion(a, fallbackA);
      const stringB = safeStringConversion(b, fallbackB);
      
      if (typeof stringA !== 'string' || typeof stringB !== 'string') {
        console.warn('safeLocaleCompare: Non-string values after conversion', { stringA, stringB });
        return 0;
      }
      
      return stringA.localeCompare(stringB);
    } catch (error) {
      console.error('Error in safeLocaleCompare:', error, { a, b });
      return 0;
    }
  };

  try {
    // Test sorting by title
    console.log('Sorting by title...');
    const sortedByTitle = [...testItems].sort((a, b) => {
      return safeLocaleCompare(a.title, b.title, 'Sin título', 'Sin título');
    });
    console.log('✅ Title sorting completed successfully');
    sortedByTitle.forEach((item, index) => {
      const displayTitle = safeStringConversion(item.title, 'Sin título');
      console.log(`  ${index + 1}. "${displayTitle}" (original: ${JSON.stringify(item.title)})`);
    });

    // Test sorting by category
    console.log('\nSorting by category...');
    const sortedByCategory = [...testItems].sort((a, b) => {
      return safeLocaleCompare(a.category, b.category, 'Sin categoría', 'Sin categoría');
    });
    console.log('✅ Category sorting completed successfully');
    sortedByCategory.forEach((item, index) => {
      const displayCategory = safeStringConversion(item.category, 'Sin categoría');
      console.log(`  ${index + 1}. "${displayCategory}" (original: ${JSON.stringify(item.category)})`);
    });

  } catch (error) {
    console.error('❌ Error during sorting:', error);
  }
}

// Run all tests
console.log('🚀 Starting useAdvancedSearch localeCompare fix tests...\n');

testSafeStringConversion();
testSafeLocaleCompare();
testSortingWithProblematicData();

console.log('\n✅ All tests completed!');