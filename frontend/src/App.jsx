import { useState, useEffect } from 'react';

// Connect to containerized backend mapped to port 5000
const API_URL = 'http://localhost:5000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      showStatus('Backend communication failed. Ensure container/server is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description, priority })
      });
      const data = await res.json();
      if (data.success) {
        showStatus('Task created and persisted in MongoDB container!', 'success');
        setTitle('');
        setDescription('');
        fetchTasks();
      }
    } catch (err) {
      showStatus('Error creating task: ' + err.message, 'error');
    }
  };

  // Toggle completed
  const handleToggle = async (task) => {
    try {
      const res = await fetch(`${API_URL}/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      const data = await res.json();
      if (data.success) {
        fetchTasks();
      }
    } catch (err) {
      showStatus('Error updating task', 'error');
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showStatus('Task deleted!', 'success');
        fetchTasks();
      }
    } catch (err) {
      showStatus('Error deleting task', 'error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Practical 11: Containerized Full-Stack Task App</h1>
        <p>Orchestrated with Docker & Docker Compose (Frontend, Backend, MongoDB)</p>
      </header>

      {/* Docker Compose Bridge Network Banner */}
      <div className="architecture-bar">
        <span>Docker Bridge Network: <code>app-network</code></span>
        <div>
          <span className="service-pill">frontend:5173</span> ──►{' '}
          <span className="service-pill">backend:5000</span> ──►{' '}
          <span className="service-pill">mongodb:27017</span>
        </div>
      </div>

      <main>
        {statusMsg.text && (
          <div className={`toast ${statusMsg.type}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Task Creation Form */}
        <div className="card">
          <h2>➕ Add New Task</h2>
          <p className="card-desc">Submitted via HTTP POST to Express Backend container</p>

          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label htmlFor="task-title">Title *</label>
              <input
                type="text"
                id="task-title"
                placeholder="e.g. Verify Docker multi-container stack"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-desc">Description</label>
              <input
                type="text"
                id="task-desc"
                placeholder="Details (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button type="submit">Create Task</button>
          </form>
        </div>

        {/* Task List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2>Tasks ({tasks.length})</h2>
            <button onClick={fetchTasks} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              Refresh
            </button>
          </div>

          {loading && <p style={{ color: '#718096', padding: '12px 0' }}>Loading tasks from backend...</p>}

          {!loading && tasks.length === 0 && (
            <p style={{ color: '#a0aec0', padding: '12px 0' }}>No tasks found in MongoDB database.</p>
          )}

          {tasks.map((task) => (
            <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                />
                <div>
                  <strong className="task-title">{task.title}</strong>
                  {task.description && (
                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>{task.description}</div>
                  )}
                </div>
              </div>
              <button
                className="btn-danger"
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                onClick={() => handleDelete(task._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer>
        <p>AWDF Practical 11 &bull; Charotar University of Science and Technology</p>
      </footer>
    </div>
  );
}

export default App;
