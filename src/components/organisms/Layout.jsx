import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Header from "@/components/organisms/Header";
import BookmarkModal from "@/components/organisms/BookmarkModal";
import { folderService } from "@/services/api/folderService";
import { tagService } from "@/services/api/tagService";
import { bookmarkService } from "@/services/api/bookmarkService";
import { toast } from "react-toastify";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [bookmarkCounts, setBookmarkCounts] = useState({
    total: 0,
    recent: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadSidebarData();
  }, []);
  
  const loadSidebarData = async () => {
    try {
      const [foldersData, tagsData, allBookmarks] = await Promise.all([
        folderService.getAll(),
        tagService.getAll(),
        bookmarkService.getAll()
      ]);
      
      setFolders(foldersData);
      setTags(tagsData.sort((a, b) => b.usageCount - a.usageCount));
      
      const now = new Date();
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const recentBookmarks = allBookmarks.filter(bookmark => 
        new Date(bookmark.dateAdded) > sevenDaysAgo
      );
      
      setBookmarkCounts({
        total: allBookmarks.length,
        recent: recentBookmarks.length
      });
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    }
  };
  
  const handleAddBookmark = () => {
    setEditingBookmark(null);
    setIsBookmarkModalOpen(true);
  };
  
  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setIsBookmarkModalOpen(true);
  };
  
  const handleSaveBookmark = async (bookmarkData) => {
    setIsLoading(true);
    try {
      if (editingBookmark) {
        await bookmarkService.update(editingBookmark.Id, bookmarkData);
        toast.success('Bookmark updated successfully!');
      } else {
        await bookmarkService.create(bookmarkData);
        toast.success('Bookmark added successfully!');
      }
      
      setIsBookmarkModalOpen(false);
      setEditingBookmark(null);
loadSidebarData();
      
      // Trigger a custom event to refresh bookmark lists
      window.dispatchEvent(new window.CustomEvent('bookmarkUpdated'));
    } catch (error) {
      toast.error('Failed to save bookmark');
      console.error('Error saving bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteBookmark = async (bookmarkId) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      try {
        await bookmarkService.delete(bookmarkId);
        toast.success('Bookmark deleted successfully!');
loadSidebarData();
        
        // Trigger a custom event to refresh bookmark lists
        window.dispatchEvent(new window.CustomEvent('bookmarkUpdated'));
      } catch (error) {
        toast.error('Failed to delete bookmark');
        console.error('Error deleting bookmark:', error);
      }
    }
  };
  
  const handleSearch = (query) => {
setSearchQuery(query);
    // Trigger a custom event with search query
    window.dispatchEvent(new window.CustomEvent('searchBookmarks', { 
      detail: { query } 
    }));
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <Sidebar 
            folders={folders}
            tags={tags}
            bookmarkCounts={bookmarkCounts}
            className="h-full"
          />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          folders={folders}
          tags={tags}
          bookmarkCounts={bookmarkCounts}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onAddBookmark={handleAddBookmark}
            onSearch={handleSearch}
            onMenuToggle={() => setIsMobileMenuOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ 
              onEdit: handleEditBookmark, 
              onDelete: handleDeleteBookmark,
              onAddBookmark: handleAddBookmark,
              searchQuery 
            }} />
          </main>
        </div>
      </div>
      
      {/* Bookmark Modal */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsBookmarkModalOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        bookmark={editingBookmark}
        availableTags={tags}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Layout;