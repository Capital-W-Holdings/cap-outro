import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/analytics/stat-card';
import { ProgressBar } from '@/components/analytics/progress-bar';
import { FunnelChart } from '@/components/analytics/funnel-chart';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Total Users" value={100} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<StatCard label="Revenue" value="$5M" suffix="USD" />);
    
    expect(screen.getByText('$5M')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('renders positive trend', () => {
    render(<StatCard label="Growth" value={50} trend={{ value: 12, label: 'vs last week' }} />);
    
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(<StatCard label="Churn" value={5} trend={{ value: -8 }} />);
    
    expect(screen.getByText('-8%')).toBeInTheDocument();
  });
});

describe('ProgressBar', () => {
  it('renders with percentage', () => {
    render(<ProgressBar value={50} max={100} />);
    
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ProgressBar value={25} max={100} label="Progress" />);
    
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('caps percentage at 100%', () => {
    render(<ProgressBar value={150} max={100} />);
    
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('handles zero max', () => {
    render(<ProgressBar value={50} max={0} />);
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('hides percentage when showPercentage is false', () => {
    render(<ProgressBar value={50} max={100} showPercentage={false} />);
    
    expect(screen.queryByText('50.0%')).not.toBeInTheDocument();
  });
});

describe('FunnelChart', () => {
  const stages = [
    { label: 'Total', value: 100, color: 'bg-gray-500' },
    { label: 'Contacted', value: 80, color: 'bg-blue-500' },
    { label: 'Responded', value: 40, color: 'bg-green-500' },
  ];

  it('renders all stages', () => {
    render(<FunnelChart stages={stages} />);
    
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Responded')).toBeInTheDocument();
  });

  it('renders stage values', () => {
    render(<FunnelChart stages={stages} />);
    
    // Values appear multiple times (in header and optionally in bar)
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('80').length).toBeGreaterThan(0);
    expect(screen.getAllByText('40').length).toBeGreaterThan(0);
  });

  it('shows conversion rates when enabled', () => {
    render(<FunnelChart stages={stages} showConversion={true} />);
    
    // 80/100 = 80%, 40/80 = 50%
    expect(screen.getByText('(80%)')).toBeInTheDocument();
    expect(screen.getByText('(50%)')).toBeInTheDocument();
  });

  it('hides conversion when disabled', () => {
    render(<FunnelChart stages={stages} showConversion={false} />);
    
    expect(screen.queryByText('(80%)')).not.toBeInTheDocument();
  });
});
