import { useState } from 'react'
import PersonalInfo from './components/PersonalInfo'
import PhotoUpload from './components/PhotoUpload'
import SkillsInput from './components/SkillsInput'
import ExperienceSection from './components/ExperienceSection'
import EducationSection from './components/EducationSection'
import { generateResume } from './utils/api'

const defaultPersonal = { full_name: '', email: '', phone: '', location: '', linkedin: '' }
const emptyExp = () => ({ title: '', company: '', start_date: '', end_date: '', achievements: '' })
const emptyEdu = () => ({ institution: '', degree: '', year: '' })

export default function App() {
  const [personal, setPersonal] = useState(defaultPersonal)
  const [skills, setSkills] = useState('')
  const [experience, setExperience] = useState([emptyExp()])
  const [education, setEducation] = useState([emptyEdu()])
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(personal).forEach(([k, v]) => fd.append(k, v))
      fd.append('skills', skills)
      fd.append('experience', JSON.stringify(experience))
      fd.append('education', JSON.stringify(education))
      if (photo) fd.append('photo', photo)

      const blob = await generateResume(fd)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${personal.full_name.replace(/\s+/g, '_') || 'resume'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate resume.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ATS Resume Generator</h1>
        <p>Fill in your details and download an ATS-optimized PDF resume.</p>
      </header>

      <form className="resume-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2>Profile Photo</h2>
          <PhotoUpload value={photo} onChange={setPhoto} />
        </section>

        <PersonalInfo data={personal} onChange={setPersonal} />
        <SkillsInput value={skills} onChange={setSkills} />
        <ExperienceSection entries={experience} onChange={setExperience} />
        <EducationSection entries={education} onChange={setEducation} />

        {error && <div className="error-alert">{error}</div>}

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Generating PDF…' : 'Generate ATS Resume PDF'}
        </button>
      </form>
    </div>
  )
}
