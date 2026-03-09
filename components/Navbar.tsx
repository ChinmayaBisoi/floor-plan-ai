import { useEffect, useState } from "react";
import Button from "./ui/Button";
import Logo from "./Logo";
import PuterConsentModal from "./PuterConsentModal";
import { useOutletContext } from "react-router";

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut } =
    useOutletContext<AuthContext>();
  const [showConsent, setShowConsent] = useState(false);

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
      } catch (e) {
        console.error("Puter sign out failed:", e);
      }
      return;
    }
    setShowConsent(true);
  };

  const handleConsentContinue = async () => {
    setShowConsent(false);
    try {
      await signIn();
    } catch (e) {
      console.error("Puter sign in failed:", e);
    }
  };

  useEffect(() => {
    const openSignIn = () => setShowConsent(true);
    window.addEventListener("floorplan:openSignIn", openSignIn);
    return () => window.removeEventListener("floorplan:openSignIn", openSignIn);
  }, []);

  return (
    <>
      {showConsent && (
        <PuterConsentModal
          onContinue={handleConsentContinue}
          onCancel={() => setShowConsent(false)}
        />
      )}
      <header className="navbar">
      <nav className="inner">
        <div className="left">
          <a href="/" className="brand">
            <Logo className="logo" />
            <span className="name">Floor Plan AI</span>
          </a>
          <ul className="links">
            <a href="#">Product</a>
            <a href="#">Pricing</a>
            <a href="#">Community</a>
            <a href="#">Enterprise</a>
          </ul>
        </div>
        <div className="actions">
          {isSignedIn ? (
            <>
              <span className="greeting">
                {userName ? `Hi, ${userName}` : "Signed in"}
              </span>
              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleAuthClick}
                size="sm"
                variant="ghost"
              >
                Log In
              </Button>
              <a href="#upload" className="cta">
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
    </>
  );
};

export default Navbar;
