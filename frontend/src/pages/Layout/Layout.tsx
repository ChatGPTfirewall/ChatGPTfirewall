import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '../../components/layout/NavBar/NavBar';
import LayoutStyles from './LayoutStyles';
import Sidebar from '../../components/layout/SideBar/SideBar';
import { useAuth0 } from '@auth0/auth0-react';
import LandingPage from '../LandingPage/LandingPage';

const Layout = () => {
  const styles = LayoutStyles();
  const location = useLocation();
  const { isAuthenticated } = useAuth0();
  const hideSidebarRoutes = ['/demo', '/chat'];
  const showSidebar =
    isAuthenticated &&
    !hideSidebarRoutes.includes(location.pathname) &&
    !location.pathname.startsWith('/files');  

  if (!isAuthenticated) {
    return (
      <div className={styles.layout}>
        <NavBar />
        <LandingPage />
      </div>
    );
  }
  return (
    <div className={styles.layout}>
      <NavBar />
      <div className={styles.container}>
        {showSidebar && <Sidebar />}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
