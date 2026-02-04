# useGetMyShop Hook – Detailed Workflow

This document explains in detail how the **useGetMyShop** hook fetches and manages shop data for a logged-in owner.

---

## Goal of the Hook

- Fetch shop related to logged-in owner
- Store shop data in Redux
- Prevent multiple API calls
- Provide global access to shop data

---

## Where It Is Used

- Used inside owner dashboard components
- Runs once when component mounts

---

## Internal Working (Step-by-Step)

### 1) Component Mounts
- Owner dashboard loads
- Redux store is already active

---

### 2) Hook Execution
- `useGetMyShop()` runs
- `useEffect` triggers once

---

### 3) API Request
- Axios sends request

GET /api/shop/get-my  
(with `withCredentials: true`)

- Cookie contains owner’s authentication token

---

### 4) Backend Validation
- Backend verifies token
- Confirms request is from authenticated owner

---

### 5) Shop Fetching
- Backend finds shop linked to owner ID
- Shop data is retrieved from database

---

### 6) Response to Frontend
- Backend sends shop object
- Frontend receives the response

---

### 7) Redux Update
- `dispatch(setMyShopData(result.data))`
- Shop data is stored in Redux

---

## Final Redux State

state.owner.myShopData = {
  _id,
  name,
  address,
  status,
  ...
}

---

## Final Result

- Shop data is loaded once
- Available across all owner components
- Clean and optimized data flow
