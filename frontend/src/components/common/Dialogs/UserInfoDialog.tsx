import React, { useState, useEffect } from "react";
import { Dialog, DialogSurface, DialogBody, DialogTitle, Button } from "@fluentui/react-components";
import { Dismiss24Regular } from '@fluentui/react-icons';
import { User } from "../../../models/User";
import { getUser } from "../../../api/usersApi";
import { useTranslation } from 'react-i18next';

interface UserInfoDialogProps {
  auth0Id: string; // Auth0 user ID
  isOpen: boolean;
  onClose: () => void;
}

const UserInfoDialog: React.FC<UserInfoDialogProps> = ({ auth0Id, isOpen, onClose }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && auth0Id) {
      fetchUserData();
    }
  }, [isOpen, auth0Id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUser = await getUser(auth0Id);
      setUserData(fetchedUser);
    } catch (err) {
      setError("Failed to fetch user details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(_, { open }) => !open && onClose()}>
      <DialogSurface>
        <DialogBody style={{ grid: "none" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <DialogTitle>{t('userInformationDialogTitle')}</DialogTitle>
            <Button
              appearance="subtle"
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          </div>
  
          {loading && <p>{t('loading')}</p>}
  
          {error && <p style={{ color: "red" }}>{t('error')} {error}</p>}
  
          {userData && (
            <div>
              <p>
                <strong>{t('username')}:</strong> {userData.username}
              </p>
              <p>
                <strong>{t('email')}:</strong> {userData.email}
              </p>
              <p>
                <strong>{t('language')}:</strong> {userData.lang}
              </p>
              <p>
                <strong>{t('remainingMessages')}:</strong> {userData.max_api_calls}
              </p>
            </div>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
 
export default UserInfoDialog;
  