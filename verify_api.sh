#!/bin/bash

# Configuration
BASE_URL="http://localhost:5001/api"
ENGR_PHONE="9000000002"
WORKR_PHONE="8000000002"
PASSWORD="password123"

echo "=== 1. Registering Engineer ==="
curl -s -X POST "$BASE_URL/auth/register" \
-H "Content-Type: application/json" \
-d "{
  \"name\": \"Engr Test\",
  \"phone\": \"$ENGR_PHONE\",
  \"password\": \"$PASSWORD\",
  \"role\": \"engineer\",
  \"pincode\": \"110001\"
}" | jq .

echo -e "\n=== 2. Logging in Engineer ==="
ENGR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
-H "Content-Type: application/json" \
-d "{
  \"phone\": \"$ENGR_PHONE\",
  \"password\": \"$PASSWORD\"
}")
TOKEN=$(echo $ENGR_LOGIN | jq -r .token)
echo "Token: $TOKEN"

echo -e "\n=== 3. Posting a Job ==="
curl -s -X POST "$BASE_URL/jobs" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $TOKEN" \
-d '{
  "title": "Scripted Job",
  "description": "Verification via script",
  "pincode": "110001",
  "coordinates": [77.209, 28.6139],
  "salary": "1000"
}' | jq .

echo -e "\n=== 4. Registering Worker ==="
curl -s -X POST "$BASE_URL/auth/register" \
-H "Content-Type: application/json" \
-d "{
  \"name\": \"Worker Test\",
  \"phone\": \"$WORKR_PHONE\",
  \"password\": \"$PASSWORD\",
  \"role\": \"worker\",
  \"pincode\": \"110001\"
}" | jq .

echo -e "\n=== 5. Logging in Worker ==="
WORKR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
-H "Content-Type: application/json" \
-d "{
  \"phone\": \"$WORKR_PHONE\",
  \"password\": \"$PASSWORD\"
}")
WTOKEN=$(echo $WORKR_LOGIN | jq -r .token)
echo "Worker Token: $WTOKEN"

echo -e "\n=== 6. Getting Nearby Jobs ==="
curl -s -X GET "$BASE_URL/jobs/nearby?lng=77.209&lat=28.6139&radius=10" \
-H "Authorization: Bearer $WTOKEN" | jq .
