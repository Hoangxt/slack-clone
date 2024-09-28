import { useQueryState } from 'nuqs';

// const [parentMessageId, setParentMessageId] = useState(123);
// => http://localhost:3000/messages?parentMessageId=123
export const useParentMessageId = () => {
  return useQueryState('parentMessageId');
};
