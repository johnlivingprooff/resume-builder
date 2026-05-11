const empty = () => ({ title: '', company: '', start_date: '', end_date: '', achievements: '' })

function ExperienceEntry({ entry, onChange, onRemove, showRemove }) {
  const set = (field) => (e) => onChange({ ...entry, [field]: e.target.value })
  return (
    <div className="entry-card">
      <div className="grid-2">
        <div className="field">
          <label>Job Title <span className="required">*</span></label>
          <input value={entry.title} onChange={set('title')} required placeholder="Software Developer" />
        </div>
        <div className="field">
          <label>Company <span className="required">*</span></label>
          <input value={entry.company} onChange={set('company')} required placeholder="National Bank of Malawi" />
        </div>
        <div className="field">
          <label>Start Date <span className="required">*</span></label>
          <input value={entry.start_date} onChange={set('start_date')} required placeholder="Jan 2022" />
        </div>
        <div className="field">
          <label>End Date</label>
          <input value={entry.end_date} onChange={set('end_date')} placeholder="Dec 2023 or leave blank for Present" />
        </div>
      </div>
      <div className="field">
        <label>Achievements</label>
        <textarea
          value={entry.achievements}
          onChange={set('achievements')}
          rows={4}
          placeholder="• Developed taxpayer portal used by 5,000+ citizens&#10;• Integrated Airtel Money and TNM Mpamba payment APIs"
        />
      </div>
      {showRemove && (
        <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
      )}
    </div>
  )
}

export default function ExperienceSection({ entries, onChange }) {
  const update = (i, val) => onChange(entries.map((e, idx) => idx === i ? val : e))
  const remove = (i) => onChange(entries.filter((_, idx) => idx !== i))
  const add = () => onChange([...entries, empty()])

  return (
    <section className="form-section">
      <h2>Experience</h2>
      {entries.map((entry, i) => (
        <ExperienceEntry
          key={i}
          entry={entry}
          onChange={(val) => update(i, val)}
          onRemove={() => remove(i)}
          showRemove={entries.length > 1}
        />
      ))}
      <button type="button" className="btn-add" onClick={add}>+ Add Experience</button>
    </section>
  )
}
