import { Outlet } from "react-router-dom";

const ContainedLayout = () => (
  <div className="container py-6">
    <Outlet />
  </div>
);

export default ContainedLayout;