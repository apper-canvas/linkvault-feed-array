import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { folderService } from '@/services/api/folderService';

const FoldersPage = () => {
  const { onAddBookmark } = useOutletContext();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadFolders();
  }, []);
  
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await folderService.getAll();
      setFolders(data);
    } catch (err) {
      setError('Failed to load folders');
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const FolderCard = ({ folder }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 cursor-pointer transition-all duration-200 group hover:border-primary/20"
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
        >
          <ApperIcon name="Folder" className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
            {folder.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {folder.bookmarkCount} {folder.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
          </p>
        </div>
        
        <Badge variant="default" size="sm">
          {folder.bookmarkCount}
        </Badge>
      </div>
    </motion.div>
  );
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadFolders} />;
  
  return (
    <div className="h-full">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Folders
            </h1>
            <span className="text-sm text-gray-500">
              {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
            </span>
          </div>
          
          <Button variant="secondary">
            <ApperIcon name="FolderPlus" className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>
      
      {folders.length === 0 ? (
        <Empty
          title="No folders yet"
          message="Organize your bookmarks by creating folders for different topics or projects"
          onAction={() => {}}
          actionText="Create Folder"
          icon="Folder"
        />
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder, index) => (
              <motion.div
                key={folder.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FolderCard folder={folder} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoldersPage;