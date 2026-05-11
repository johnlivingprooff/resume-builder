import base64
import io
import json

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fpdf import FPDF
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── colours & sizes ──────────────────────────────────────────────────────────
NAVY = (26, 58, 92)
DARK = (34, 34, 34)
GREY = (85, 85, 85)
TAG_BG = (238, 242, 247)
TAG_BD = (176, 190, 197)

PAGE_W = 210          # A4 mm
MARGIN = 16
CONTENT_W = PAGE_W - 2 * MARGIN


class ResumePDF(FPDF):
    def header(self):
        pass  # no auto header

    def section_title(self, text: str):
        self.ln(4)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*NAVY)
        self.cell(CONTENT_W, 6, text.upper(), ln=True)
        # rule
        self.set_draw_color(*NAVY)
        self.set_line_width(0.4)
        self.line(MARGIN, self.get_y(), MARGIN + CONTENT_W, self.get_y())
        self.ln(3)
        self.set_text_color(*DARK)

    def entry_row(self, left_bold: str, left_sub: str, right: str):
        """Title + subtitle on left, date on right."""
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*DARK)
        # measure right text width
        self.set_font("Helvetica", "", 9)
        rw = self.get_string_width(right) + 2
        lw = CONTENT_W - rw

        self.set_font("Helvetica", "B", 10)
        self.set_xy(MARGIN, self.get_y())
        self.cell(lw, 5, left_bold, ln=False)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(*GREY)
        self.cell(rw, 5, right, align="R", ln=True)

        if left_sub:
            self.set_font("Helvetica", "I", 9)
            self.set_text_color(*GREY)
            self.set_x(MARGIN)
            self.cell(CONTENT_W, 4, left_sub, ln=True)

        self.set_text_color(*DARK)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*DARK)
        indent = MARGIN + 4
        bw = CONTENT_W - 4
        # bullet char
        self.set_xy(indent - 3, self.get_y())
        self.cell(3, 5, chr(149), ln=False)
        self.set_x(indent)
        self.multi_cell(bw, 5, text, ln=True)

    def skill_tags(self, skills: list[str]):
        self.set_font("Helvetica", "", 9)
        x, y = MARGIN, self.get_y()
        tag_h = 5
        pad_x, pad_y = 3, 1
        gap = 2

        for skill in skills:
            tw = self.get_string_width(skill) + pad_x * 2
            if x + tw > MARGIN + CONTENT_W:
                x = MARGIN
                y += tag_h + gap + pad_y * 2
            # background
            self.set_fill_color(*TAG_BG)
            self.set_draw_color(*TAG_BD)
            self.set_line_width(0.2)
            self.rect(x, y, tw, tag_h + pad_y * 2, style="FD")
            self.set_text_color(*DARK)
            self.set_xy(x + pad_x, y + pad_y)
            self.cell(tw - pad_x * 2, tag_h, skill, ln=False)
            x += tw + gap

        self.ln(tag_h + gap + pad_y * 2 + 2)


def process_photo(file: UploadFile) -> bytes:
    img = Image.open(file.file).convert("RGB")
    w, h = img.size
    side = min(w, h)
    img = img.crop(((w - side) // 2, (h - side) // 2,
                    (w + side) // 2, (h + side) // 2))
    img = img.resize((200, 200), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


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
    exp_list = json.loads(experience)
    edu_list = json.loads(education)
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]

    pdf = ResumePDF(format="A4")
    pdf.set_margins(MARGIN, 16, MARGIN)
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()

    # ── Header ───────────────────────────────────────────────────────────────
    photo_bytes = None
    if photo and photo.filename:
        photo_bytes = process_photo(photo)

    header_top = pdf.get_y()
    photo_size = 24  # mm

    if photo_bytes:
        tmp = io.BytesIO(photo_bytes)
        pdf.image(tmp, x=MARGIN, y=header_top, w=photo_size, h=photo_size)
        text_x = MARGIN + photo_size + 4
        text_w = CONTENT_W - photo_size - 4
    else:
        text_x = MARGIN
        text_w = CONTENT_W

    pdf.set_xy(text_x, header_top)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(*NAVY)
    pdf.cell(text_w, 9, full_name, ln=True)

    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(*GREY)
    contact_parts = [email, phone, location]
    if linkedin:
        contact_parts.append(linkedin)
    pdf.set_x(text_x)
    pdf.cell(text_w, 5, "  |  ".join(contact_parts), ln=True)

    # ensure we're below the photo
    if photo_bytes:
        pdf.set_y(max(pdf.get_y(), header_top + photo_size + 2))

    # ── Skills ───────────────────────────────────────────────────────────────
    if skill_list:
        pdf.section_title("Skills")
        pdf.skill_tags(skill_list)

    # ── Experience ───────────────────────────────────────────────────────────
    if exp_list:
        pdf.section_title("Experience")
        for job in exp_list:
            date_str = f"{job.get('start_date', '')} – {job.get('end_date', '') or 'Present'}"
            pdf.entry_row(job.get("title", ""), job.get("company", ""), date_str)
            achievements = job.get("achievements", "")
            if achievements:
                for line in achievements.split("\n"):
                    line = line.strip().lstrip("•-").strip()
                    if line:
                        pdf.bullet(line)
            pdf.ln(2)

    # ── Education ────────────────────────────────────────────────────────────
    if edu_list:
        pdf.section_title("Education")
        for edu in edu_list:
            pdf.entry_row(edu.get("degree", ""), edu.get("institution", ""), edu.get("year", ""))
            pdf.ln(2)

    pdf_bytes = bytes(pdf.output())

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="resume.pdf"'},
    )
