# BloodConnect — Smart Blood Dispatch Platform

BloodConnect is a professional full-stack emergency blood coordination application. It helps operations teams register donors, create emergency blood requests, discover eligible donors and visualize donor proximity on an interactive map.

## Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript ES6+
- Bootstrap 5
- Leaflet maps
- Chart.js analytics

### Backend
- Node.js
- Express.js
- REST API
- Mongoose
- Swagger UI

### Database
- MongoDB

## Key Features

- Responsive professional operations dashboard
- Light mode by default
- One-click dark mode with persistent preference
- Emergency blood request management
- Donor registration and availability management
- ABO/Rh compatibility matching
- 90-day donor cooldown protection
- Haversine distance calculation and configurable radius
- Ranked donor matching results
- Interactive Leaflet map with hospital and matched donor markers
- Search and filtering for requests and donors
- Request lifecycle: OPEN → FULFILLED / CANCELLED
- Donor eligibility indicator
- CSV export for donor and request data
- Operations analytics with Chart.js
- API health check
- Swagger API documentation
- MongoDB seed data for demo use
- Clean modular client/server structure

## Project Structure

```text
bloodconnect/
├── client/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server/
│   ├── src/
│   │   ├── server.js
│   │   ├── models.js
│   │   ├── matching.js
│   │   ├── seed.js
│   │   └── swagger.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB Community Server or MongoDB Atlas
- npm

## Run Locally

1. Open a terminal in `bloodconnect/server`.
2. Create your environment file:

```powershell
copy .env.example .env
```

3. Install dependencies:

```powershell
npm install
```

4. Make sure MongoDB is running.
5. Start development mode:

```powershell
npm run dev
```

6. Open:

```text
http://localhost:5000
```

Swagger documentation:

```text
http://localhost:5000/api-docs
```

Health endpoint:

```text
http://localhost:5000/api/v1/health
```

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bloodconnect
CLIENT_URL=*
DEFAULT_MAX_DISTANCE_KM=50
NODE_ENV=development
```

## Matching Logic

A donor is considered for a request when the donor:

1. Has a compatible ABO/Rh blood group.
2. Is marked available.
3. Is outside the mandatory 90-day donation cooldown.
4. Is inside the configured maximum distance.

Results are ranked using direct blood-group matching and geographic distance.

## Interview Explanation

> “BloodConnect is a full-stack emergency blood dispatch platform. I built the frontend using HTML, CSS, JavaScript and Bootstrap, while Node.js and Express provide REST APIs and MongoDB stores donors and emergency requests. The main feature is a matching engine that first checks ABO/Rh compatibility, then excludes donors inside a 90-day cooldown, calculates Haversine distance from the hospital and returns ranked eligible donors. I also integrated Leaflet for geospatial visualization, Chart.js for operational analytics, Swagger for API documentation and a persistent light/dark theme.”

## Important Demo Data

The seed script creates sample Bhopal-area donors and an emergency request so the dashboard can be demonstrated immediately after the first server start.

## GitHub Tips

Before pushing to GitHub:

- Keep `.env` out of Git.
- Commit `.env.example` instead.
- Add a project screenshot/GIF to the README.
- Add the live deployment URL when deployed.
- Explain the matching algorithm in the repository README.
