import CookieConsent from "react-cookie-consent";
import { useEffect } from "react";

export default function ConsentBanner() {
  useEffect(() => {
    const analyticsConsent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('analytics-consent='))
      ?.split('=')[1];

    if (analyticsConsent === 'true') {
      import('react-ga4').then((ReactGA) => {
        ReactGA.default.initialize('G-ZT70ELG7BQ');
        ReactGA.default.send('pageview');
      });
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    document.cookie = `analytics-consent=${accepted}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  return (
    <CookieConsent
      enableDeclineButton
      onAccept={() => handleConsent(true)}
      onDecline={() => handleConsent(false)}
      buttonText="Accept"
      declineButtonText="Refuse"
      style={{
        background: "#2b373b",
        color: "#ffffff",
        borderRadius: "20px",
        padding: "20px",
        textAlign: "center",
        width: "80%",
        maxWidth: "800px",
        margin: "0 auto",
        position: "fixed",
        bottom: "20px",
        left: "0",
        right: "0",
        placeContent: "center",
        fontFamily: "var(--font-bricolage-grotesque)",
      }}
      buttonStyle={{
        color: "#4e503b",
        fontSize: "14px",
        background: "#f5f5f5",
        border: "none",
        borderRadius: "12px",
        padding: "10px 20px",
        margin: "0 10px",
        cursor: "pointer",
      }}
      declineButtonStyle={{
        color: "#ffffff",
        background: "#ff4b5c",
        fontSize: "14px",
        border: "none",
        borderRadius: "12px",
        padding: "10px 20px",
        margin: "0 10px",
        cursor: "pointer",
      }}
    >
      This website uses cookies to enhance the user experience. You can accept or refuse tracking cookies.
    </CookieConsent>
  );
}
