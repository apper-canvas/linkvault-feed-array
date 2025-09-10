import React, { useState, useRef, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import { cn } from '@/utils/cn';

const TagInput = ({ tags = [], onTagsChange, availableTags = [], className }) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(tag.name)
  );
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleAddTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      onTagsChange([...tags, tagName]);
      setInputValue("");
      setIsOpen(false);
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };
  
  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="min-h-[2.75rem] p-2 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="primary" className="flex items-center gap-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <ApperIcon name="X" className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          <Input
            ref={inputRef}
            type="text"
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="flex-1 min-w-[120px] border-none focus:ring-0 focus:border-none p-0 h-6"
          />
        </div>
      </div>
      
      {isOpen && (filteredTags.length > 0 || inputValue.trim()) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          {filteredTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => handleAddTag(tag.name)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between transition-colors"
            >
              <span>{tag.name}</span>
              <Badge variant="default" size="sm">{tag.usageCount}</Badge>
            </button>
          ))}
          
          {inputValue.trim() && !filteredTags.find(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              onClick={() => handleAddTag(inputValue.trim())}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-primary border-t border-gray-100 transition-colors"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;