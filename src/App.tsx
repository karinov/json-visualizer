import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileJson,
  Heart,
  Image as ImageIcon,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';

type Store = {
  id: string;
  storeName: string;
  imageUrl: string;
  overview: string;
};

type Unit = {
  id: string;
  title: string;
  stores: Store[];
};

const NAV_LINKS = ['Units', 'Stores', 'Preview', 'Export'];
const ACTIVE_LINK = 0;

const UTILITY_LINKS = ['Guide', 'Shortcuts', 'Changelog', 'Sign In'];

const FOOTER_COLUMNS: { header: string; links: string[] }[] = [
  { header: 'Resources', links: ['Getting Started', 'Field Reference', 'JSON Schema', 'Changelog'] },
  { header: 'Help', links: ['FAQ', 'Troubleshooting', 'Keyboard Shortcuts', 'Report an Issue'] },
  { header: 'Company', links: ['About', 'Roadmap', 'Contributing', 'License'] },
  { header: 'Updates', links: ['Templates', 'Bulk Export', 'Clipboard Export', 'Release Notes'] },
];

const makeStore = (): Store => ({
  id: crypto.randomUUID(),
  storeName: '',
  imageUrl: '',
  overview: '',
});

const makeUnit = (): Unit => ({
  id: crypto.randomUUID(),
  title: '',
  stores: [makeStore()],
});

const isValidImageUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());

const highlightJson = (json: string) => {
  const nodes: React.ReactNode[] = [];
  const pattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)|([{}[\],:])/g;
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(json)) !== null) {
    if (match.index > cursor) {
      nodes.push(json.slice(cursor, match.index));
    }
    const [full, str, colon, literal, num, punct] = match;

    if (str !== undefined) {
      nodes.push(
        <span key={key++} className={colon ? 'text-canvas' : 'text-stone'}>
          {str}
        </span>
      );
      if (colon) {
        nodes.push(
          <span key={key++} className="text-ash">
            {colon}
          </span>
        );
      }
    } else if (literal !== undefined || num !== undefined) {
      nodes.push(
        <span key={key++} className="text-stone">
          {(literal ?? num)}
        </span>
      );
    } else if (punct !== undefined) {
      nodes.push(
        <span key={key++} className="text-ash">
          {punct}
        </span>
      );
    }

    cursor = match.index + full.length;
  }

  if (cursor < json.length) {
    nodes.push(json.slice(cursor));
  }

  return nodes;
};

export default function App() {
  const [units, setUnits] = useState<Unit[]>([makeUnit()]);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([units[0].id]));
  const [fileName, setFileName] = useState('data');
  const [copied, setCopied] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const addUnit = () => {
    const newUnit = makeUnit();
    setUnits([...units, newUnit]);
    setExpandedUnits(new Set(expandedUnits).add(newUnit.id));
  };

  const removeUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId));
    setExpandedUnits(new Set(Array.from(expandedUnits).filter(id => id !== unitId)));
  };

  const updateUnitTitle = (unitId: string, title: string) => {
    setUnits(units.map(u => (u.id === unitId ? { ...u, title } : u)));
  };

  const addStore = (unitId: string) => {
    setUnits(
      units.map(u => (u.id === unitId ? { ...u, stores: [...u.stores, makeStore()] } : u))
    );
  };

  const removeStore = (unitId: string, storeId: string) => {
    setUnits(
      units.map(u => (u.id === unitId ? { ...u, stores: u.stores.filter(s => s.id !== storeId) } : u))
    );
  };

  const updateStore = (unitId: string, storeId: string, field: keyof Store, value: string) => {
    setUnits(
      units.map(u =>
        u.id === unitId
          ? { ...u, stores: u.stores.map(s => (s.id === storeId ? { ...s, [field]: value } : s)) }
          : u
      )
    );
  };

  const toggleUnit = (unitId: string) => {
    const next = new Set(expandedUnits);
    if (next.has(unitId)) {
      next.delete(unitId);
    } else {
      next.add(unitId);
    }
    setExpandedUnits(next);
  };

  const json = useMemo(() => {
    const cleanData: Record<string, unknown> = {};
    units.forEach((u, index) => {
      cleanData[`local${index + 1}`] = {
        title: u.title,
        stores: u.stores.map(s => ({
          storeName: s.storeName,
          imageUrl: s.imageUrl,
          overview: s.overview,
        })),
      };
    });
    return JSON.stringify(cleanData, null, 2);
  }, [units]);

  const storeCount = units.reduce((total, u) => total + u.stores.length, 0);

  const incompleteFields = units.reduce(
    (total, u) =>
      total +
      (u.title.trim() ? 0 : 1) +
      u.stores.reduce(
        (sum, s) => sum + (s.storeName.trim() && s.imageUrl.trim() && s.overview.trim() ? 0 : 1),
        0
      ),
    0
  );

  const exportName = (() => {
    const finalName = fileName.trim() === '' ? 'data' : fileName.trim();
    return finalName.endsWith('.json') ? finalName : `${finalName}.json`;
  })();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const downloadJSON = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="bg-soft-cloud">
        <div className="mx-auto flex h-9 w-full max-w-[1440px] items-center justify-between px-lg sm:px-xl lg:px-[80px]">
          <span className="text-caption-sm text-mute">JSON Compiler · Local Build</span>
          <div className="flex items-center gap-md">
            {UTILITY_LINKS.map((link, i) => (
              <React.Fragment key={link}>
                {i > 0 && <span className="text-caption-sm text-stone">·</span>}
                <a href="#" className="text-caption-sm text-mute transition-colors hover:text-ink">
                  {link}
                </a>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-canvas">
        <div className="border-b border-hairline">
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-lg sm:px-xl lg:px-[80px]">
            <div className="flex items-center gap-sm">
              <button
                type="button"
                onClick={() => setNavOpen(!navOpen)}
                className="icon-circular -ml-sm lg:hidden"
                aria-label="Open menu"
                aria-expanded={navOpen}
              >
                {navOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <a href="#" className="flex items-center gap-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-canvas">
                  <Code2 size={18} />
                </span>
                <span className="text-body-strong tracking-[-0.5%]">JSON COMPILER</span>
              </a>
            </div>

            <nav className="hidden lg:flex items-center gap-xs">
              {NAV_LINKS.map((link, i) => (
                <a
                  key={link}
                  href="#"
                  className={i === ACTIVE_LINK ? 'nav-link nav-link-active' : 'nav-link'}
                >
                  {link}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-xs">
              <label className="hidden items-center gap-xs rounded-md bg-soft-cloud px-md md:flex">
                <Search size={16} className="text-mute" />
                <input
                  type="search"
                  placeholder="Search"
                  className="h-10 w-28 bg-transparent text-body-md text-ink outline-none placeholder:text-mute xl:w-40"
                />
              </label>
              <button type="button" className="icon-circular-muted" aria-label="Favourites">
                <Heart size={18} />
              </button>
              <button type="button" className="icon-circular" aria-label="Export queue">
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="divider-soft border-b border-hairline-soft bg-canvas">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-sm px-lg py-sm sm:px-xl lg:px-[80px]">
            <p className="text-caption-md text-mute">
              JSON Compiler <span className="px-xs text-stone">/</span> Builder
            </p>
            <div className="flex flex-wrap items-center gap-sm">
              <span className="hidden items-center gap-xs text-caption-sm text-mute sm:flex">
                {incompleteFields > 0 ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-stone" />
                    {incompleteFields} field{incompleteFields > 1 ? 's' : ''} incomplete
                  </>
                ) : (
                  <>
                    <Check size={14} className="text-success" />
                    <span className="text-success">Ready to export</span>
                  </>
                )}
              </span>
              <label className="flex h-10 items-center rounded-md border border-hairline bg-canvas px-md transition-colors focus-within:border-ink focus-within:bg-canvas focus-within:shadow-[0_0_0_12px_#f5f5f5]">
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="filename"
                  aria-label="File name"
                  className="w-28 bg-transparent text-body-md outline-none placeholder:text-mute sm:w-36"
                />
                <span className="text-body-md text-mute">.json</span>
              </label>
              <button
                type="button"
                onClick={copyToClipboard}
                className="btn-sm"
                aria-label="Copy JSON to clipboard"
              >
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                <span className={copied ? 'text-success' : undefined}>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={downloadJSON}
                disabled={units.length === 0}
                className="btn-primary h-10 px-lg text-button-sm disabled:opacity-40"
              >
                <FileJson size={16} />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </header>

      {navOpen && (
        <nav className="fixed inset-x-0 top-16 z-20 border-b border-hairline bg-canvas px-lg py-xl lg:hidden">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link}
              href="#"
              onClick={() => setNavOpen(false)}
              className="block border-b border-hairline-soft py-md text-body-strong text-ink last:border-b-0"
            >
              <span className="mr-md text-caption-sm text-stone">0{i + 1}</span>
              {link}
            </a>
          ))}
        </nav>
      )}

      <main>
        <section className="bg-ink text-canvas">
          <div className="mx-auto w-full max-w-[1440px] px-lg py-xxl sm:px-xl lg:px-[80px] lg:py-section">
            <p className="text-utility-xs uppercase tracking-[0.18em] text-stone">
              Store Locator Data Compiler
            </p>
            <h1 className="mt-md font-display text-campaign-sm uppercase tracking-[-0.5%] text-canvas md:text-campaign-md lg:text-campaign">
              Turn units and
              <br />
              stores into JSON.
            </h1>
            <div className="mt-xl flex max-w-2xl flex-col gap-lg sm:flex-row sm:items-center sm:gap-xl">
              <a href="#builder" className="btn-on-image shrink-0">
                Start Building
                <ArrowRight size={16} />
              </a>
              <p className="text-caption-md text-stone">
                A single-page compiler that groups store data into local units, previews the payload live,
                and exports it as a ready-to-ship <span className="text-canvas">{exportName}</span> file.
                Everything runs in your browser — no account, no server.
              </p>
            </div>
          </div>
        </section>

        <section
          id="builder"
          className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-section px-lg py-section sm:px-xl lg:grid-cols-[minmax(0,1fr)_460px] lg:px-[80px]"
        >
          <div className="space-y-xl">
            <div className="flex flex-wrap items-end justify-between gap-md">
              <div>
                <h2 className="text-heading-xl uppercase tracking-[-0.5%] text-ink">Data Units</h2>
                <p className="mt-xs text-caption-md text-mute">
                  {units.length} unit{units.length === 1 ? '' : 's'} · {storeCount} store
                  {storeCount === 1 ? '' : 's'}
                </p>
              </div>
              <button type="button" onClick={addUnit} className="filter-chip">
                <Plus size={16} />
                Add Unit
              </button>
            </div>

            <div className="space-y-xl">
              {units.map((unit, unitIndex) => {
                const expanded = expandedUnits.has(unit.id);
                return (
                  <article key={unit.id} className="border border-hairline bg-canvas">
                    <header
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => toggleUnit(unit.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleUnit(unit.id);
                        }
                      }}
                      className="flex cursor-pointer items-center justify-between gap-sm border-b border-hairline bg-soft-cloud px-md py-sm"
                    >
                      <div className="flex min-w-0 items-center gap-sm">
                        <span className="icon-circular" aria-hidden="true">
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </span>
                        <span className="truncate text-caption-sm uppercase tracking-[0.18em] text-mute">
                          local{unitIndex + 1}
                        </span>
                        <span className="truncate text-body-strong text-ink">
                          {unit.title || 'Untitled unit'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          removeUnit(unit.id);
                        }}
                        className="icon-circular text-mute transition-colors hover:text-sale"
                        aria-label={`Remove unit ${unitIndex + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </header>

                    {expanded && (
                      <div className="space-y-xl p-md lg:p-xl">
                        <div>
                          <label className="field-label" htmlFor={`title-${unit.id}`}>
                            Unit Title
                          </label>
                          <input
                            id={`title-${unit.id}`}
                            type="text"
                            value={unit.title}
                            onChange={e => updateUnitTitle(unit.id, e.target.value)}
                            placeholder="e.g., Best Coffee Shops in Jakarta"
                            className="field mt-xs"
                          />
                        </div>

                        <div className="space-y-md">
                          <div className="flex flex-wrap items-center justify-between gap-sm border-b border-hairline pb-sm">
                            <span className="text-caption-md uppercase tracking-[0.18em] text-ink">
                              Stores ({unit.stores.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => addStore(unit.id)}
                              className="filter-chip h-8 border-0 px-md text-button-sm"
                            >
                              <Plus size={14} />
                              Add Store
                            </button>
                          </div>

                          <div className="space-y-md">
                            {unit.stores.map((store, storeIndex) => {
                              const showImage =
                                isValidImageUrl(store.imageUrl) && !brokenImages.has(store.id);
                              return (
                                <section key={store.id} className="border border-hairline">
                                  <header className="flex items-center justify-between gap-sm border-b border-hairline bg-soft-cloud px-md py-xs">
                                    <div className="flex items-center gap-sm">
                                      <span className="swatch-dot" aria-hidden="true" />
                                      <span className="text-caption-sm uppercase tracking-[0.18em] text-ink">
                                        Store {String(storeIndex + 1).padStart(2, '0')}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeStore(unit.id, store.id)}
                                      className="icon-circular text-mute transition-colors hover:text-sale"
                                      aria-label={`Remove store ${storeIndex + 1}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </header>

                                  <div className="grid gap-md p-md sm:grid-cols-[168px_minmax(0,1fr)]">
                                    <figure className="m-0">
                                      <div className="relative aspect-square overflow-hidden border border-hairline bg-soft-cloud">
                                        {showImage ? (
                                          <img
                                            src={store.imageUrl.trim()}
                                            alt={store.storeName || 'Store cover'}
                                            loading="lazy"
                                            onError={() =>
                                              setBrokenImages(
                                                new Set(brokenImages).add(store.id)
                                              )
                                            }
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <span className="flex h-full w-full flex-col items-center justify-center gap-xs text-stone">
                                            <ImageIcon size={24} />
                                            <span className="text-caption-sm">No cover</span>
                                          </span>
                                        )}
                                        {showImage && (
                                          <figcaption className="absolute left-xs top-xs">
                                            <span className="badge-promo">Cover</span>
                                          </figcaption>
                                        )}
                                      </div>
                                      <p className="mt-xs text-caption-sm text-mute">1:1 cover stage</p>
                                    </figure>

                                    <div className="space-y-md">
                                      <div>
                                        <label className="field-label" htmlFor={`name-${store.id}`}>
                                          Store Name
                                        </label>
                                        <input
                                          id={`name-${store.id}`}
                                          type="text"
                                          value={store.storeName}
                                          onChange={e =>
                                            updateStore(unit.id, store.id, 'storeName', e.target.value)
                                          }
                                          placeholder="e.g., The Daily Grind"
                                          className="field mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="field-label" htmlFor={`image-${store.id}`}>
                                          Image URL
                                        </label>
                                        <input
                                          id={`image-${store.id}`}
                                          type="url"
                                          value={store.imageUrl}
                                          onChange={e =>
                                            updateStore(unit.id, store.id, 'imageUrl', e.target.value)
                                          }
                                          placeholder="https://example.com/image.jpg"
                                          className="field mt-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="field-label" htmlFor={`overview-${store.id}`}>
                                          Store Overview
                                        </label>
                                        <textarea
                                          id={`overview-${store.id}`}
                                          value={store.overview}
                                          onChange={e =>
                                            updateStore(unit.id, store.id, 'overview', e.target.value)
                                          }
                                          placeholder="Brief description of the store..."
                                          rows={3}
                                          className="field mt-xs h-auto resize-y py-sm"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </section>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}

              {units.length === 0 && (
                <div className="flex flex-col items-center justify-center border border-dashed border-hairline bg-canvas px-lg py-section text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-soft-cloud text-stone">
                    <Code2 size={24} />
                  </span>
                  <h3 className="mt-md text-heading-md text-ink">No units yet</h3>
                  <p className="mt-xs text-body-md text-mute">
                    Add your first unit to start building the JSON payload.
                  </p>
                  <button type="button" onClick={addUnit} className="btn-primary mt-xl">
                    <Plus size={16} />
                    Add Unit
                  </button>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-36">
            <div className="flex items-center justify-between pb-sm">
              <h2 className="text-heading-md uppercase tracking-[-0.5%] text-ink">Live Preview</h2>
              <span className="pill rounded-full border border-hairline px-lg py-[2px] text-caption-sm text-mute">
                {exportName}
              </span>
            </div>
            <div className="bg-ink">
              <div className="flex items-center justify-between border-b border-ash px-md py-sm">
                <div className="flex items-center gap-xs text-stone">
                  <Code2 size={16} />
                  <span className="text-caption-sm uppercase tracking-[0.18em]">payload.json</span>
                </div>
                <span className="text-caption-sm text-stone">
                  {units.length} units · {storeCount} stores
                </span>
              </div>
              <div className="max-h-[70vh] overflow-auto p-md lg:max-h-[calc(100vh-16rem)]">
                <pre className="font-mono text-caption-md text-stone">
                  <code>{highlightJson(json)}</code>
                </pre>
              </div>
              <div className="flex flex-wrap items-center gap-sm border-t border-ash px-md py-md">
                <button type="button" onClick={copyToClipboard} className="btn-on-image">
                  {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button type="button" onClick={downloadJSON} className="btn-secondary text-button-sm">
                  <FileJson size={16} />
                  Download File
                </button>
              </div>
            </div>
            <p className="mt-md text-caption-sm text-mute">
              Preview updates on every keystroke. Keys are white, values are muted, punctuation is
              dimmed — monochrome on purpose.
            </p>
          </aside>
        </section>
      </main>

      <footer className="border-t border-hairline bg-canvas">
        <div className="mx-auto w-full max-w-[1440px] px-lg py-section sm:px-xl lg:px-[80px]">
          <div className="grid grid-cols-2 gap-xl lg:grid-cols-4">
            {FOOTER_COLUMNS.map(column => (
              <nav key={column.header} className="space-y-md">
                <h3 className="text-body-strong text-ink">{column.header}</h3>
                <ul className="space-y-xs">
                  {column.links.map(link => (
                    <li key={link}>
                      <a href="#" className="footer-link">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-section border-t border-hairline pt-md">
            <div className="flex flex-wrap items-center justify-between gap-sm">
              <p className="text-utility-xs uppercase tracking-[0.18em] text-mute">
                © {new Date().getFullYear()} JSON Compiler · MIT License
              </p>
              <div className="flex items-center gap-md">
                <span className="text-utility-xs uppercase tracking-[0.18em] text-mute">
                  Indonesia / IDR
                </span>
                <span className="text-utility-xs uppercase tracking-[0.18em] text-mute">Terms</span>
                <span className="text-utility-xs uppercase tracking-[0.18em] text-mute">Privacy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}