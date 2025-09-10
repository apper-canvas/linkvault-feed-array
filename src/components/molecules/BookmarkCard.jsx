import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';

const BookmarkCard = ({ bookmark, onEdit, onDelete, onOpen, className }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch {
      return null;
    }
  };
  
  const getDomainName = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "Invalid URL";
    }
  };
  
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    onOpen(bookmark.url);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)" }}
      className={cn(
        "bg-white rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer transition-all duration-200 group hover:border-primary/20",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {!imageError && getFaviconUrl(bookmark.url) ? (
            <img
              src={getFaviconUrl(bookmark.url)}
              alt=""
              className="w-6 h-6"
              onError={handleImageError}
            />
          ) : (
            <ApperIcon name="Globe" className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
            {bookmark.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {getDomainName(bookmark.url)}
          </p>
        </div>
        
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <ApperIcon name="ExternalLink" className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {bookmark.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {bookmark.description}
        </p>
      )}
      
      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {bookmark.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
          {bookmark.tags.length > 3 && (
            <Badge variant="default" size="sm">
              +{bookmark.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(bookmark.dateAdded), { addSuffix: true })}
        </span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(bookmark);
            }}
            className="p-2 h-8 w-8"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bookmark.Id);
            }}
            className="p-2 h-8 w-8 text-error hover:text-error hover:bg-error/10"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;