import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import TagInput from "@/components/molecules/TagInput";
import Modal from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";

const BookmarkModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  bookmark, 
  availableTags = [],
  folders = [],
  isLoading = false
}) => {
const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    generatedDescription: '',
    tags: [],
    folderId: ''
  });
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    color: '#2563eb'
  });
  const [errors, setErrors] = useState({});
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
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
    setShowCreateFolder(false);
    setNewFolderData({ name: '', color: '#2563eb' });
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
  
const generateDescription = async (title) => {
    if (!title.trim()) return;
    
    setIsGeneratingDescription(true);
    try {
      const response = await fetch('https://test-api.apper.io/fn/e6620bc7bfc443f191fe767233b2ef49/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      });

      const data = await response.json();
      
      if (data.success && data.description) {
        setFormData(prev => ({
          ...prev,
          description: data.description,
          generatedDescription: data.description
        }));
        toast.success('Description generated successfully');
      } else {
        console.error('Failed to generate description:', data.error);
        toast.error('Could not generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Could not generate description');
    } finally {
      setIsGeneratingDescription(false);
    }
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
      
      // Auto-generate description after fetching title
      await generateDescription(title);
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

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));
    
    // Auto-generate description when title is manually changed and has substance
    if (title.trim().length > 10 && title !== formData.title) {
      generateDescription(title);
    }
  };

  const handleGenerateDescription = () => {
    if (formData.title.trim()) {
      generateDescription(formData.title);
    } else {
      toast.error('Please enter a title first');
    }
  };
  
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    let finalFolderId = formData.folderId;
    
    // If creating a new folder, create it first
    if (showCreateFolder && newFolderData.name.trim()) {
      try {
        const { folderService } = await import('@/services/api/folderService');
        const createdFolder = await folderService.create({
          name: newFolderData.name.trim(),
          color: newFolderData.color
        });
        if (createdFolder) {
          finalFolderId = createdFolder.Id;
          toast.success('Folder created successfully');
        }
      } catch (error) {
        toast.error('Failed to create folder');
        return;
      }
    }

    const bookmarkData = {
      ...formData,
      url: formData.url.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      folderId: finalFolderId
    };
    
    if (isEditing) {
      bookmarkData.Id = bookmark.Id;
    }
    
    onSave(bookmarkData);
  };

  const handleCreateFolder = async () => {
    if (!newFolderData.name.trim()) {
      toast.error('Folder name is required');
      return;
    }

    try {
      const { folderService } = await import('@/services/api/folderService');
      const createdFolder = await folderService.create({
        name: newFolderData.name.trim(),
        color: newFolderData.color
      });
      
      if (createdFolder) {
        setFormData(prev => ({ ...prev, folderId: createdFolder.Id }));
        setShowCreateFolder(false);
        setNewFolderData({ name: '', color: '#2563eb' });
        toast.success('Folder created and selected');
        // Trigger parent to refresh folder list if needed
        if (window.refreshFolders) window.refreshFolders();
      }
    } catch (error) {
toast.error('Failed to create folder');
    }
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
            onChange={handleTitleChange}
            error={errors.title}
          />
          {errors.title && (
            <p className="text-sm text-error mt-1">{errors.title}</p>
          )}
        </div>
        
<div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="description">Description</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerateDescription}
              disabled={!formData.title.trim() || isGeneratingDescription}
              className="text-xs px-2 py-1 h-auto"
            >
              {isGeneratingDescription ? (
                <>
                  <ApperIcon name="Loader2" className="w-3 h-3 animate-spin mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <ApperIcon name="Sparkles" className="w-3 h-3 mr-1" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          <textarea
            id="description"
            placeholder="Optional description or notes (AI can generate this for you)"
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
{/* Folder Selection */}
        <div className="space-y-2">
          <Label>Folder (Optional)</Label>
          <div className="space-y-2">
            <select
              value={formData.folderId}
              onChange={(e) => setFormData(prev => ({ ...prev, folderId: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.Id} value={folder.Id}>
                  {folder.name || folder.Name}
                </option>
              ))}
            </select>
            
            {!showCreateFolder && (
              <button
                type="button"
                onClick={() => setShowCreateFolder(true)}
                className="w-full px-3 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                <ApperIcon name="Plus" className="w-4 h-4" />
                Create New Folder
              </button>
            )}
            
            {showCreateFolder && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Create New Folder</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderData({ name: '', color: '#2563eb' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                  </button>
                </div>
                
                <div>
                  <Label required>Folder Name</Label>
                  <Input
                    type="text"
                    value={newFolderData.name}
                    onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter folder name"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <Label>Folder Color</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={newFolderData.color}
                      onChange={(e) => setNewFolderData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={newFolderData.color}
                      onChange={(e) => setNewFolderData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 font-mono text-sm"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateFolder}
                    size="sm"
                    className="flex-1"
                  >
                    Create Folder
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateFolder(false);
                      setNewFolderData({ name: '', color: '#2563eb' });
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
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