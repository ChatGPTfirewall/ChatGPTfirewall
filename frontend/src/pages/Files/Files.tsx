import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getFiles } from '../../api/fileApi';
import { useUser } from '../../context/UserProvider';
import { File } from '../../models/File';
import { Button } from '@fluentui/react-components';
import { ArrowLeft20Regular } from '@fluentui/react-icons';
import FileSidebar from '../../components/layout/FilesSideBar/FileSideBar'; // Import your new sidebar

const FileDetailPage = () => {
    const { id } = useParams();
    const [file, setFile] = useState<File | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const { user } = useUser();
    
    useEffect(() => {
        if (!user) return;
      console.log("id is: ", id); // Debugging output
      setFile(null);
      if (id) {
        getFiles(user.auth0_id).then((files) => {
          const selectedFile = files.find((f) => f.id === id);
          if (selectedFile) setFile(selectedFile);
        });
      }
    }, [id]);

  const scrollToMatch = (targetRef: React.RefObject<HTMLDivElement>, line: number) => {
    if (targetRef.current) {
      const elements = targetRef.current.querySelectorAll('[data-line]');
      const targetElement = Array.from(elements).find((el) =>
        el.getAttribute('data-line') === String(line)
      );
      if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <FileSidebar /> {/* Add the new sidebar here */}

      {/* Content Panel */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', userSelect: 'text' }}>
        {file ? (
          file.text?.split('\n').map((line, index) => (
            <p key={index} data-line={index + 1}>{line}</p>
          ))
        ) : (
          <p>Select a file from the sidebar.</p>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '5px', background: '#ccc', cursor: 'col-resize' }} />

      {/* Chapters & Summaries Panel */}
      {file && (
        <div ref={summaryRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', userSelect: 'text' }}>
          {file.headings?.map((chapter, index) => (
            <div key={index} data-line={chapter.line}>
              <h3>{chapter.heading}</h3>
              <p>{chapter.summary}</p>
              <Button icon={<ArrowLeft20Regular />} onClick={() => scrollToMatch(contentRef, chapter.line)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileDetailPage;
