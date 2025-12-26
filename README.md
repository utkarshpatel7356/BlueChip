
# 📈 BlueChip - The Social Stock Market

### *The Attention Economy, Gamified.*

[**🚀 Live Demo**](https://blue-chip-beta.vercel.app/) | [**📄 API Documentation**](https://bluechip-api-vf0l.onrender.com/docs)

![BlueChip Banner](https://via.placeholder.com/1200x400/0a0a0a/00ff9d?text=BlueChip+Social+Market)

## 💡 What is BlueChip?
BlueChip is a **social stock market** where every user post becomes a tradeable asset. 

Instead of just "liking" a post, users **buy shares** in it.
- **The Price** is determined by a mathematical **Bonding Curve**. As more people buy, the price goes up quadratically.
- **The Strategy:** Spot high-potential content early (IPOs), buy low, and sell when the post goes viral.
- **The Result:** A gamified social experience where influence equals net worth.

---

## ✨ Features

- **💸 Real-Time Trading Engine:** Buy and Sell shares instantly. Price updates dynamically based on supply/demand.
- **📉 Bonding Curve Algorithm:** `Price = 10 + (Shares^2 / 20)`. No order books; liquidity is automated.
- **🖥️ Bloomberg-Style Terminal:** A dark-mode, data-heavy UI designed for "financial" readability.
- **📊 Portfolio Management:** Track your Holdings, Cost Basis, Market Value, and Realized P&L.
- **🏆 Leaderboard:** Compete for the highest Net Worth against other traders.
- **🔐 Secure Auth:** JWT-based authentication with bcrypt password hashing.

---

## 🛠️ Tech Stack

### **Backend (The Engine)**
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python) - High performance, async support.
- **Database:** PostgreSQL (Production) / SQLite (Local).
- **ORM:** [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic).
- **Auth:** Python-Jose (JWT Tokens) & Passlib (Bcrypt).
- **Deployment:** Render.

### **Frontend (The Terminal)**
- **Framework:** [React](https://react.dev/) + Vite.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom "Terminal" Theme).
- **Icons:** Lucide React.
- **State Management:** React Context API.
- **Deployment:** Vercel.

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- Python 3.9+
- Node.js & npm

### 1. Clone the Repo
```bash
git clone [https://github.com/utkarshpatel7356/BlueChip.git](https://github.com/utkarshpatel7356/BlueChip.git)
cd BlueChip

```

### 2. Backend Setup

```bash
cd backend
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

```

*The API will start at `http://127.0.0.1:8000*`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run the UI
npm run dev

```

*The App will start at `http://localhost:5173*`

---

## 📐 The Math (Bonding Curve)

BlueChip uses a quadratic bonding curve to ensure continuous liquidity.

* **Buy Price:** Calculated by integrating the curve for the *next* share.
* **Sell Price:** Users can always sell back to the curve at the current supply price.

$$ Price = BasePrice + \frac{Supply^2}{SlopeFactor} $$

*Currently set to: Base $10, Slope 20.*

---

## 📸 Screenshots

| Market Feed | Portfolio Dashboard |
| --- | --- |
|  |  |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
