# useGetCity Hook – Detailed Workflow

This document explains in detail how the **useGetCity** hook detects and stores the user’s geographical location.

---

## Goal of the Hook

- Detect user’s current location
- Convert coordinates into readable address
- Store city, state, and address in Redux

---

## Where It Is Used

- Called globally (usually in App.jsx)
- Runs when user data changes

---

## Internal Working (Step-by-Step)

### 1) Hook Execution
- `useGetCity()` runs
- Triggered by `useEffect` dependency on user state

---

### 2) Browser Geolocation
- Browser requests permission from user
- User allows location access

---

### 3) Coordinates Retrieval
- Browser provides:
  - Latitude
  - Longitude

---

### 4) Reverse Geocoding API Call
- Axios calls Geoapify API
- Coordinates are converted to address details

---

### 5) Data Processing
- City is extracted (city / town / district)
- State is extracted
- Formatted address is selected

---

### 6) Redux Updates
- `setCurrentCity(city)`
- `setCurrentState(state)`
- `setCurrentAddress(address)`

---

## Final Redux State

state.user.currentCity  
state.user.currentState  
state.user.currentAddress  

---

## Final Result

- User location is detected automatically
- Address data is globally available
- Enables location-based features
