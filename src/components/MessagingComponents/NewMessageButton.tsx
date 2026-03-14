import { Link } from "react-router-dom";
const NewMessageButton = () => (
  <Link
    to="/messages/new"
    className="
      inline-flex items-center justify-center
      h-8 px-2
      bg-black text-white
      text-m font-bold
      rounded-[4px]
      hover:text-#717171 transition-colors duration-150
      select-none
    "
    aria-label="Send a message"
    title="Send a message"
    rel="noopener"
  >
    <span>New</span>
  </Link>
);
export default NewMessageButton;