import { useState, useEffect } from 'react';
import {
  ChevronRight24Regular,
  ChevronLeft24Regular
} from '@fluentui/react-icons';
import RoomList from '../../common/RoomList/RoomList';
import {
  Divider,
  DrawerBody,
  DrawerHeader,
  InlineDrawer
} from '@fluentui/react-components';
import FileExplorer from '../../common/FileExplorer/FileExplorer';
import SideBarStyles from './SideBarStyles';

const Sidebar = () => {
  const styles = SideBarStyles();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const isCollapsed = localStorage.getItem('sidebarCollapsed');
    return isCollapsed === 'true';
  });

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className={styles.sidebarContainer}>
      <InlineDrawer
        separator
        open={!collapsed}
        position={'start'}
        className={styles.drawer}
      >
        <DrawerHeader>
          <FileExplorer />
        </DrawerHeader>
        <DrawerBody>
          <Divider className={styles.divider} />
          <RoomList />
        </DrawerBody>
      </InlineDrawer>
      <div className={styles.toggleArea}>
        {!collapsed ? (
          <ChevronLeft24Regular
            className={styles.toggleIcon}
            onClick={toggleSidebar}
          />
        ) : (
          <ChevronRight24Regular
            className={styles.toggleIcon}
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
