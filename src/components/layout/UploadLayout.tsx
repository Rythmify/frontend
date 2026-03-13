import { Outlet, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const UploadLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="sticky top-0 z-50 bg-bg border-b border-border">
        <div className="w-full px-8 flex items-center justify-between h-[46px]">
          
          {/*Left side: Logo and page title */}
          <div className="flex items-center gap-6">
            <Link to="/discover" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <i className="fa-solid fa-wave-square text-accent text-xl" />
            </Link>
            
            {/*Page Title */}
            <div className="flex items-center gap-6 h-full">
              <h2 className="text-text font-medium text-sm tracking-wide">
                Upload
              </h2>
            </div>
          </div>

          {/*Close upload page*/}
          <div className="flex items-center gap-6">
            {/* Close Button to exit upload & go to artists page */}
            <button 
              onClick={() => navigate('/artists')}
              className="text-text-secondary hover:text-text transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-input-bg cursor-pointer"
              aria-label="Exit upload"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>
            
          </div>
        </div>
      </header>

      {/* Main page rerouted*/}
      <main className="flex-1 bg-bg pt-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default UploadLayout;