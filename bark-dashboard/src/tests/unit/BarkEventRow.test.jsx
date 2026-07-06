import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BarkEventRow } from '../../frontend/components/BarkEventRow';

const mockEvent = {
  _id: '1',
  timestamp: '2026-06-26T18:14:22Z',
  device: 'living-room',
  peakVolume: 82,
  duration: 5,
  audioPath: null,
};

describe('BarkEventRow', () => {
  it('renders device name', () => {
    render(<table><tbody><BarkEventRow event={mockEvent} /></tbody></table>);
    expect(screen.getByText('living-room')).toBeInTheDocument();
  });

  it('renders peak volume', () => {
    render(<table><tbody><BarkEventRow event={mockEvent} /></tbody></table>);
    expect(screen.getByText('82')).toBeInTheDocument();
  });

  it('shows — when there is no audio', () => {
    render(<table><tbody><BarkEventRow event={mockEvent} /></tbody></table>);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows speaker icon when audio is present', () => {
    const withAudio = { ...mockEvent, audioPath: '/audio/2026/06/26/bark.wav' };
    render(<table><tbody><BarkEventRow event={withAudio} /></tbody></table>);
    expect(screen.getByText('🔊')).toBeInTheDocument();
  });
});
