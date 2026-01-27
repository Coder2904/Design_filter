# 🎛️ Digital Filter Design Tool

**A professional web-based application for designing, visualizing, and exporting digital FIR and IIR filters**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) 

*Design professional-grade digital filters in your browser - no MATLAB required!*

</div>

---

## ✨ Features

### 🔧 Filter Design Capabilities

- **FIR Filters**
  - 🪟 Window Method (Hamming, Hanning, Blackman, Kaiser, Rectangular)
  - 🎯 Parks-McClellan (Remez) Algorithm
  
- **IIR Filters**
  - 📊 Butterworth (Maximally Flat)
  - 🌊 Chebyshev Type I & II (Equiripple)
  - ⚡ Elliptic (Cauer)

- **Filter Types**
  - Low-pass | High-pass | Band-pass | Band-stop

### 📈 Interactive Visualization

- 📉 **Magnitude Response** - Frequency domain in dB
- 🔄 **Phase Response** - Phase characteristics in radians
- ⚡ **Impulse Response** - Time domain behavior
- 📊 **Step Response** - Transient analysis
- 🎯 **Pole-Zero Plot** - Stability analysis (IIR)

### 🔐 User Features

- 🔑 **Google OAuth Authentication** - Secure login
- ☁️ **Cloud Storage** - Save designs to database
- 🏷️ **Design Management** - Organize with tags and favorites
- 📱 **Responsive Design** - Works on desktop and mobile

### 💾 Export Formats

```matlab
% MATLAB
b = [0.001, 0.003, ..., 0.201, ...];
a = [1.0];
```

```python
# Python
import numpy as np
b = np.array([0.001, 0.003, ..., 0.201, ...])
a = np.array([1.0])
```

```c
// C/C++ (Embedded Systems)
float b[51] = {0.001f, 0.003f, ..., 0.201f, ...};
float a[1] = {1.0f};
```

---

## 🎬 Demo

### Live Demo
🌐 **[Try it now!](#)** *(Coming soon)*

### Quick Start Video
📹 **[Watch Tutorial](#)** *(Coming soon)*

### Screenshots

🖼️ View Screenshots

#### Login Page
![Login](https://via.placeholder.com/600x400/667eea/ffffff?text=Login+Page)

#### Filter Specification
![Specification](https://via.placeholder.com/600x400/667eea/ffffff?text=Filter+Specification)

#### Results Visualization
![Results](https://via.placeholder.com/600x400/667eea/ffffff?text=Frequency+Response)

#### Dashboard
![Dashboard](https://via.placeholder.com/600x400/667eea/ffffff?text=User+Dashboard)

</details>

---

## 🚀 Installation

### Prerequisites

- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/digital-filter-design-tool.git
cd digital-filter-design-tool
```

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your credentials

# Run backend server
python app.py
```

Backend will run on **http://localhost:5000** 🚀

### Frontend Setup

```bash
# Navigate to frontend directory (in new terminal)
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Google Client ID

# Start development server
npm start
```

Frontend will run on **http://localhost:3000** 🎨

---

## 🔑 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google+ API**

### 2. Create OAuth Credentials

1. Navigate to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Configure consent screen (External, add your email)
3. Create OAuth Client:
   - **Application type:** Web application
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `http://localhost:3000`
4. Copy **Client ID** and **Client Secret**

### 3. Update Environment Variables

**Backend `.env`:**
```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
SECRET_KEY=your_generated_secret_key  # Generate: python -c "import secrets; print(secrets.token_hex(32))"
DATABASE_URL=sqlite:///filter_designs.db
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env`:**
```bash
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

---

## 📖 Usage

### Designing Your First Filter

1. **Login** with your Google account
2. Click **"Create New Design"**
3. **Specify** filter parameters:
   - Sampling frequency (e.g., 10000 Hz)
   - Filter type (Low-pass, High-pass, Band-pass, Band-stop)
   - Cutoff frequency (e.g., 1000 Hz)
   - Filter order (e.g., 51)
   - Design method (Window, Parks-McClellan, Butterworth, etc.)
4. Click **"Design Filter"**
5. **Analyze** the results:
   - View magnitude and phase response
   - Check impulse and step response
   - Verify stability (pole-zero plot)
6. **Save** your design with a name and description
7. **Export** coefficients in your preferred format

### Example: Audio Low-pass Filter

```javascript
// Filter specifications
Sampling Rate: 48000 Hz
Cutoff Frequency: 5000 Hz
Filter Type: Low-pass
Method: FIR Window (Hamming)
Order: 101

// Result: Clean audio filter for removing high-frequency noise
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Browser)                        │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────▼──────────────────┐
        │   FRONTEND (React SPA)           │
        │   - UI Components                │
        │   - State Management (Context)   │
        │   - Visualization (Recharts)     │
        └───────────────┬──────────────────┘
                        │ REST API (JSON)
        ┌───────────────▼──────────────────┐
        │   BACKEND (Flask API)            │
        │   - RESTful Endpoints            │
        │   - Authentication (JWT)         │
        │   - Business Logic               │
        └───────────────┬──────────────────┘
                        │
            ├───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   DSP    │ │ Database │ │  Google  │
    │  Engine  │ │ (SQLite) │ │  OAuth   │
    │ (SciPy)  │ │          │ │          │
    └──────────┘ └──────────┘ └──────────┘
```

### Tech Stack

**Frontend:**
- ⚛️ React 18.2.0
- 📊 Recharts (Visualization)
- 🔌 Axios (HTTP Client)
- 🎨 Custom CSS

**Backend:**
- 🐍 Python 3.11+
- 🌶️ Flask 3.0.0
- 🔢 SciPy (DSP Algorithms)
- 🗄️ SQLAlchemy (ORM)
- 🔐 PyJWT (Authentication)

**Database:**
- 💾 SQLite (Development)
- 🐘 PostgreSQL (Production Ready)

---

## 📊 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

| Method | Endpoint         | Description            |Auth Required |
|--------|------------------|------------------------|---------------|
| `POST` | `/auth/google`   | Login with Google        | ❌ |
| `GET` | `/auth/verify`    | Verify JWT token         | ✅ |
| `POST` | `/design-filter` | Design a filter          | ✅ |
| `GET` | `/designs`        | List user's designs      | ✅ |
| `POST` | `/designs`       | Save a design            | ✅ |
| `GET` | `/designs/:id`    | Get specific design      | ✅ |
| `PUT` | `/designs/:id`    | Update design            | ✅ |
| `DELETE` | `/designs/:id` | Delete design             | ✅ |
| `POST` | `/export-coefficients` | Export coefficients | ✅ |

### Example Request

```bash
curl -X POST http://localhost:5000/api/design-filter \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filter_class": "fir",
    "filter_type": "lowpass",
    "sampling_freq": 10000,
    "passband_freq": 1000,
    "order": 51,
    "method": "window",
    "window": "hamming"
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "coefficients": {
      "b": [0.001, 0.003, ..., 0.201, ...],
      "a": [1.0]
    },
    "frequency_response": {
      "frequency": [0, 1, 2, ..., 5000],
      "magnitude_db": [-0.01, -0.02, ..., -60.5],
      "phase": [0, -0.001, ...]
    },
    "impulse_response": [...],
    "step_response": [...],
    "pole_zero": {
      "poles": [],
      "zeros": [...]
    }
  }
}
```

---

## 📁 Project Structure

```
digital-filter-design-tool/
├── 📂 Backend/
│   ├── 📄 app.py                 # Flask application
│   ├── 📄 dsp_engine.py         # DSP computation engine
│   ├── 📄 models.py             # Database models
│   ├── 📄 auth.py               # Authentication logic
│   ├── 📄 requirements.txt      # Python dependencies
│   └── 📄 .env.example          # Environment template
│
├── 📂 Frontend/
│   ├── 📂 public/
│   │   ├── 📄 index.html
│   │   └── 📄 manifest.json
│   ├── 📂 src/
│   │   ├── 📂 contexts/
│   │   │   └── 📄 AuthContext.js     # Global auth state
│   │   ├── 📂 components/
│   │   │   ├── 📄 Login.js
│   │   │   ├── 📄 Dashboard.js
│   │   │   ├── 📄 FilterSpecification.js
│   │   │   ├── 📄 ResultsDisplay.js
│   │   │   ├── 📄 ExportPanel.js
│   │   │   └── 📄 SaveDesignModal.js
│   │   ├── 📄 App.js
│   │   ├── 📄 App.css
│   │   └── 📄 index.js
│   ├── 📄 package.json
│   └── 📄 .env.example
│
├── 📂 docs/
│   ├── 📄 API.md
│   ├── 📄 USER_GUIDE.md
│   └── 📄 DEPLOYMENT.md
│
├── 📄 README.md
├── 📄 LICENSE
└── 📄 .gitignore
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] FIR Window method (all windows)
- [ ] FIR Parks-McClellan
- [ ] IIR Butterworth
- [ ] IIR Chebyshev I/II
- [ ] IIR Elliptic
- [ ] Google OAuth login
- [ ] Save/Load/Delete designs
- [ ] Export all formats

---


## 📝 Changelog

### Version 1.0.0 (January 2026)

**✨ Initial Release**
- FIR filter design (Window, Parks-McClellan)
- IIR filter design (Butterworth, Chebyshev, Elliptic)
- Interactive visualization
- Google OAuth authentication
- Design storage and management
- Export to MATLAB, Python, C, Text

---

## 👨‍💻 Authors

**Priya Pandey**
- GitHub: [@Coder2904](https://github.com/Coder2904)
- Email: ppppriya.pandey0429@gmail.com
- LinkedIn: [(https://www.linkedin.com/in/priya-pandey-4b93b0296/)]

---

## 🙏 Acknowledgments

Special thanks to:
- [SciPy](https://scipy.org/) - For excellent DSP algorithms
- [React](https://react.dev/) - For powerful UI framework
- [Flask](https://flask.palletsprojects.com/) - For simple yet powerful backend
- [Recharts](https://recharts.org/) - For beautiful visualizations

---

## 📚 Resources

### Learn More

- 📖 [Digital Signal Processing Guide](https://www.dspguide.com/)
- 🎓 [SciPy Signal Processing Tutorial](https://docs.scipy.org/doc/scipy/tutorial/signal.html)
- 📊 [Filter Design Theory](https://en.wikipedia.org/wiki/Digital_filter)



## 🎯 Roadmap

### Short-term (Q1 2026)
- [ ] Filter comparison mode
- [ ] Template library
- [ ] Mobile app (React Native)
- [ ] Dark mode

### Medium-term (Q2-Q3 2026)
- [ ] Audio file processing
- [ ] Real-time filtering
- [ ] Collaborative design
- [ ] Advanced export formats (VHDL, Verilog)

### Long-term (Q4 2026+)
- [ ] AI-powered filter suggestions
- [ ] Multi-language support
- [ ] Desktop app (Electron)
- [ ] Educational platform



Made with ❤️ by Priya

[⬆ Back to Top](#-digital-filter-design-tool)

</div>
