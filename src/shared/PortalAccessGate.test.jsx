import React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import PortalAccessGate from './PortalAccessGate.jsx';
import { hostingMode, readPortalAudience } from '../data/portalAccess.js';

vi.mock('../data/portalAccess.js', () => ({
  hostingMode: vi.fn(), readPortalAudience: vi.fn(),
  mayUsePortal: value => ['owner', 'metcal'].includes(value),
}));
afterEach(cleanup);
beforeEach(() => { vi.resetAllMocks(); hostingMode.mockReturnValue('sharepoint'); });

test.each(['owner', 'metcal'])('mounts portal data only after verifying %s access', async audience => {
  let finish;
  const mounted = vi.fn();
  readPortalAudience.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  function Content() { mounted(); return <p>Portal content</p>; }
  render(<PortalAccessGate><Content /></PortalAccessGate>);
  expect(mounted).not.toHaveBeenCalled();
  await act(async () => { finish(audience); });
  expect(screen.getByText('Portal content')).toBeTruthy();
  expect(mounted).toHaveBeenCalledTimes(1);
});

test.each(['other', 'unknown'])('blocks %s users and never mounts data consumers', async audience => {
  const mounted = vi.fn(() => <p>Portal content</p>);
  readPortalAudience.mockResolvedValue(audience);
  render(<PortalAccessGate>{React.createElement(mounted)}</PortalAccessGate>);
  await screen.findByRole('button', { name: 'Check again' });
  expect(mounted).not.toHaveBeenCalled();
  expect(screen.queryByText('Portal content')).toBeNull();
});

test('retry can grant access after membership is corrected', async () => {
  readPortalAudience.mockResolvedValueOnce('other').mockResolvedValueOnce('metcal');
  render(<PortalAccessGate><p>Portal content</p></PortalAccessGate>);
  fireEvent.click(await screen.findByRole('button', { name: 'Check again' }));
  await screen.findByText('Portal content');
  expect(readPortalAudience).toHaveBeenCalledTimes(2);
});

test('local preview is available but an unknown host never loads portal data', async () => {
  hostingMode.mockReturnValue('preview');
  const { unmount } = render(<PortalAccessGate><p>Portal content</p></PortalAccessGate>);
  await screen.findByText('Portal content');
  unmount();
  hostingMode.mockReturnValue('unavailable');
  render(<PortalAccessGate><p>Portal content</p></PortalAccessGate>);
  await screen.findByRole('button', { name: 'Check again' });
  expect(screen.queryByText('Portal content')).toBeNull();
  expect(readPortalAudience).not.toHaveBeenCalled();
});

test('returning to the page preserves work until a denied result removes the portal', async () => {
  let finish;
  readPortalAudience.mockResolvedValueOnce('metcal').mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  function Content() {
    const [value, setValue] = React.useState('');
    return <input aria-label="Draft" value={value} onChange={event => setValue(event.target.value)} />;
  }
  render(<PortalAccessGate><Content /></PortalAccessGate>);
  fireEvent.change(await screen.findByLabelText('Draft'), { target: { value: 'Work in progress' } });
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByLabelText('Draft').value).toBe('Work in progress');
  await act(async () => { finish('other'); });
  expect(screen.queryByLabelText('Draft')).toBeNull();
  expect(screen.getByRole('button', { name: 'Check again' })).toBeTruthy();
});
