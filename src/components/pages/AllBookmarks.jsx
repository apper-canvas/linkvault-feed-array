import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import BookmarkGrid from '@/components/organisms/BookmarkGrid';
import { bookmarkService } from '@/services/api/bookmarkService';

const AllBookmarks = () => {
const { onEdit, onDelete, onArchive, onAddBookmark, searchQuery } = useOutletContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadBookmarks();
    
    const handleBookmarkUpdate = () => {
      loadBookmarks();
    };
    
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
  }, []);
  
  useEffect(() => {
    const handleSearch = (event) => {
      const query = event.detail?.query || '';
      filterBookmarks(query);
    };
    
    window.addEventListener('searchBookmarks', handleSearch);
    return () => window.removeEventListener('searchBookmarks', handleSearch);
  }, [bookmarks]);
  
  useEffect(() => {
    filterBookmarks(searchQuery);
  }, [bookmarks, searchQuery]);
  
  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookmarkService.getAll();
      setBookmarks(data);
      setFilteredBookmarks(data);
    } catch (err) {
      setError('Failed to load bookmarks');
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const filterBookmarks = (query) => {
    if (!query.trim()) {
      setFilteredBookmarks(bookmarks);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const filtered = bookmarks.filter(bookmark => 
bookmark.title?.toLowerCase().includes(searchTerm) ||
      bookmark.url?.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    setFilteredBookmarks(filtered);
};
  
  const handlePin = async (bookmarkId) => {
    try {
      const success = await bookmarkService.togglePin(bookmarkId);
      if (success) {
        // Refresh bookmarks to show updated pin status
        await loadBookmarks();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };
  
  return (
    <div className="h-full">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            All Bookmarks
          </h1>
          <span className="text-sm text-gray-500">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </span>
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Showing results for "{searchQuery}"
          </p>
        )}
      </div>
      
      <BookmarkGrid
        bookmarks={filteredBookmarks}
        loading={loading}
        error={error}
        onRetry={loadBookmarks}
        onEdit={onEdit}
onDelete={onDelete}
        onAddBookmark={onAddBookmark}
        onPin={handlePin}
        onArchive={onArchive}
        emptyTitle={searchQuery ? "No bookmarks match your search" : "No bookmarks yet"}
        emptyMessage={searchQuery ? "Try adjusting your search terms or browse all bookmarks" : "Start building your bookmark collection by adding your first link"}
      />
    </div>
  );
};

export default AllBookmarks;