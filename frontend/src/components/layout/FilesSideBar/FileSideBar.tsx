import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight24Regular, ChevronLeft24Regular } from '@fluentui/react-icons';
import { Divider, DrawerBody, DrawerHeader, InlineDrawer } from '@fluentui/react-components';
import CompactFileList from '../../common/CompactFileList/CompctFileList';
import { getFiles } from '../../../api/fileApi';
import FilesSideBarStyles from './FileSideBarStyles';
import { File } from '../../../models/File';
import { useUser } from '../../../context/UserProvider';
import FileExplorer from '../../common/FileExplorer/FileExplorer';


type SelectionItemId = string | number;

const FileSidebar = () => {
  const styles = FilesSideBarStyles();
  const { user } = useUser();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed');
    return isCollapsed === 'true';
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user) return;
    getFiles(user.auth0_id).then(setFiles);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('sidebarCollapsed', String(!collapsed));
  };

  const handleFileSelection = (_e: any, data: { selectedItems: Set<SelectionItemId> }) => {
    const selectedFileId = Array.from(data.selectedItems)[0]; // Get first selected file
    if (selectedFileId) {
      navigate(`/files/${selectedFileId}`);
    }
  };

  return (
    <div className={styles.sidebarContainer}>
      <InlineDrawer separator open={!collapsed} position="start" className={styles.drawer}>
        <DrawerHeader>
          < FileExplorer />
        </DrawerHeader>
        <DrawerBody>
          <CompactFileList files={files} onSelectionChange={handleFileSelection} />
          <Divider className={styles.divider} />
        </DrawerBody>
      </InlineDrawer>
      <div className={styles.toggleArea}>
        {collapsed ? (
          <ChevronRight24Regular className={styles.toggleIcon} onClick={toggleSidebar} />
        ) : (
          <ChevronLeft24Regular className={styles.toggleIcon} onClick={toggleSidebar} />
        )}
      </div>
    </div>
  );
};

export default FileSidebar;