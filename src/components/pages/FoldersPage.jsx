import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { folderService } from "@/services/api/folderService";
import { folderSharingService } from "@/services/api/folderSharingService";
import FolderSharingModal from "@/components/organisms/FolderSharingModal";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
const FoldersPage = () => {
const { onAddBookmark, onSharingUpdate } = useOutletContext();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharingFolder, setSharingFolder] = useState(null);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  useEffect(() => {
    loadFolders();
  }, []);
  
const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await folderService.getAll();
      // Transform folder data to include sharing information
      const foldersWithSharing = data.map(folder => ({
        ...folder,
        isShared: folder.shared_c || false,
        sharedWith: folder.shared_with_c ? folder.shared_with_c.split(',').map(email => email.trim()).filter(email => email) : [],
        sharePermissions: folder.share_permissions_c || 'view'
      }));
      setFolders(foldersWithSharing);
    } catch (err) {
      setError('Failed to load folders');
      console.error('Error loading folders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareFolder = (folder) => {
    setSharingFolder(folder);
    setIsSharingModalOpen(true);
  };

  const handleSharingUpdate = async () => {
    await loadFolders();
    onSharingUpdate?.();
  };
  
const FolderCard = ({ folder }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
      className="bg-white rounded-xl p-6 shadow-md border border-gray-100 transition-all duration-200 group hover:border-primary/20 relative"
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
        >
          <ApperIcon name={folder.isShared ? "FolderOpen" : "Folder"} className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {folder.name}
            </h3>
            {folder.isShared && (
              <ApperIcon name="Share2" className="w-4 h-4 text-blue-500" title="Shared folder" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {folder.bookmarkCount} {folder.bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
          </p>
          {folder.isShared && folder.sharedWith.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Shared with {folder.sharedWith.length} {folder.sharedWith.length === 1 ? 'person' : 'people'}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">
            {folder.bookmarkCount}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleShareFolder(folder);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            title="Share folder"
          >
            <ApperIcon name="Share2" className="w-4 h-4" />
          </Button>
        </div>
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
      
      {/* Folder Sharing Modal */}
      <FolderSharingModal
        isOpen={isSharingModalOpen}
        onClose={() => {
          setIsSharingModalOpen(false);
          setSharingFolder(null);
        }}
        folder={sharingFolder}
        onSharingUpdate={handleSharingUpdate}
/>
    </div>
  );
};

export default FoldersPage;