import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { FormEvent, SyntheticEvent, useEffect } from "react";

// IN THIS FILE WE USE NORMAL SUBSCRIPTION, BUT UPDATE THE QUERY CACHE AS A REACTION ON SUBSCRIPTION

const query = gql`
  query allMessages {
    allMessages {
      id
      createdAt
      text
      author
    }
  }
`;

const sub = gql`
  subscription NewMessage {
    newMessage {
      id
      createdAt
      text
      author
    }
  }
`;

const subCount = gql`
  subscription count {
    messagesCount
  }
`;

const addMessage = gql`
  mutation addMessage($text: String!) {
    createMessage(payload: { text: $text }) {
      id
      createdAt
      text
      author
    }
  }
`;

function LatestMessage() {
  const { data, loading } = useSubscription(sub);
  return <h4>New comment: {!loading && data?.newMessage?.text}</h4>;
}

function Count() {
  const { data, loading } = useSubscription(subCount);
  return <h4>Count: {!loading && data?.messagesCount}</h4>;
}

export default function Web() {
  const { data, subscribeToMore } = useQuery(query, {
    notifyOnNetworkStatusChange: true,
  });

  const [addMessageMutation] = useMutation(addMessage);

  useEffect(() => {
    subscribeToMore({
      document: sub,
      updateQuery: (prev, { subscriptionData }) => {
        console.log(prev, subscriptionData);
        if (!subscriptionData.data) return prev;
        const newFeedItem = subscriptionData?.data?.newMessage;

        return Object.assign({}, prev, {
          allMessages: [...prev.allMessages, newFeedItem],
        });
      },
    });
  }, [subscribeToMore]);

  return (
    <div>
      <form
        onSubmit={(event: any) => {
          event.preventDefault();
          addMessageMutation({
            variables: Object.fromEntries(new FormData(event.target).entries()),
          });
          event.target.reset();
        }}
      >
        <input type="text" name="text" />
        <input type="submit" />
      </form>
      {data?.allMessages?.map((message: any) => (
        <div key={message?.id}>
          <p>{message?.text}</p>
        </div>
      ))}
      <LatestMessage />
      <Count />
    </div>
  );
}
