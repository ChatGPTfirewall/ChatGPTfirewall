import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight24Filled, ChevronLeft24Filled } from '@fluentui/react-icons';
import { Divider, DrawerBody, InlineDrawer } from '@fluentui/react-components';
import CompactFileList from '../../common/CompactFileList/CompactFileList';
import { getFiles } from '../../../api/fileApi';
import FilesSideBarStyles from './FileSideBarStyles';
import { File } from '../../../models/File';
import { useUser } from '../../../context/UserProvider';


type SelectionItemId = string | number;

interface FileSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const FileSidebar: React.FC<FileSidebarProps> = ({ collapsed: externalCollapsed, onCollapsedChange }) => {
  const styles = FilesSideBarStyles();
  const { user } = useUser();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [fileChanged, setFileChanged] = useState(false);

  // Internal state management
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed');
    return isCollapsed === 'true';
  });

  // If external control is provided, use it; otherwise, fallback to internal state
  const collapsed = externalCollapsed ?? internalCollapsed;

  // Sync externalCollapsed to localStorage whenever it changes
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      localStorage.setItem('sidebarCollapsed', String(externalCollapsed));
      setInternalCollapsed(externalCollapsed); // Ensure internal state stays in sync
    }
  }, [externalCollapsed]);

  useEffect(() => {
    if (!user) return;
    getFiles(user.auth0_id).then(setFiles);
  }, [user]);

  const toggleSidebar = () => {
    const newCollapsed = !collapsed;

    if (externalCollapsed === undefined) {
      setInternalCollapsed(newCollapsed);
    }

    // Notify parent if provided
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
      // Reset fileChanged state when sidebar is expanded
      if (!newCollapsed) {
        setFileChanged(false);
      }
    }
    localStorage.setItem('sidebarCollapsed', String(newCollapsed));
  };

  const handleFileSelection = (_e: any, data: { selectedItems: Set<SelectionItemId> }) => {
    const selectedFileId = Array.from(data.selectedItems)[0]; // Get first selected file
    if (selectedFileId) {
      setFileChanged(true);
      navigate(`/files/${selectedFileId}`);
    }
  };



  const handleMouseEnter = () => {
    setFileChanged(false);
  };

  const handleMouseLeave = () => {
    if (fileChanged) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={styles.sidebarContainer}
    >
      <div
      className={styles.sidebarContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
        <InlineDrawer separator open={!collapsed} position="start" className={styles.drawer}>
          <DrawerBody>
            <CompactFileList files={files} onSelectionChange={handleFileSelection} />
            <Divider className={styles.divider} />
          </DrawerBody>
        </InlineDrawer>
      </div>
      <div className={styles.toggleArea}>
        {collapsed ? (
          <ChevronRight24Filled className={styles.toggleIcon} onClick={toggleSidebar} />
        ) : (
          <ChevronLeft24Filled className={styles.toggleIcon} onClick={toggleSidebar} />
        )}
      </div>
    </div>
  );
};

export default FileSidebar;