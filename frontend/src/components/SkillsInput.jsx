export default function SkillsInput({ value, onChange }) {
  const tags = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <section className="form-section">
      <h2>Skills</h2>
      <div className="field">
        <label>Skills <span className="hint">(comma-separated)</span></label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Python, Django, React, PostgreSQL, Mobile Money APIs..."
        />
      </div>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
        </div>
      )}
    </section>
  )
}
