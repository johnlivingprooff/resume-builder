import { useRef, useState } from 'react'

export default function PhotoUpload({ value, onChange }) {
  const inputRef = useRef()
  const [drag, setDrag] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('JPG/PNG only.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Max 5MB.')
      return
    }
    onChange(file)
  }

  const preview = value ? URL.createObjectURL(value) : null

  return (
    <div className="field">
      <label>Profile Photo <span className="hint">(optional)</span></label>
      <div
        className={`drop-zone ${drag ? 'drag-over' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
      >
        {preview
          ? <img src={preview} alt="preview" className="photo-preview" />
          : <span>Drag & drop or click to upload</span>
        }
      </div>
      <p className="hint">Square format recommended. Max 5MB. JPG/PNG only.</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {value && (
        <button type="button" className="btn-remove" onClick={() => onChange(null)}>
          Remove photo
        </button>
      )}
    </div>
  )
}
