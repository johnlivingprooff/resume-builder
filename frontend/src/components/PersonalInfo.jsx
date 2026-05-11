export default function PersonalInfo({ data, onChange }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value })

  return (
    <section className="form-section">
      <h2>Personal Information</h2>
      <div className="grid-2">
        <div className="field">
          <label>Full Name <span className="required">*</span></label>
          <input value={data.full_name} onChange={set('full_name')} required placeholder="Chisomo Banda" />
        </div>
        <div className="field">
          <label>Email <span className="required">*</span></label>
          <input type="email" value={data.email} onChange={set('email')} required placeholder="chisomo.banda@gmail.com" />
        </div>
        <div className="field">
          <label>Phone <span className="required">*</span></label>
          <input value={data.phone} onChange={set('phone')} required placeholder="+265 991 234 567" />
        </div>
        <div className="field">
          <label>Location <span className="required">*</span></label>
          <input value={data.location} onChange={set('location')} required placeholder="Lilongwe, Malawi" />
        </div>
        <div className="field">
          <label>LinkedIn URL</label>
          <input value={data.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/chisomobanda" />
        </div>
      </div>
    </section>
  )
}
