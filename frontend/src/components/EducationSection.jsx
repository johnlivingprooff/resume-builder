const empty = () => ({ institution: '', degree: '', year: '' })

function EducationEntry({ entry, onChange, onRemove, showRemove }) {
  const set = (field) => (e) => onChange({ ...entry, [field]: e.target.value })
  return (
    <div className="entry-card">
      <div className="grid-2">
        <div className="field">
          <label>Institution <span className="required">*</span></label>
          <input value={entry.institution} onChange={set('institution')} required placeholder="University of Malawi — The Polytechnic" />
        </div>
        <div className="field">
          <label>Degree <span className="required">*</span></label>
          <input value={entry.degree} onChange={set('degree')} required placeholder="B.Sc. Computer Science" />
        </div>
        <div className="field">
          <label>Year <span className="required">*</span></label>
          <input value={entry.year} onChange={set('year')} required placeholder="2021" />
        </div>
      </div>
      {showRemove && (
        <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
      )}
    </div>
  )
}

export default function EducationSection({ entries, onChange }) {
  const update = (i, val) => onChange(entries.map((e, idx) => idx === i ? val : e))
  const remove = (i) => onChange(entries.filter((_, idx) => idx !== i))
  const add = () => onChange([...entries, empty()])

  return (
    <section className="form-section">
      <h2>Education</h2>
      {entries.map((entry, i) => (
        <EducationEntry
          key={i}
          entry={entry}
          onChange={(val) => update(i, val)}
          onRemove={() => remove(i)}
          showRemove={entries.length > 1}
        />
      ))}
      <button type="button" className="btn-add" onClick={add}>+ Add Education</button>
    </section>
  )
}
