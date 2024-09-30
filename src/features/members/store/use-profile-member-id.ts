import { useQueryState } from 'nuqs';

// const [parentMessageId, setParentMessageId] = useState(123);
// => http://localhost:3000/messages?parentMessageId=123
export const useProfileMemberId = () => {
  return useQueryState('profileMemberId');
};
