// @vitest-environment jsdom
import { describe, expect, it, beforeAll } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../../src/App.tsx';

// R-UI-2: component smoke checks against real engine output.
function renderApp() {
  cleanup();
  return render(<App />);
}

beforeAll(() => {
  // jsdom lacks SVG layout; charts use viewBox coordinates so no shim needed.
});

describe('App (default INF-B × WL-VM)', () => {
  it('renders the mandatory label and modeled-constraint banner', () => {
    renderApp();
    expect(screen.getAllByText(/Synthetic data\. Educational demonstration/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Modeled constraint').length).toBeGreaterThan(0);
    const banner = screen.getByLabelText('Decision summary');
    expect(within(banner).getByText(/iops\.backend/)).toBeInTheDocument();
  });

  it('switching workload to WL-RAG surfaces computable-only backend coverage', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Proposed workload'), { target: { value: 'WL-RAG' } });
    expect(screen.getByText(/computable minutes only/i)).toBeInTheDocument();
    expect(screen.getByText(/unknown minutes: 900/)).toBeInTheDocument();
  });

  it('what-if 2× updates the front-end card to 87.5%', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Demand multiplier'), { target: { value: '2' } });
    expect(screen.getByText('87.5%')).toBeInTheDocument();
  });

  it('weekly slider at bucket 60 exposes the hidden burst', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Inspect bucket'), { target: { value: '60' } });
    const readouts = screen.getAllByRole('status');
    expect(readouts[0].textContent).toContain('177,475');
    expect(readouts[0].textContent).toContain('206,100');
  });

  it('nightly note appears only when the nightly preset is selected', () => {
    renderApp();
    expect(screen.queryByText(/Backup completion\/window compliance not modeled/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Morning burst' }));
    expect(screen.queryByText(/Backup completion\/window compliance not modeled/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nightly batch' }));
    expect(screen.getByText(/Backup completion\/window compliance not modeled/)).toBeInTheDocument();
  });

  it('cards use binary units and non-budget vocabulary for latency/protection', () => {
    renderApp();
    expect(screen.getAllByText(/TiB$/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Post-addition latency: unknown/)).toBeInTheDocument();
    expect(screen.getAllByText(/Baseline P95/).length).toBeGreaterThan(0);
    expect(screen.getByText('Requirements met (declared)')).toBeInTheDocument();
    expect(screen.getByText(/Selected capabilities, not whole-system availability/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'IOPS' })).toBeInTheDocument();
    expect(screen.queryByText(/unknown of operating budget/)).not.toBeInTheDocument();
  });

  it('no text claims post-addition latency is predicted', () => {
    renderApp();
    const text = document.body.textContent ?? '';
    expect(text).not.toMatch(/post-addition latency (is|will be) (predicted|estimated|forecast|known|within)/i);
  });

  it('connection preview does not change the banner', () => {
    renderApp();
    const bannerBefore = screen.getByLabelText('Decision summary').textContent;
    fireEvent.change(screen.getByLabelText('Host connection preview'), { target: { value: 'tcp100' } });
    expect(screen.getByLabelText('Decision summary').textContent).toBe(bannerBefore);
  });

  it('day selector to Saturday disables morning burst with an explanation', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Detail day'), { target: { value: '5' } });
    expect(screen.getByText(/Engine default: Monday/)).toBeInTheDocument();
    expect(screen.getByText(/No morning burst window is scheduled on Saturday/)).toBeInTheDocument();
  });

  it('exactly one available preset stays selected and agrees with the displayed window', () => {
    renderApp();
    const pressed = () => screen.getAllByRole('button', { pressed: true });
    expect(pressed()).toHaveLength(1);
    expect(pressed()[0]).toHaveTextContent('Full day');

    fireEvent.click(screen.getByRole('button', { name: 'Morning burst' }));
    expect(pressed()).toHaveLength(1);
    expect(pressed()[0]).toHaveTextContent('Morning burst');
    // the displayed window agrees: the axis starts at 10:00 UTC (burst 10:05 − 5)
    expect(screen.getByText('10:00 UTC')).toBeInTheDocument();
    expect(screen.getByText('10:19 UTC')).toBeInTheDocument();

    // changing the detail day resets selection to Full day and the window agrees
    fireEvent.change(screen.getByLabelText('Detail day'), { target: { value: '5' } });
    expect(pressed()).toHaveLength(1);
    expect(pressed()[0]).toHaveTextContent('Full day');
    expect(screen.getByText('00:00 UTC')).toBeInTheDocument();
    // the disabled Saturday preset is not selectable
    expect(screen.getByRole('button', { name: 'Morning burst' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Morning burst' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('workload details describe the synthetic RAG deployment and phases', () => {
    renderApp();
    fireEvent.change(screen.getByLabelText('Proposed workload'), { target: { value: 'WL-RAG' } });
    const det = screen.getByText(/Workload details — WL-RAG/).closest('details')!;
    expect(det.textContent).toContain('self-hosted vector/search service');
    expect(det.textContent).toContain('scenario choice, not a requirement of RAG');
    expect(det.textContent).toContain('query-time retrieval');
    expect(det.textContent).toContain('ingestion/index maintenance');
    expect(det.textContent).toContain('GPU inference');
    // phase table: 3 h ingestion window with derived 64 KiB bandwidth
    expect(det.textContent).toContain('02:00–05:00');
    expect(det.textContent).toContain('3 h');
    expect(det.textContent).toContain('substantial synthetic assumption');
    expect(det.textContent).toContain('1.31 GB/s');
    expect(det.textContent).toContain('245.76 MB/s');
  });
});
