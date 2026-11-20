/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useState } from 'react';
import { Download, Package, Search, X, Box, FileArchive, Loader2 } from 'lucide-react';
import { PLANT_COMPONENTS } from '../data/plantComponents';
import { ComponentItem } from '../types/plant';
import { downloadAllComponentsZip, downloadComponentFile } from '../3d/componentExport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ComponentExtractionStudio: React.FC<Props> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [zipBusy, setZipBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return PLANT_COMPONENTS;
    return PLANT_COMPONENTS.filter((item) =>
      [item.name, item.code, item.category, String(item.id)].some((value) => value.toLowerCase().includes(term))
    );
  }, [query]);

  if (!isOpen) return null;

  const handleSingle = async (item: ComponentItem, format: 'glb' | 'stl') => {
    setBusyId(item.id);
    setError('');
    try {
      await downloadComponentFile(item, format);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not export this component.');
    } finally {
      setBusyId(null);
    }
  };

  const handleZip = async () => {
    setZipBusy(true);
    setProgress(0);
    setError('');
    try {
      await downloadAllComponentsZip((done) => setProgress(done));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the ZIP archive.');
    } finally {
      setZipBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-sm">
      <section className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900 text-slate-100 shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-cyan-300">
              <Box className="h-5 w-5" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em]">Engineering Export Suite</span>
            </div>
            <h2 className="text-xl font-bold">50-Component Extraction Studio</h2>
            <p className="mt-1 text-sm text-slate-400">Export the original registered 3D geometry as GLB and STL.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close extraction studio">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-3 border-b border-slate-800 p-4 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by component, code or ID..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600" />
          </label>
          <button onClick={handleZip} disabled={zipBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-wait disabled:opacity-60">
            {zipBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileArchive className="h-4 w-4" />}
            {zipBusy ? `Building ZIP ${progress}/50` : 'Download all 50 (ZIP)'}
          </button>
        </div>

        {zipBusy && <div className="h-1 w-full bg-slate-800"><div className="h-1 bg-cyan-400 transition-all" style={{ width: `${progress / 50 * 100}%` }} /></div>}
        <div className="flex items-center justify-between px-5 py-2 text-xs text-slate-500">
          <span>{filtered.length} of 50 components</span>
          <span>Each row provides separate GLB and STL downloads</span>
        </div>

        {error && <div role="alert" className="mx-5 mb-2 rounded-lg border border-rose-500/30 bg-rose-950/40 p-3 text-sm text-rose-300">{error}</div>}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid gap-2">
            {filtered.map((item) => (
              <article key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-950/50 font-mono text-sm font-bold text-cyan-300">{String(item.id).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-100">{item.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{item.code} · {item.category.replaceAll('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => handleSingle(item, 'glb')} disabled={busyId !== null || zipBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-950/50 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/70 disabled:opacity-40">
                    {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} GLB
                  </button>
                  <button onClick={() => handleSingle(item, 'stl')} disabled={busyId !== null || zipBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 disabled:opacity-40">
                    {busyId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} STL
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <footer className="flex flex-col gap-1 border-t border-slate-800 bg-slate-950/70 px-5 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span><Package className="mr-1 inline h-3.5 w-3.5" /> Geometry is cloned from the original scene, not rebuilt or simplified.</span>
          <span>Centered at origin · source dimensions retained · scene units</span>
        </footer>
      </section>
    </div>
  );
};
