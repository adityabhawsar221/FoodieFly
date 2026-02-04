# isAuth.js – Authentication Guard

## What this file does
This middleware checks whether the user is logged in or not.

## Step-by-step flow
1. Reads token from cookies.
2. Verifies token using secret key.
3. Extracts userId from token.
4. Attaches userId to request.
5. Allows request to continue.

## Why this is needed
Without authentication, anyone could:
- Create shops
- Add items
- Edit data

## Real life example
This is like checking ID card before entering an exam hall.
