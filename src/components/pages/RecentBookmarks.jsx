import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { bookmarkService } from "@/services/api/bookmarkService";
import BookmarkGrid from "@/components/organisms/BookmarkGrid";

const RecentBookmarks = () => {
  const { onEdit, onDelete, onAddBookmark, searchQuery } = useOutletContext();
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadRecentBookmarks();
    
    const handleBookmarkUpdate = () => {
      loadRecentBookmarks();
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
  
  const loadRecentBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const allBookmarks = await bookmarkService.getAll();
      
      // Filter bookmarks from the last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
const recentBookmarks = allBookmarks
        .filter(bookmark => new Date(bookmark.dateAdded) > sevenDaysAgo)
        .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      
      setBookmarks(recentBookmarks);
      setFilteredBookmarks(recentBookmarks);
    } catch (err) {
      setError('Failed to load recent bookmarks');
      console.error('Error loading recent bookmarks:', err);
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
        await loadRecentBookmarks();
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
            Recently Added
          </h1>
          <span className="text-sm text-gray-500">
            {filteredBookmarks.length} {filteredBookmarks.length === 1 ? 'bookmark' : 'bookmarks'} from the last 7 days
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
        onRetry={loadRecentBookmarks}
        onEdit={onEdit}
        onDelete={onDelete}
onAddBookmark={onAddBookmark}
        onPin={handlePin}
        emptyTitle={searchQuery ? "No recent bookmarks match your search" : "No recent bookmarks"}
        emptyMessage={searchQuery ? "Try adjusting your search terms or add some bookmarks" : "Bookmarks you've added in the last 7 days will appear here"}
      />
    </div>
  );
};

export default RecentBookmarks;