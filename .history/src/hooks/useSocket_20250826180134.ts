// client/src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, ManagerOptions, SocketOptions } from 'socket.io-client';

const useSocket = (
  url: string, 
  options?: Partial<ManagerOptions & SocketOptions>
) => {
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