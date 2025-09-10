import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import TagInput from '@/components/molecules/TagInput';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const BookmarkModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  bookmark, 
  availableTags = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: [],
    folderId: ''
  });
  const [errors, setErrors] = useState({});
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  
  const isEditing = Boolean(bookmark);
  
  useEffect(() => {
    if (bookmark) {
      setFormData({
url: bookmark.url || '',
        title: bookmark.title || '',
        description: bookmark.description || '',
        tags: bookmark.tags || [],
        folderId: bookmark.folderId || ''
      });
    } else {
      setFormData({
        url: '',
        title: '',
        description: '',
        tags: [],
        folderId: ''
      });
    }
    setErrors({});
  }, [bookmark, isOpen]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else {
      try {
        new URL(formData.url);
      } catch {
        newErrors.url = 'Please enter a valid URL';
      }
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const fetchPageTitle = async (url) => {
    setIsFetchingTitle(true);
    try {
      // In a real app, you'd use a backend service to fetch page titles
      // For this demo, we'll extract domain name as fallback
      const domain = new URL(url).hostname;
      const title = `Bookmark from ${domain}`;
      
setFormData(prev => ({
        ...prev,
        title: title
      }));
      
      toast.success('Title fetched successfully');
    } catch (error) {
      toast.error('Could not fetch page title');
    } finally {
      setIsFetchingTitle(false);
    }
  };
  
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, url }));
    
    // Clear URL error when user starts typing
    if (errors.url) {
      setErrors(prev => ({ ...prev, url: '' }));
    }
  };
  
  const handleFetchTitle = () => {
    if (formData.url.trim()) {
      try {
        new URL(formData.url);
        fetchPageTitle(formData.url);
      } catch {
        toast.error('Please enter a valid URL first');
      }
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const bookmarkData = {
      ...formData,
      url: formData.url.trim(),
      title: formData.title.trim(),
      description: formData.description.trim()
    };
    
    if (isEditing) {
      bookmarkData.Id = bookmark.Id;
    }
    
    onSave(bookmarkData);
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Bookmark" : "Add New Bookmark"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="url" required>Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={handleUrlChange}
              error={errors.url}
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleFetchTitle}
              disabled={!formData.url.trim() || isFetchingTitle}
              className="flex-shrink-0"
            >
              {isFetchingTitle ? (
                <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <ApperIcon name="Download" className="w-4 h-4" />
              )}
            </Button>
          </div>
          {errors.url && (
            <p className="text-sm text-error mt-1">{errors.url}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="title" required>Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="Enter bookmark title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            error={errors.title}
          />
          {errors.title && (
            <p className="text-sm text-error mt-1">{errors.title}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            placeholder="Optional description or notes"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            rows={3}
          />
        </div>
        
        <div>
          <Label>Tags</Label>
          <TagInput
            tags={formData.tags}
            onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            availableTags={availableTags}
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                {isEditing ? 'Update Bookmark' : 'Add Bookmark'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BookmarkModal;