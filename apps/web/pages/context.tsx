// HERE WE ARE USING CONTEXT PROVIDER TO PROVIDE ALL THE NECESSARY DATA TO COMPONENTS

import { gql, useSubscription } from "@apollo/client";
import { createContext, ReactChildren, useContext } from "react";

const AllSubsContext = createContext({});
export const AllSubsProvider = ({ children }) => {
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

  const { data: latestMessage } = useSubscription(sub);
  const { data: latestCount } = useSubscription(subCount);

  return (
    <AllSubsContext.Provider value={{ latestMessage, latestCount }}>
      {children}
    </AllSubsContext.Provider>
  );
};

const LatestMessage = () => {
  const { latestMessage } = useContext(AllSubsContext);
  return <h4>New comment: {latestMessage?.newMessage?.text}</h4>;
};

const LatestCount = () => {
  const { latestCount } = useContext(AllSubsContext);
  return <h4>Count: {latestCount?.messagesCount}</h4>;
};

export default function Context() {
  return (
    <AllSubsProvider>
      <LatestMessage />
      <LatestCount />
    </AllSubsProvider>
  );
}
