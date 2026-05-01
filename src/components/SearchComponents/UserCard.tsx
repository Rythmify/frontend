import FollowButton from '@/components/UI/FollowButton'
import UserAvatar from '@/components/UI/UserAvatar'
import { useNavigate } from 'react-router-dom'

interface UserCardProps {
  id: string
  username: string
  displayName: string
  avatarUrl?: string | null
  location?: string | null
  followersCount?: number
}

const UserCard = ({
  id,
  username,
  displayName,
  avatarUrl,
  location,
  followersCount,
}: UserCardProps) => {
  const navigate = useNavigate()

  return (
    <div data-test={`user-card-${id}`} className="flex items-center justify-between gap-3 sm:gap-6 py-3 sm:py-5">

      {/* Left: avatar + info */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <div
          data-test="user-card-avatar"
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => navigate(`/${username}`)}
        >
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            alt={displayName}
            wrapperClassName="w-full h-full rounded-full overflow-hidden bg-zinc-800"
            imageClassName="w-full h-full object-cover"
            initialsClassName="w-full h-full flex items-center justify-center rounded-full bg-zinc-700 text-white text-sm sm:text-lg font-bold"
          />
        </div>

        <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
          <span
            data-test="user-card-name"
            className="text-white text-sm sm:text-base font-bold truncate cursor-pointer hover:text-text-secondary transition-colors"
            onClick={() => navigate(`/${username}`)}
          >
            {displayName}
          </span>

          {location && (
            <span className="text-text-secondary text-xs sm:text-sm truncate">{location}</span>
          )}

          {followersCount !== undefined && (
            <div
              data-test="user-card-followers"
              className="flex items-center gap-1.5 text-text-secondary text-xs sm:text-sm cursor-pointer hover:text-white transition-colors group w-fit"
              onClick={() => navigate(`/${username}/follower`)}
            >
              <i className="fa-solid fa-user text-xs group-hover:text-white transition-colors" />
              <span>{followersCount.toLocaleString()} followers</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: follow button */}
      <div className="flex-shrink-0">
        <FollowButton username={username} userId={id} />
      </div>

    </div>
  )
}

export default UserCard