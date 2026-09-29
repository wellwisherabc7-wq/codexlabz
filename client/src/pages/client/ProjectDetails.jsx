import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { getProject, getProjectTasks } from '../../services/projectService';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '—');

export default function ClientProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t] = await Promise.all([getProject(id), getProjectTasks(id)]);
        setProject(p);
        setTasks(t);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!project) return <EmptyState title="Project not found" />;

  const columns = [
    { key: 'title', header: 'Task' },
    { key: 'priority', header: 'Priority', render: (row) => <Badge value={row.priority} /> },
    { key: 'status', header: 'Status', render: (row) => <Badge value={row.status} /> },
    { key: 'dueDate', header: 'Due', render: (row) => formatDate(row.dueDate) },
  ];

  return (
    <div className="space-y-6">
      <Link to="/client/dashboard" className="text-sm text-primary hover:underline">
        Back to dashboard
      </Link>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <p className="text-sm text-slate-500">{project.clientId?.companyName}</p>
          </div>
          <Badge value={project.status} />
        </div>
        <p className="mt-4 text-sm text-slate-600">{project.description || 'No description'}</p>
        <p className="mt-2 text-xs text-slate-400">Deadline {formatDate(project.deadline)}</p>
      </Card>
      <Card title="Tasks">
        <Table
          columns={columns}
          rows={tasks}
          empty={<EmptyState title="No tasks yet" />}
        />
      </Card>
    </div>
  );
}
