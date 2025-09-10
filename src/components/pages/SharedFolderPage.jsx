import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import BookmarkGrid from '@/components/organisms/BookmarkGrid';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { folderService } from '@/services/api/folderService';
import { bookmarkService } from '@/services/api/bookmarkService';

const SharedFolderPage = () => {
  const { shareId } = useParams();
  const [folder, setFolder] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedFolder();
  }, [shareId]);

  const loadSharedFolder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Decode the share ID to get the folder ID
      const folderId = atob(shareId);
      
      // Load folder details
      const folderData = await folderService.getById(folderId);
      if (!folderData || !folderData.shared_c) {
        setError('This folder is not shared or does not exist');
        return;
      }
      
      setFolder({
        ...folderData,
        name: folderData.name_c || folderData.Name,
        color: folderData.color_c,
        isShared: folderData.shared_c,
        sharePermissions: folderData.share_permissions_c
      });
      
      // Load bookmarks in the folder
      const bookmarkData = await bookmarkService.getByFolder(folderId);
      setBookmarks(bookmarkData);
    } catch (err) {
      setError('Failed to load shared folder');
      console.error('Error loading shared folder:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadSharedFolder} />;
  if (!folder) return <Error message="Folder not found" />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
            >
              <ApperIcon name="FolderOpen" className="w-6 h-6" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {folder.name}
                <ApperIcon name="Share2" className="w-5 h-5 text-blue-500" />
              </h1>
              <p className="text-sm text-gray-500">
                Shared folder • {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                • {folder.sharePermissions === 'edit' ? 'Edit access' : 'View only'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {bookmarks.length === 0 ? (
          <Empty
            title="No bookmarks in this folder"
            message="This shared folder doesn't contain any bookmarks yet"
            icon="Bookmark"
          />
        ) : (
          <BookmarkGrid
            bookmarks={bookmarks}
            loading={false}
            error={null}
            onOpen={handleOpen}
            onEdit={folder.sharePermissions === 'edit' ? () => {} : undefined}
            onDelete={folder.sharePermissions === 'edit' ? () => {} : undefined}
            onPin={folder.sharePermissions === 'edit' ? () => {} : undefined}
            emptyTitle="No bookmarks found"
            emptyMessage="This folder doesn't contain any bookmarks"
          />
        )}
      </div>
    </div>
  );
};

export default SharedFolderPage;