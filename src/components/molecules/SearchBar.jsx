import React, { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';
import { cn } from '@/utils/cn';

const SearchBar = ({ onSearch, placeholder = "Search bookmarks...", className }) => {
  const [query, setQuery] = useState("");
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);
  
  const handleClear = () => {
    setQuery("");
  };
  
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="w-5 h-5 text-gray-400" />
      </div>
      
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10 h-12 text-base shadow-sm border-gray-200 focus:ring-primary/30 focus:border-primary"
      />
      
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ApperIcon name="X" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;