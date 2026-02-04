# React + Redux + Backend Authentication Workflow

This document explains how **all files work together** to get the current logged-in user.

Files involved:
- Redux Store
- User Slice
- `useGetCurrentUser` hook
- Backend Auth Middleware
- Backend Controller
- Backend Routes
- Server Entry File

---

## 1) App Starts (Frontend)

- App loads in the browser
- Redux store is created
- App is wrapped with `Provider`
- Redux is now available everywhere

---

## 2) Redux Store (`store.js`)

- Redux store is created using `configureStore`
- `userSlice` reducer is added under `user`

Redux state looks like:

state = {
  user: {
    userData: null
  }
}

At start:
- `userData = null`

---

## 3) User Slice (`userSlice.js`)

- This slice handles **user data**
- `setUserData` is used to save user info
- Initially user data is empty (`null`)

Redux is ready, but no user info yet.

---

## 4) App Loads → `useGetCurrentUser` Runs (Frontend)

- `useGetCurrentUser()` is called inside `App.jsx`
- It runs **once** using `useEffect`

What it does:
- Calls backend API to get current user

API called:

GET /api/user/current  
(with cookies)

---

## 5) Request Goes to Backend (`index.js`)

Backend server setup:
- Express server is running
- Cookies are enabled
- CORS allows frontend requests
- Routes are registered

User route:
- `/api/user/current` → userRouter

---

## 6) Route Handling (`user.routes.js`)

Route definition:

GET /current → isAuth → getCurrentUser 

This means:
1. First `isAuth` middleware runs
2. If success → `getCurrentUser` runs

---

## 7) Authentication Check (`isAuth.js`)

What `isAuth` does :

- Gets token from cookies
- If token not found → error
- Verifies token using secret key
- Extracts `userId` from token
- Attaches `userId` to request
- Calls `next()`

If token is valid → user is authenticated

---

## 8) Get Current User (`user.controller.js`)

What `getCurrentUser` does :contentReference

- Reads `req.userId`
- Finds user from database
- If user exists → sends user data
- Sends response back to frontend

Response:
- User object (JSON)

---

## 9) Response Comes Back to Frontend

Back in `useGetCurrentUser` hook:

- API response is received
- User data is extracted
- `setUserData(result.data)` is dispatched

Redux updates:

state.user.userData = userObject

---

## 10) Data Is Available Everywhere

Now:
- Redux has user data
- Any component can access it

Example:

const userData = useSelector(state => state.user.userData);

---

## Complete Workflow (Step by Step)

1. App starts
2. Redux store is created
3. `useGetCurrentUser` runs
4. Frontend calls `/api/user/current`
5. Backend receives request
6. `isAuth` checks token
7. Token is verified
8. `getCurrentUser` fetches user
9. Backend sends user data
10. Redux saves user data
11. App knows user is logged in

---

## Final Result

- User stays logged in after refresh
- Redux stores user data globally
- Backend securely checks authentication
- Clean and simple full-stack flow
