import base64
import io
import json
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from jinja2 import Environment, FileSystemLoader
from PIL import Image
from weasyprint import HTML

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMPLATES_DIR = Path(__file__).parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))


def process_photo(file: UploadFile) -> str:
    """Resize to 200x200 square, return base64 JPEG."""
    img = Image.open(file.file).convert("RGB")
    # Center-crop to square
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((200, 200), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode()


@app.post("/generate-resume")
async def generate_resume(
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    location: str = Form(...),
    linkedin: str = Form(""),
    skills: str = Form(""),
    experience: str = Form("[]"),
    education: str = Form("[]"),
    photo: UploadFile = File(None),
):
    photo_b64 = None
    if photo and photo.filename:
        photo_b64 = process_photo(photo)

    context = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin": linkedin,
        "skills": [s.strip() for s in skills.split(",") if s.strip()],
        "experience": json.loads(experience),
        "education": json.loads(education),
        "photo_b64": photo_b64,
    }

    template = jinja_env.get_template("resume.html")
    html_content = template.render(**context)
    pdf_bytes = HTML(string=html_content).write_pdf()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resume.pdf"'},
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
