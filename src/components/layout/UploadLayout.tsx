import { Outlet, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";

const UploadLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex py-2.5 flex-col bg-bg transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-bg ">
        <div className="w-full px-8 flex items-center justify-between h-11.5">
          {/* Left side: Logo and page title */}
          <div className="flex items-center gap-6">
            <Link
              to="/discover"
              className="flex items-center text-4xl gap-2 hover:opacity-80 transition-opacity"
            >
              <i className="fa-brands fa-soundcloud text-text-hover" />
            </Link>

            {/*Page Title */}
            <div className="flex items-center gap-6 h-full">
              <h6 className="text-text-upload font-bold text-md tracking-wide">
                Upload
              </h6>
            </div>
          </div>

          {/*Close upload page*/}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/artists")}
              className="flex items-center justify-center h-6 w-6 p-5 rounded-full 
              bg-input-bg hover:bg-[dcdcdc] text-text-upload dark:hover:bg-[#353535]
              transition-all duration-300 cursor-pointer"
              aria-label="Exit upload"
            >
              <i className="fa-solid fa-xmark text-md" />
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
