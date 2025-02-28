import { useEffect } from 'react';
import {
  ChevronRight24Filled,
  ChevronLeft24Filled
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

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapsedChange }) => {
  const styles = SideBarStyles();

  const toggleSidebar = () => {
    onCollapsedChange(!collapsed);
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
          <ChevronLeft24Filled
            className={styles.toggleIcon}
            onClick={toggleSidebar}
          />
        ) : (
          <ChevronRight24Filled
            className={styles.toggleIcon}
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;