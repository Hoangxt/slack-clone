'use client';

import { useChannelId } from '@/hooks/use-channel-id';

const ChannelIdPage = () => {
  const channelId = useChannelId();

  const { data: channel, isLoading: channelLoading } = useGetChannel({
    id: channelId,
  });

  return <div>{channel.name}</div>;
};

export default ChannelIdPage;
