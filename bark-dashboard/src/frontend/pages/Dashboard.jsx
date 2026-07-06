import React from 'react';
import { useBarkEvents } from '../hooks/useBarkEvents';
import { BarkEventRow }  from '../components/BarkEventRow';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

export const Dashboard = () => {
  const { data, loading, error, refresh } = useBarkEvents({ limit: 100 });

  if (loading) return <p>Loading events…</p>;
  if (error)   return <p>Error: {error}</p>;

  const events = data?.events ?? [];

  // Group by hour for the chart
  const byHour = events.reduce((acc, e) => {
    const hour = new Date(e.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const chartData = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    barks: byHour[h] || 0,
  }));

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>🐕 Bark Monitor</h1>
      <p>{data.total} events recorded. <button onClick={refresh}>Refresh</button></p>

      <h2>Barks by Hour (today)</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" interval={3} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="barks" fill="#4a90e2" />
        </BarChart>
      </ResponsiveContainer>

      <h2>Recent Events</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Time</th><th>Device</th><th>Peak Volume</th><th>Duration</th><th>Audio</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => <BarkEventRow key={e._id} event={e} />)}
        </tbody>
      </table>
    </main>
  );
};
