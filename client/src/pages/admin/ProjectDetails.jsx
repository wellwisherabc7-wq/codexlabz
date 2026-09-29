import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import {
  createProjectTask,
  getProject,
  getProjectTasks,
  updateProject,
} from '../../services/projectService';
import { deleteTask, updateTask } from '../../services/taskService';

const emptyTask = { title: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' };
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export default function AdminProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, t] = await Promise.all([getProject(id), getProjectTasks(id)]);
      setProject(p);
      setTasks(t);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onStatusChange = async (status) => {
    try {
      setProject(await updateProject(id, { status }));
    } catch (err) {
      setError(err.message);
    }
  };

  const onAddTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProjectTask(id, {
        ...taskForm,
        dueDate: taskForm.dueDate || undefined,
      });
      setTaskForm(emptyTask);
      setTasks(await getProjectTasks(id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onTaskStatus = async (taskId, status) => {
    try {
      const updated = await updateTask(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;
  if (error && !project) return <p className="text-red-600">{error}</p>;
  if (!project) return <EmptyState title="Project not found" />;

  const columns = [
    { key: 'title', header: 'Task' },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <Badge value={row.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => onTaskStatus(row._id, e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due',
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button type="button" className="text-sm text-red-600" onClick={() => onDeleteTask(row._id)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link to="/admin/projects" className="text-sm text-primary hover:underline">
        Back to projects
      </Link>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-slate-500">{project.clientId?.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge value={project.status} />
            <select
              value={project.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{project.description || 'No description'}</p>
        <p className="mt-2 text-xs text-slate-400">Deadline {formatDate(project.deadline)}</p>
      </Card>

      <Card title="Add task">
        <form onSubmit={onAddTask} className="grid gap-3 md:grid-cols-4">
          <input
            required
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
          />
          <select
            value={taskForm.priority}
            onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="md:col-span-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Adding...' : 'Add task'}
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Tasks">
        <Table
          columns={columns}
          rows={tasks}
          empty={<EmptyState title="No tasks yet" description="Add a task to start tracking work." />}
        />
      </Card>
    </div>
  );
}
