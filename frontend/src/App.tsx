import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './pages/Layout/Layout';
import Demo from './pages/Demo/Demo';
import Chat from './pages/Chat/Chat';
import Room from './pages/Room/Room';
import Files from './pages/Files/Files';
import Page404 from './pages/Page404/Page404';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import FileDetailPage from './pages/Files/Files';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<Chat />} />
            <Route path="demo" element={<Demo />} />
            <Route path="chat">
              <Route index element={<Chat />} />
              <Route path="room/:id" element={<Room />} />
            </Route>
            <Route path="files" element={<Files />} />
            <Route path="files/:id" element={<FileDetailPage />} />
          </Route>
          <Route path="*" element={<Page404 />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
