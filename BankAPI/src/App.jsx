import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [amount, setAmount] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Fetch all users on component mount
    axios.get('http://localhost:3000/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleFilterActiveUsers = () => {
    // Fetch active users with a specified amount of cash
    axios.get(`http://localhost:3000/users/filter/active/${amount}`)
      .then(response => setActiveUsers(response.data))
      .catch(error => console.error('Error fetching active users:', error));
  };

  return (
    <div>
      <h1>Bank App</h1>
      <div>
        <h2>All Users</h2>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              User {user.id}: Cash - ${user.cash}, Credit - ${user.credit}, Active - {user.isActive ? 'Yes' : 'No'}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Filter Active Users by Cash</h2>
        <label>Minimum Cash Amount: </label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button onClick={handleFilterActiveUsers}>Filter</button>
        <ul>
          {activeUsers.map(user => (
            <li key={user.id}>
              User {user.id}: Cash - ${user.cash}, Credit - ${user.credit}, Active - {user.isActive ? 'Yes' : 'No'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;

