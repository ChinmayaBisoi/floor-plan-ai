interface AuthState {
  isSignedIn: boolean;
  userName: string | null;
  userId: string | null;
}

type AuthContext = AuthState & {
  refreshAuth: () => Promise<boolean>;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

interface DesignItem {
  id: string;
  name?: string | null;
  sourceImage: string;
  renderedImage?: string | null;
  timestamp: number;
}
