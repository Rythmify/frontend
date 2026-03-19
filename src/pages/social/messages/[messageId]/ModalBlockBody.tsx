
// import { useState } from "react"
// import { Modal } from '../../../../components/MessagingComponents/Modal';

// interface BlockUserModalProps {
//   isOpen: boolean
//   onClose: () => void
//   onBlock: (removeContent: boolean, reportSpam: boolean) => void
//   username: string
// }

// export function BlockUserModal({ isOpen, onClose, onBlock, username }: BlockUserModalProps) {
//   const [removeContent, setRemoveContent] = useState(false)
//   const [reportSpam, setReportSpam] = useState(false)

//   const handleBlock = () => {
//     onBlock(removeContent, reportSpam)
//     setRemoveContent(false)
//     setReportSpam(false)
//   }

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <h2 className="mb-5 text-2xl font-bold">Block {username}</h2>

//       <p className="mb-3 font-semibold">
//         Blocking means that {username} will no longer be able to
//       </p>

//       <ul className="mb-6 ml-1 space-y-1 text-sm list-disc list-inside">
//         <li>follow you,</li>
//         <li>like your tracks,</li>
//         <li>repost your tracks,</li>
//         <li>send you messages,</li>
//         <li>share tracks with you,</li>
//         <li>post new comments on your tracks, or</li>
//         <li>send you new stream or email notifications.</li>
//       </ul>

//       <hr className="border-[#333] mb-5" />

//       <label className="flex items-start gap-3 mb-4 cursor-pointer">
//         <input
//           type="checkbox"
//           checked={removeContent}
//           onChange={e => setRemoveContent(e.target.checked)}
//           className="w-4 h-4 mt-1 cursor-pointer accent-white shrink-0"
//         />
//         <span className="text-sm font-semibold leading-snug">
//           Also permanently remove this user's comments, reposts and likes of your
//           tracks and playlists
//         </span>
//       </label>

//       <label className="flex items-center gap-3 cursor-pointer mb-7">
//         <input
//           type="checkbox"
//           checked={reportSpam}
//           onChange={e => setReportSpam(e.target.checked)}
//           className="w-4 h-4 cursor-pointer accent-white shrink-0"
//         />
//         <span className="text-sm font-semibold">
//           Also report {username} for spam
//         </span>
//       </label>

//       <div className="flex justify-end gap-3">
//         <button
//           onClick={onClose}
//           className="px-5 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-semibold transition-colors"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleBlock}
//           className="px-5 py-2 text-sm font-bold text-black transition-colors bg-white rounded hover:bg-gray-200"
//         >
//           Block {username}
//         </button>
//       </div>
//     </Modal>
//   )
// }