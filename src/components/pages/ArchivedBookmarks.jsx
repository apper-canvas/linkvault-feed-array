import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import BookmarkGrid from '@/components/organisms/BookmarkGrid';
import { bookmarkService } from '@/services/api/bookmarkService';

function ArchivedBookmarks() {
  const { onEdit, onDelete, onArchive, onAddBookmark, searchQuery } = useOutletContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    handleBookmarkUpdate();
  }, [searchQuery]);

  const handleBookmarkUpdate = () => {
    if (searchQuery && searchQuery.trim()) {
      filterBookmarks(searchQuery);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    if (query.trim()) {
      filterBookmarks(query);
    } else {
      setFilteredBookmarks(bookmarks);
    }
  };

  const loadBookmarks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await bookmarkService.getArchived();
      setBookmarks(data);
      setFilteredBookmarks(data);
    } catch (err) {
      console.error('Error loading archived bookmarks:', err);
      setError('Failed to load archived bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const filterBookmarks = (query) => {
    const searchTerm = query.toLowerCase().trim();
    
    const filtered = bookmarks.filter(bookmark => 
      bookmark.title?.toLowerCase().includes(searchTerm) ||
      bookmark.url?.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    
    setFilteredBookmarks(filtered);
  };

  const handleArchive = async (bookmarkId) => {
    try {
      const success = await bookmarkService.toggleArchive(bookmarkId);
      if (success) {
        // Refresh archived bookmarks to show updated status
        await loadBookmarks();
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Archived Bookmarks</h1>
          <p className="text-gray-600">
            {filteredBookmarks.length} archived bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <BookmarkGrid
        bookmarks={filteredBookmarks}
        loading={loading}
        error={error}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddBookmark={onAddBookmark}
        onArchive={handleArchive}
        emptyTitle="No archived bookmarks"
        emptyDescription="Bookmarks you archive will appear here"
      />
    </div>
  );
}

export default ArchivedBookmarks;