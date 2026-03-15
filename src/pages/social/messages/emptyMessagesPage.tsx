import { Link } from "react-router-dom";
import { useState } from "react"
import { Modal } from "../../../components/MessagingComponents/Modal";
import ModalNewMessageBody from "./ModalNewMessageBody";  
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader';
  
const MessagesPage = () => {
        const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full py-6 ">

      {/* Top Header */}
      <div className="flex items-center justify-between pt-5 mb-10 w-0.5 gap-49 ">
         <MessagingHeader/>
        
      </div>

      {/* Empty state */}
      <div className="container flex flex-col items-center justify-center flex-grow w-full text-center pt-43">
        <p className="font-semibold text-white text-text text-s">
          You have no messages
        </p>

        <p className="mt-2 text-sm text-white text-text-muted">
          Send someone a message and make their day.
          <button
            onClick={() => setIsOpen(true)}
            className="ml-1 text-[#699FFF] hover:underline text-#699FFF"
          >
            Write one
          </button>

                                                  {/*disclaimer*/ }
                                                  {/* missing Modal here */}
                                                  {/* missing Modal here */}
        </p>
      </div>

    </div>
  );
};

export default MessagesPage;