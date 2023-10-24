import { useEffect, useState } from "react";
import "./App.css";

/**
 * Get a random user ID. This is fine for this example, but for production use libraries like paralleldrive/cuid2 or uuid to generate unique IDs.
 */
const userId = localStorage.getItem("userId") || Math.random();
localStorage.setItem("userId", userId);
/**
 * Establish a new Web Socket connection.
 */
const ws = new WebSocket(`ws://localhost:3000/online-status`);

/**
 * When a web socket connection is open, inform the server that a new user is online.
 */
ws.onopen = function () {
  ws.send(
    JSON.stringify({
      onlineStatus: true,
      userId,
    })
  );
};

function App() {
  /**
   * Store the count of all users online.
   */
  const [usersOnlineCount, setUsersOnlineCount] = useState(0);
  /**
   * Store the selected online status value.
   */
  const [onlineStatus, setOnlineStatus] = useState();

  useEffect(() => {
    /**
     * Listen to messages and change the users online count.
     */
    ws.onmessage = message => {
      const data = JSON.parse(message.data);
      setUsersOnlineCount(data.onlineUsersCount);
    };
  }, []);

  const onOnlineStatusChange = e => {
    setOnlineStatus(e.target.value);
    if (!e.target.value) {
      return;
    }
    const isOnline = e.target.value === "online";
    ws.send(
      JSON.stringify({
        onlineStatus: isOnline,
        userId,
      })
    );
  };

  return (
    <div>
      <div>Users Online Count - {usersOnlineCount}</div>

      <div>My Status</div>

      <select value={onlineStatus} onChange={onOnlineStatusChange}>
        <option value="">Select Online Status</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
    </div>
  );
}

export default App;
