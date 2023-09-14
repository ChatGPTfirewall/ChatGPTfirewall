import { useId, useBoolean } from '@fluentui/react-hooks';
import { Add24Regular, ArrowUpload24Regular, Box24Regular } from "@fluentui/react-icons";
import { Spinner } from '@fluentui/react';
import styles from "./KnowledgeBaseModal.module.css";
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  Text,
  Modal,
  IIconProps,
  IStackProps,
} from '@fluentui/react';
import { IconButton, IButtonStyles } from '@fluentui/react/lib/Button';
import { FileCard } from '../FileCard';
import { uploadFiles } from '../../api';
import { uploadToNextcloud } from '../../api';
import { useAuth0 } from '@auth0/auth0-react';
import { useState, useRef } from 'react';


interface Props {
  buttonClassName?: string;
}
export const KnowledgeBaseModal = ({ buttonClassName }: Props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth0();
  const emptyFileNames:any[] = []
  const [isLoading, setIsLoading] = useState(false); // Neuer Zustand für den Upload-Zustand
  const [fileNames, setFileNames] = useState(emptyFileNames); // Zustand für die Dateinamen hinzufügen
  

  // State-Hooks für die Werte der Eingabefelder
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [nextCloudUserName, setUsername] = useState('');
  const [isNextcloudModalOpen, { setTrue: showNextCloudModal, setFalse: hideNextcloudModal }] = useBoolean(false);
  

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleFileChange = (event: any) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      const newFileNames = []; // Neues Array für Dateinamen erstellen

      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
        newFileNames.push(files[i].name); // Dateinamen zum neuen Array hinzufügen
      }

      formData.append("user", user!.sub as string);

      setFileNames(newFileNames); // Dateinamen in den Zustand setzen

      setIsLoading(true); // Setzen Sie isLoading auf true, um das Ladesymbol anzuzeigen

      uploadFiles(formData)
        .then(() => {
          setIsLoading(false); // Setzen Sie den Upload-Zustand auf false, wenn der Upload abgeschlossen ist
          setFileNames([]); // Setzen Sie den Dateinamen-Zustand auf ein leeres Array nach Abschluss des Uploads
        })
        .catch((error) => {
          setIsLoading(false); // Setzen Sie den Upload-Zustand auf false, wenn ein Fehler auftritt
          setFileNames([]); // Setzen Sie den Dateinamen-Zustand auf ein leeres Array bei Fehlern
          console.error('Upload error:', error);
        });
    }
  };

  /*
    Popup für Nextcloud
  */
 // Handler für die Änderung der Eingabefelder
 const handleClientIdChange = (event:any) => {
  setClientId(event.target.value);
};

const handleClientSecretChange = (event:any) => {
  setClientSecret(event.target.value);
};

const handleAuthorizationUrlChange = (event:any) => {
  setAuthorizationUrl(event.target.value);
};

const handleUsernameChange = (event:any) => {
  setUsername(event.target.value);
};

// Handler für das Öffnen des Popups
const handleNextcloudClick = () => {
  showNextCloudModal(); // showModal kann so benannt sein wie in deinem Code, um das Haupt-Modal zu öffnen
};

  // Handler für das Schließen des Popups und Speichern der eingegebenen Werte
  const handleNextcloudSave = () => {
    uploadToNextcloud(clientId, clientSecret, authorizationUrl, nextCloudUserName);
    //const popup = window.open(authorizationUrl + "index.php/apps/oauth2/authorize?client_id=" + clientId + "&response_type=code&scope=read", "Nextcloud Auth", "width=500,height=600");
    const popup = window.open("/api/upload/nextcloud?clientId=" +  clientId + "&" + "clientSecret=" + clientSecret + "&" + "authorizationUrl=" + authorizationUrl + "&" + "nextCloudUserName="+ nextCloudUserName, "Nextcloud Auth", "width=500,height=600");
  
    //setTimeout(() => {
    //  if (!popup.closed) {
    //    popup.close();
    //  }
        //uploadToNextcloud(clientId, clientSecret, authorizationUrl, nextCloudUserName);
  
      // Schließen Sie das Modal
      hideNextcloudModal();
   // }, 100000); // 10000 Millisekunden = 10 Sekunden
  };

    // Inhalt des Popups für Nextcloud
    const nextcloudModalContent = (
      <div className={styles.nextcloudModal}>
        <h2>Nextcloud Configuration</h2>
        <div>
          <label htmlFor="clientId">Client ID: (Client-Identifikationsmerkmal)</label>
          <input type="text" id="clientId" value={clientId} onChange={handleClientIdChange} />
        </div>
        <div>
          <label htmlFor="clientSecret">Client Secret: (Geheimnis)</label>
          <input type="text" id="clientSecret" value={clientSecret} onChange={handleClientSecretChange} />
        </div>
        <div>
          <label htmlFor="authorizationUrl">Authorization URL: (https:example.com/)</label>
          <input type="text" id="authorizationUrl" value={authorizationUrl} onChange={handleAuthorizationUrlChange} />
        </div>
        <div>
          <label htmlFor="nextCloudUserName">Nextcloud Username:</label>
          <input type="text" id="nextCloudUserName" value={nextCloudUserName} onChange={handleUsernameChange} />
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.saveButton} onClick={handleNextcloudSave}>Save</button>
          <button className={styles.cancelButton} onClick={hideNextcloudModal}>Cancel</button>
        </div>
      </div>
    );




  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId('title');

  const redirectToS3 = () => {
    // Perform the redirection to Amazon S3 here
    window.location.href = "https://aws.amazon.com/s3"; // Replace this with the actual Amazon S3 URL
  };

  return (
    <div>
      <div className={`${styles.container} ${buttonClassName ?? ""}`} onClick={showModal}>
        <Add24Regular />
        <Text>{"Add Files"}</Text>
      </div>
      <Modal
        titleAriaId={titleId}
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
      >
        <div className={contentStyles.header}>
          <h2 className={contentStyles.heading} id={titleId}>
            Select method
          </h2>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          />
        </div>
        <div className={styles.modal_container}>
          <FileCard Icon={<Box24Regular />} title="S3 Storage" subtitle="Scalable storage in the cloud." onClick={redirectToS3} />
          <FileCard Icon={<Box24Regular />} title="Nextcloud" onClick={handleNextcloudClick}/>
          <FileCard onClick={handleClick} Icon={<ArrowUpload24Regular />} title="Upload" subtitle="Select a folder or a file to upload." >
              <input type="file" name="files" style={{ display: 'none' }} ref={hiddenFileInput} onChange={handleFileChange} multiple accept=".pdf,.docx,.doc,.txt,.rtf,.html,.xml,.csv,.md" />
          
            </FileCard>
            {isLoading && (
            <Spinner label={`Uploading ${fileNames}`} ariaLive="assertive" labelPosition="right" />
          )}
        </div>
      </Modal>
      <Modal
        isOpen={isNextcloudModalOpen}
        onDismiss={hideNextcloudModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
      >
        {nextcloudModalContent} 
      </Modal>
    </div>
  );
};

const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
  },
  header: [
    // eslint-disable-next-line deprecation/deprecation
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],
  heading: {
    color: theme.palette.neutralPrimary,
    fontWeight: FontWeights.semibold,
    fontSize: 'inherit',
    margin: '0',
  },
  body: {
    grid: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
});
const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};

