import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import LoginButtonStyles from "./LoginButtonStyles";
import { Button } from "@fluentui/react-components";
import { SignOut24Regular, PersonInfoRegular } from "@fluentui/react-icons";
import UserInfoDialog from "../Dialogs/UserInfoDialog";
import InfoHover from "../Dialogs/InfoHover";
import { useState, useEffect } from "react";
import { getUser } from "../../../api/usersApi";

const LoginButton = () => {
  const styles = LoginButtonStyles();
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data and update state
  const fetchRemainingMessages = async () => {
    if (user?.sub) {
      setLoading(true);
      try {
        const fetchedUser = await getUser(user.sub); // Fetch user data using Auth0 ID
        setRemainingMessages(fetchedUser.max_api_calls);
      } catch (error) {
        console.error("Failed to fetch remaining messages:", error);
        setRemainingMessages(null); // Reset to null in case of error
      } finally {
        setLoading(false);
      }
    }
  };

  // Prefetch remaining messages when the component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user?.sub) {
      fetchRemainingMessages();
    }
  }, [isAuthenticated, user?.sub]);

  if (isAuthenticated && user) {
    return (
      <div className={styles.loginButtonContainer}>
        <InfoHover>
          {/* Display updated remaining messages and trigger fetch */}
          <div
            onMouseEnter={fetchRemainingMessages} // Trigger additional refresh on hover
            style={{ padding: '8px', width: '15rem' }}
          >
            <strong>{t('remainingMessages')}:</strong>
            <p>
              {loading
                ? t('loading') // Show loading state
                : remainingMessages !== null
                ? `${remainingMessages}` // Show fetched remaining messages
                : t('errorFetchingMessages')}
            </p>
          </div>
        </InfoHover>

        <div className={styles.UserDetailsContainer}>
          <div className={styles.userText}>{user.nickname}</div>
          <div className={styles.mailText}>{user.email}</div>
        </div>

        <Button
          appearance="secondary"
          onClick={() => setIsDialogOpen(true)}
          style={{ marginRight: "10px" }}
          icon={<PersonInfoRegular/>}
        >
          {t('UserInfoButtonLabel')}
        </Button>

        {/* UserInfoDialog: Opens on button click */}
        {user.sub && (
          <UserInfoDialog
            auth0Id={user.sub}
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
          />
        )}

        {/* Logout Button */}
        <Button
          appearance="primary"
          icon={<SignOut24Regular />}
          size="large"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
      </div>
    );
  } else {
    return (
      <Button appearance="primary" onClick={() => loginWithRedirect()}>
        {t('login')}
      </Button>
    );
  }
};

export default LoginButton;