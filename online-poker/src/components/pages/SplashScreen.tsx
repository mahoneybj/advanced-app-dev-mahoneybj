import "../../App.css";

// Simple splash screen for certain loading states such as loging in and creating a game
const SplashScreen = () => {
  return (
    <div className={`SplashScreen`}>
      <img src="/logo192.png" alt="logo" className="logo" />
    </div>
  );
};

export default SplashScreen;
