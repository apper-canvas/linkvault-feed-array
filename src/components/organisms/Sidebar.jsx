import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { cn } from '@/utils/cn';

const Sidebar = ({ folders, tags, bookmarkCounts, pinnedBookmarks, className }) => {
  const location = useLocation();
  
const navigationItems = [
    { path: '/', label: 'All Bookmarks', icon: 'Bookmark', count: bookmarkCounts.total },
    { path: '/recent', label: 'Recently Added', icon: 'Clock', count: bookmarkCounts.recent },
    { path: '/archive', label: 'Archive', icon: 'Archive', count: bookmarkCounts.archived },
    { path: '/folders', label: 'Folders', icon: 'Folder', count: folders?.length || 0 },
  ];

  const handleBookmarkClick = (url) => {
    window.open(url, '_blank');
  };
  
  const NavItem = ({ to, icon, label, count, className: itemClassName }) => (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
        isActive
          ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-l-2 border-primary"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
        itemClassName
      )}
    >
      <ApperIcon name={icon} className="w-5 h-5 transition-colors group-hover:scale-110" />
      <span className="flex-1">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge variant="default" size="sm">{count}</Badge>
      )}
    </NavLink>
  );
  
  return (
    <aside className={cn("bg-white border-r border-gray-200", className)}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <ApperIcon name="Bookmark" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LinkVault
            </h1>
            <p className="text-sm text-gray-500">Bookmark Manager</p>
          </div>
        </div>
        
{/* Pinned Bookmarks Section */}
        {pinnedBookmarks && pinnedBookmarks.length > 0 && (
          <div className="mb-6">
            <div className="px-4 mb-3">
              <div className="flex items-center gap-2">
                <ApperIcon name="Star" size={16} className="text-yellow-500 fill-yellow-400" />
                <h3 className="text-sm font-semibold text-gray-900">Pinned</h3>
              </div>
            </div>
            <div className="space-y-1">
              {pinnedBookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark.url)}
                  className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-gray-100 transition-colors duration-150 group"
                  title={bookmark.title || bookmark.name}
                >
                  <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                    {bookmark.favicon ? (
                      <img 
                        src={bookmark.favicon} 
                        alt="" 
                        className="w-4 h-4 rounded-sm"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ApperIcon name="Globe" size={14} className="text-gray-400" />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-gray-700 truncate group-hover:text-gray-900">
                    {bookmark.title || bookmark.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              count={item.count}
            />
          ))}
        </nav>
        
        {folders && folders.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3">
              Folders
            </h3>
            <div className="space-y-1">
              {folders.slice(0, 5).map((folder) => (
<NavItem
                  key={folder.Id}
                  to={`/folder/${folder.Id}`}
                  icon={folder.isShared ? "FolderOpen" : "Folder"}
                  label={
                    <div className="flex items-center gap-2">
                      <span>{folder.name}</span>
                      {folder.isShared && (
                        <ApperIcon name="Share2" className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                  }
                  count={folder.bookmarkCount}
                />
              ))}
            </div>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-3">
              Popular Tags
            </h3>
            <div className="space-y-1">
              {tags.slice(0, 8).map((tag) => (
                <NavItem
                  key={tag.name}
                  to={`/tag/${encodeURIComponent(tag.name)}`}
                  icon="Tag"
                  label={tag.name}
                  count={tag.usageCount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;