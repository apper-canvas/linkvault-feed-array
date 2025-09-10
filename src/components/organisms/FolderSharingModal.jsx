import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Badge from '@/components/atoms/Badge';
import { folderSharingService } from '@/services/api/folderSharingService';

const FolderSharingModal = ({
  isOpen,
  onClose,
  folder,
  onSharingUpdate
}) => {
  const [isShared, setIsShared] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [permissions, setPermissions] = useState('view');
  const [shareLink, setShareLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (folder && isOpen) {
      setIsShared(folder.isShared || false);
      setRecipients(folder.sharedWith || []);
      setPermissions(folder.sharePermissions || 'view');
      setShareLink(folder.isShared ? folderSharingService.generateShareLink(folder.Id) : '');
      setNewRecipient('');
      setErrors({});
    }
  }, [folder, isOpen]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    const email = newRecipient.trim().toLowerCase();
    
    if (!email) {
      setErrors({ recipient: 'Email address is required' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ recipient: 'Please enter a valid email address' });
      return;
    }
    
    if (recipients.includes(email)) {
      setErrors({ recipient: 'This email is already added' });
      return;
    }
    
    setRecipients(prev => [...prev, email]);
    setNewRecipient('');
    setErrors({});
  };

  const handleRemoveRecipient = (emailToRemove) => {
    setRecipients(prev => prev.filter(email => email !== emailToRemove));
  };

  const handleShare = async () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setIsLoading(true);
    try {
      const success = await folderSharingService.shareFolder(folder.Id, recipients, permissions);
      if (success) {
        setIsShared(true);
        setShareLink(folderSharingService.generateShareLink(folder.Id));
        onSharingUpdate?.();
      }
    } catch (error) {
      console.error('Error sharing folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSharing = async () => {
    setIsLoading(true);
    try {
      const success = await folderSharingService.unshareFolder(folder.Id);
      if (success) {
        setIsShared(false);
        setRecipients([]);
        setShareLink('');
        onSharingUpdate?.();
      }
    } catch (error) {
      console.error('Error stopping share:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    setIsLoading(true);
    try {
      const success = await folderSharingService.updateSharePermissions(folder.Id, permissions);
      if (success) {
        onSharingUpdate?.();
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    await folderSharingService.copyShareLink(folder.Id);
  };

  if (!folder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${folder.name}"`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Current Sharing Status */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
              >
                <ApperIcon name="Folder" className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{folder.name}</h3>
                <p className="text-sm text-gray-500">
                  {isShared ? 'Currently shared' : 'Not shared'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isShared && (
                <ApperIcon name="Users" className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Sharing Controls */}
        {!isShared ? (
          <div className="space-y-4">
            <div>
              <Label>Add people to share with</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newRecipient}
                  onChange={(e) => {
                    setNewRecipient(e.target.value);
                    if (errors.recipient) setErrors({});
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  error={errors.recipient}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddRecipient}
                  disabled={!newRecipient.trim()}
                >
                  <ApperIcon name="Plus" className="w-4 h-4" />
                </Button>
              </div>
              {errors.recipient && (
                <p className="text-sm text-error mt-1">{errors.recipient}</p>
              )}
            </div>

            {recipients.length > 0 && (
              <div>
                <Label>Recipients ({recipients.length})</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {recipients.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-700">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(email)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-error"
                      >
                        <ApperIcon name="X" className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Permission Level</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="permissions"
                    value="view"
                    checked={permissions === 'view'}
                    onChange={(e) => setPermissions(e.target.value)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Can View</div>
                    <div className="text-sm text-gray-500">Recipients can view bookmarks but not edit</div>
                  </div>
                  <ApperIcon name="Eye" className="w-4 h-4 text-gray-400" />
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="permissions"
                    value="edit"
                    checked={permissions === 'edit'}
                    onChange={(e) => setPermissions(e.target.value)}
                    className="text-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Can Edit</div>
                    <div className="text-sm text-gray-500">Recipients can view and add/edit bookmarks</div>
                  </div>
                  <ApperIcon name="Edit2" className="w-4 h-4 text-gray-400" />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Recipients */}
            <div>
              <Label>Shared with ({recipients.length} people)</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                {recipients.map((email, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-sm text-gray-700">{email}</span>
                    <Badge variant="default" size="sm">
                      {permissions === 'view' ? 'View' : 'Edit'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Link */}
            <div>
              <Label>Share Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 bg-gray-50"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyLink}
                >
                  <ApperIcon name="Copy" className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Permission Update */}
            <div>
              <Label>Update Permissions</Label>
              <div className="flex gap-2 mt-2">
                <select
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
                  <option value="view">Can View</option>
                  <option value="edit">Can Edit</option>
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleUpdatePermissions}
                  disabled={isLoading}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          {!isShared ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleShare}
              disabled={isLoading || recipients.length === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <ApperIcon name="Share2" className="w-4 h-4 mr-2" />
                  Share Folder
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="error"
              onClick={handleStopSharing}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <ApperIcon name="UserX" className="w-4 h-4 mr-2" />
                  Stop Sharing
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FolderSharingModal;