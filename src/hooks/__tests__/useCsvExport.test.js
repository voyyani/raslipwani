import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCsvExport } from '../useCsvExport';
import { exportToCSV } from '@/utils/exportUtils';

vi.mock('@/utils/exportUtils', () => ({ exportToCSV: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('useCsvExport', () => {
  it('formats the rows before handing them to exportToCSV', async () => {
    const format = vi.fn((rows) => rows.map((row) => ({ Title: row.title })));
    const { result } = renderHook(() => useCsvExport({ filename: 'properties', format }));

    await act(async () => result.current.exportRows([{ title: 'Gigiri' }]));

    expect(format).toHaveBeenCalledWith([{ title: 'Gigiri' }]);
    expect(exportToCSV).toHaveBeenCalledWith([{ Title: 'Gigiri' }], 'properties');
  });

  it('exports nothing and reports an error for an empty list', async () => {
    // Downloading a header-only CSV looks like a broken export, and three
    // screens shipped one.
    const { result } = renderHook(() => useCsvExport({ filename: 'x', format: (r) => r }));
    await act(async () => result.current.exportRows([]));
    expect(exportToCSV).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/nothing to export/i);
  });

  it('clears isExporting even when the export throws', async () => {
    exportToCSV.mockImplementation(() => { throw new Error('quota'); });
    const { result } = renderHook(() => useCsvExport({ filename: 'x', format: (r) => r }));
    await act(async () => result.current.exportRows([{ a: 1 }]));
    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBe('quota');
  });
});
