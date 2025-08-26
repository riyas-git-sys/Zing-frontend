import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url, options) => {
  const socketRef = useRef();

  if (!socketRef.current) {
    socketRef.current = io(url, options);
  }

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};

export default useSocket;