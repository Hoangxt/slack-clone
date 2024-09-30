import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ChevronRight } from 'lucide-react';

interface ThreadBarProps {
  count?: number;
  image?: string;
  timestamp?: number;
  name?: string;
  onClick: () => void;
}

export const ThreadBar = ({
  count,
  image,
  timestamp,
  name = 'Member',
  onClick,
}: ThreadBarProps) => {
  const avatarFallback = name.charAt(0).toUpperCase();

  if (!count || !timestamp) return null;

  return (
    <button
      onClick={onClick}
      className='flex items-center justify-start p-1 max-w[600px] rounded-md border border-transparent hover:bg-white hover:hover-border group/thread-bar transition'
    >
      <div className='flex items-center gap-2 overflow-hidden'>
        <Avatar className='size-6 shrink-0'>
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className='text-sx text-sky-700 hover:underline font-bold truncate'>
          {count} {count > 1 ? 'replies' : 'reply'}
        </span>
        {/* bình thường sẽ hiện Last reply ... khi user hover vào thì hiện View thread và click sẽ sang tab thread*/}
        <span className='text-sx text-muted-foreground truncate group-hover/thread-bar:hidden block'>
          Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
        </span>
        <span className='text-sx text-muted-foreground truncate group-hover/thread-bar:block hidden'>
          View thread
        </span>
      </div>
      <ChevronRight className='size-4 ml-auto text-muted-foreground opacity-0 group-hover/thread-bar:opacity-100 transition shrink-0' />
    </button>
  );
};
