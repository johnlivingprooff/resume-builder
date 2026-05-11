# ATS Resume Generator

Full-stack web app that generates ATS-compliant PDF resumes from a form. Built with FastAPI + WeasyPrint (backend) and Vite + React (frontend).

## Setup & Run

### Backend

```bash
# Install system dependencies (Debian/Ubuntu)
sudo apt-get install -y libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0

cd backend
pip install -r requirements.txt
python main.py
# → http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Production build

```bash
cd frontend
npm run build    # outputs /dist
npm run preview  # preview at http://localhost:4173
```

## Configuration

Copy `.env.local` and set your backend URL if needed:

```
VITE_API_URL=http://localhost:8000
```

## Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Backend  | FastAPI, WeasyPrint, Pillow   |
| Frontend | Vite, React 18, Axios         |
| PDF      | HTML+CSS → WeasyPrint         |

## API

`POST /generate-resume` — multipart/form-data

| Field        | Type   | Required |
|--------------|--------|----------|
| full_name    | string | ✓        |
| email        | string | ✓        |
| phone        | string | ✓        |
| location     | string | ✓        |
| linkedin     | string |          |
| skills       | string | comma-separated |
| experience   | JSON   | array of `{title, company, start_date, end_date, achievements}` |
| education    | JSON   | array of `{institution, degree, year}` |
| photo        | file   | JPG/PNG, max 5MB |

Returns: `application/pdf`
