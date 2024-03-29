import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  FunctionComponent
} from 'react';
import { User } from '../models/User'; // Stelle sicher, dass der Pfad korrekt ist
import { useAuth0 } from '@auth0/auth0-react';
import { getUser, createUser } from '../api/usersApi'; // Stelle sicher, dass der Pfad korrekt ist
import { useTranslation } from 'react-i18next';

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: FunctionComponent<{ children: ReactNode }> = ({
  children
}) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const { user: auth0User, isAuthenticated, isLoading } = useAuth0();
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchUserFromBackend = async () => {
      if (!isLoading && isAuthenticated && auth0User?.sub) {
        try {
          const audience = import.meta.env.VITE_JWT_AUDIENCE as string;
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience
            }
          });
          localStorage.setItem('userToken', accessToken);
          const fetchedUser = await getUser(auth0User.sub);
          setUser(fetchedUser);
        } catch (error) {
          console.error(
            'Error fetching user from backend, creating new one.',
            error
          );
          const newUser: User = {
            auth0_id: auth0User.sub,
            username: auth0User.name || '',
            email: auth0User.email || '',
            lang: i18n.language,
            max_api_calls: auth0User.max_api_calls
          };
          createUser(newUser)
            .then(setUser)
            .catch((creationError) => {
              console.error('Error creating user in backend!', creationError);
            });
        }
      }
    };

    fetchUserFromBackend();
  }, [auth0User, isAuthenticated, isLoading, i18n.language]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
