import { Outlet } from "react-router-dom";

const ArtistStudioLayout = () => (
  <div className="min-h-screen flex">
    <aside>
      {/*Shahd--implement left sidebar here */}
    </aside>

    <div className="flex-1 flex flex-col">
      <header>
        {/* shahd --implement top bar here  */}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  </div>
);

export default ArtistStudioLayout;