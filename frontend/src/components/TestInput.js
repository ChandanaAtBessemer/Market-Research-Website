import React, { useState } from 'react';

const TestInput = () => {
  const [value, setValue] = useState('');

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Input Test Component</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Input 1 (Simple)
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => {
              console.log('Test input change:', e.target.value);
              setValue(e.target.value);
            }}
            placeholder="Type here..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Value: "{value}"</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Input 2 (Uncontrolled)
          </label>
          <input
            type="text"
            placeholder="Type here (uncontrolled)..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            onChange={(e) => console.log('Uncontrolled input:', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Input 3 (With useCallback)
          </label>
          <input
            type="text"
            placeholder="Type here (useCallback)..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            onChange={React.useCallback((e) => {
              console.log('useCallback input:', e.target.value);
            }, [])}
          />
        </div>
      </div>
    </div>
  );
};

export default TestInput; 