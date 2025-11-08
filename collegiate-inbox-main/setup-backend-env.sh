#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting JWKS..."
npx convex env set "JWKS" -- "{\"keys\":[{\"use\":\"sig\",\"kty\":\"RSA\",\"n\":\"nZ8gIx0UJelXVcc0vrZtK2v8kBVy23Uk7g-FAS_GhhaPLzikmy7_sxmoQBitMOATM_WGwTdfj7XGvYGl737xP2CwTDwNQbpfQ_DdGbls6HBZjyNKGX3XHkwc-m6MHCBIQ0EEeWxF-eTt1QXWo_mWUKnjG4TPIvM8Pcp1XTKEDkL2_yStd9vwwyFin0uhcjts91Y6j5x9oYs3IhFqZCwRsPruM2A9tG7zpncdmVkJ34vlITx4GQhOuOy63gWVABLyiur4jjn6mCBc3hRs9aPfQr-RkcYvmO1yw8khhvL-rVy99euXQ2BDZh5tQ2hdFiUuVN83rusdW-JvVLH35C59Vw\",\"e\":\"AQAB\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
npx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCdnyAjHRQl6VdV xzS+tm0ra/yQFXLbdSTuD4UBL8aGFo8vOKSbLv+zGahAGK0w4BMz9YbBN1+Ptca9 gaXvfvE/YLBMPA1Bul9D8N0ZuWzocFmPI0oZfdceTBz6bowcIEhDQQR5bEX55O3V Bdaj+ZZQqeMbhM8i8zw9ynVdMoQOQvb/JK132/DDIWKfS6FyO2z3VjqPnH2hizci EWpkLBGw+u4zYD20bvOmdx2ZWQnfi+UhPHgZCE647LreBZUAEvKK6viOOfqYIFze FGz1o99Cv5GRxi+Y7XLDySGG8v6tXL3165dDYENmHm1DaF0WJS5U3zeu6x1b4m9U sffkLn1XAgMBAAECggEAC+WPROc0dpoSk/BZrE1TlxPq96sOxL6mP2ufc9P5zXQV cZB6aBYXiZqVpuTV6Zr4CBNvjNTTmyKysen/rsBrkAeJtu9PZtccyqF65q6mqDKW p+WXea4UVv6Sr1o5rAPJwH2/SzTfYTmks8/hf/XeIQ95i0GuaqpmMRm/Wv3tlq/b ztNSvRqnL66Kq1QUgnsVUbKdMErcUXGqFriYADGfdSteTn0Hn7rqFkGtaiX9t7E+ gk76mBH8G7+fqqBn16twJ+qktp2PRMRO6NU59WsE5l+dS0zsz4KWsMKhVbOt38+A +DvxvDURaxTsjSuwLlA2OB+oncixN6GV1ru7r+hTeQKBgQDZVspDvw8b9DQSnAsj lzeIUPdJsG3B8q6mfPVjGbjY8K0yxpZT7b79LuHSK5fo7HRJLIbnzBmh+np3VxvH 7wZ+PS6zYUxDJh5fFvIgRhPtao8gv4zZpSbkys/5HyC4m1K+b5aAdwR5hQhT1ZTq ZVjSRXbWbpQkfcwJ8YMqXUpMPwKBgQC5qOpqHSFhxKr/cFYA8dV0WwVVy+bXaEU1 nbMCND3HMDRL4Itjig5LIJ+IdJc9sHYTRX9bTVefRp/WXYhMbcBBg814vBdbxcRr zI+j4icZ2w+RghJpQn+QXG1q8ZbUoHIjWhZddc+A5hAWyN/TKNjAwXJu/rMygSXf OaWOVAro6QKBgQCWd1u440FWnQ6gA6BCl6I+oa9SOO8D4zu+z6wjW995cca27H2O xX4AUsDMfJnDDFDFiCotuEPWvE6k6I23MWhRZZI7ZhUiN/W252/hoCKTr74/cd3V oFz48OBjHIXOyNnUNfUAI2XZq5xETg226UtA6A6KDixJxz3HdIjWf5e8iQKBgQCb 4WAYAidSAB8WY0pCdsmibP24wH8r4schMivnMNeh0y5Fet1tkK9ZkqV/m2yUhgFN Qu+gR/rGpzRydouGqCtglnpA4aO3EQBPBiygC7SKt+uFXzF4ITYbjg7sWLUsBx5t 4iifBdhYQFHH35ZVo5kBliovWTg5skeK+cqwCo4yaQKBgQCcpdgQ5wo6DFAyALUb cuqAqmGXl0eULZ38SLK1AvM+cJvTpzK7CD6HHcwR+LJ7L9O29hn1u/wvfVNkqQTn ros9MiIV42ew3D/sJ6ER49e77iQan5XnTm6dEV+Oaow7q/LDfDW3nxMGtKepFxiQ 3zc+vlZBpPwZMzwdqXOwOu93nw"

echo "Setting SITE_URL..."
npx convex env set "SITE_URL" -- "http://localhost:5173"

echo "Setting VLY_APP_NAME..."
npx convex env set "VLY_APP_NAME" -- "Collegiate Inbox"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"
