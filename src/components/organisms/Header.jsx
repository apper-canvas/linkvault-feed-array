import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';

const Header = ({ onAddBookmark, onSearch, onMenuToggle }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden p-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 max-w-2xl">
            <SearchBar 
              onSearch={onSearch}
              placeholder="Search bookmarks by title, URL, or tags..."
            />
          </div>
          
          <Button
            variant="primary"
            onClick={onAddBookmark}
            className="flex-shrink-0"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Bookmark</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;