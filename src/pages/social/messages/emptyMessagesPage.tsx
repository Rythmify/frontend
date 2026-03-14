import { Link } from "react-router-dom";
import { useState } from "react"
const MessagesPage = () => {
        const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="container w-full py-6">

      {/* Top Header */}
      <div className="flex items-center justify-between pt-5 mb-10 w-0.5 gap-30 ">
        <h1 className="text-2xl font-bold text-white text-text weight-500">
          Messages
        </h1>

        <button 
         
          className=" p-2 text-sm font-semibold text-black border bg-text-hover light:text-white rounded-[5px] w-14 "
          onClick={() => setIsOpen(true)}
        >
          New
        </button>
      </div>

      {/* Empty state */}
      <div className="container flex flex-col items-center justify-center flex-grow w-full text-center pt-43">
        <p className="text-lg font-semibold text-white text-text">
          You have no messages
        </p>

        <p className="mt-2 text-white text-text-muted">
          Send someone a message and make their day.
          <Link
            to="/messages/new"
            className="ml-1 text-accent hover:underline text-#699FFF"
          >
            Write one
          </Link>
        </p>
      </div>

    </div>
  );
};

export default MessagesPage;