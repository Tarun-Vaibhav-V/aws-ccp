import { useMemo, useState } from 'react'
import { glossaryCategories, glossaryCount } from '../data/glossary-services.js'

export default function Glossary() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return glossaryCategories
      .filter((c) => cat === 'All' || c.name === cat)
      .map((c) => ({
        ...c,
        items: c.items.filter(
          ([term, def]) =>
            !needle || term.toLowerCase().includes(needle) || def.toLowerCase().includes(needle)
        ),
      }))
      .filter((c) => c.items.length > 0)
  }, [q, cat])

  const shown = filtered.reduce((n, c) => n + c.items.length, 0)

  return (
    <div>
      <div className="page-head">
        <span className="kicker">Reference</span>
        <h1>AWS Services Glossary</h1>
        <div className="sub">{glossaryCount} core services and concepts for the CLF-C02 exam — what each one does, in one line.</div>
      </div>

      <div className="glossary-controls">
        <input
          className="search-box"
          placeholder="Search services… (e.g. S3, firewall, serverless)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="cat-chips">
          {['All', ...glossaryCategories.map((c) => c.name)].map((name) => (
            <button
              key={name}
              className={`chip ${cat === name ? 'active' : ''}`}
              onClick={() => setCat(name)}
            >
              {name === 'All' ? 'All' : name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="qmeta" style={{ margin: '4px 0 18px' }}>{shown} result{shown === 1 ? '' : 's'}</div>

      {filtered.length === 0 && <div className="empty">No services match “{q}”.</div>}

      {filtered.map((c) => (
        <section key={c.name} style={{ marginBottom: 26 }}>
          <h2 className="gloss-cat"><span className="gloss-ico">{c.icon}</span>{c.name}</h2>
          <div className="grid cols-2">
            {c.items.map(([term, def]) => (
              <div key={term} className="gloss-card">
                <div className="gloss-term">{term}</div>
                <div className="gloss-def">{def}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
