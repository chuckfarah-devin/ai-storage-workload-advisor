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

  it('nightly preset carries the not-modeled note', () => {
    renderApp();
    expect(screen.getAllByText(/not modeled/i).length).toBeGreaterThan(0);
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
});
