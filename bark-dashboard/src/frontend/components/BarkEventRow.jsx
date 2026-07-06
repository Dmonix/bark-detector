import React from 'react';

export const BarkEventRow = ({ event }) => {
  const time = new Date(event.timestamp).toLocaleString();
  return (
    <tr>
      <td>{time}</td>
      <td>{event.device}</td>
      <td>{event.peakVolume}</td>
      <td>{event.duration}s</td>
      <td>{event.audioPath ? '🔊' : '—'}</td>
    </tr>
  );
};
