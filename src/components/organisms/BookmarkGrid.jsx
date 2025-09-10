import React from 'react';
import { motion } from 'framer-motion';
import BookmarkCard from '@/components/molecules/BookmarkCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';

const BookmarkGrid = ({ 
  bookmarks, 
  loading, 
  error, 
  onRetry, 
  onEdit, 
  onDelete, 
onAddBookmark,
onPin,
  onArchive,
  emptyTitle = "No bookmarks found",
  emptyMessage = "Start building your bookmark collection by adding your first link"
}) => {
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={onRetry} />;
  if (!bookmarks || bookmarks.length === 0) {
    return (
      <Empty
        title={emptyTitle}
        message={emptyMessage}
        onAction={onAddBookmark}
        actionText="Add Bookmark"
        icon="Bookmark"
      />
    );
  }
  
  const handleOpen = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {bookmarks.map((bookmark, index) => (
          <motion.div
            key={bookmark.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <BookmarkCard
              bookmark={bookmark}
              onEdit={onEdit}
              onDelete={onDelete}
onOpen={handleOpen}
onPin={onPin}
              onArchive={onArchive}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BookmarkGrid;