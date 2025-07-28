#!/bin/bash

# Outbox Pattern Test Script
# This script tests the outbox pattern implementation

BASE_URL="http://localhost:3000"
TEST_USER_ID="test-user-123"
TEST_POST_ID="test-post-123"

echo "🧪 Starting Outbox Pattern Tests..."
echo "=================================="

# Test 1: Health Check
echo -e "\n1. Testing server health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

# Test 2: Create Post with Outbox
echo -e "\n2. Testing post creation with outbox..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"recipeName\": \"Test Recipe - Outbox Test\",
    \"prepTimeMin\": 30,
    \"difficulty\": \"Easy\",
    \"instructions\": \"Test instructions for outbox testing\",
    \"cuisine\": \"Test Cuisine\",
    \"imageUrl\": \"https://test-image.jpg\"
  }")

if echo "$POST_RESPONSE" | grep -q "Post created"; then
    echo "✅ Post created successfully"
else
    echo "❌ Post creation failed: $POST_RESPONSE"
fi

# Test 3: Create Comment with Outbox
echo -e "\n3. Testing comment creation with outbox..."
COMMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts/$TEST_POST_ID/comments" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"content\": \"Test comment for outbox testing\"
  }")

if echo "$COMMENT_RESPONSE" | grep -q "comment_id"; then
    echo "✅ Comment created successfully"
else
    echo "❌ Comment creation failed: $COMMENT_RESPONSE"
fi

# Test 4: Like Post with Outbox
echo -e "\n4. Testing post like with outbox..."
LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts/like" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"postId\": \"$TEST_POST_ID\"
  }")

if echo "$LIKE_RESPONSE" | grep -q "user_id"; then
    echo "✅ Post liked successfully"
else
    echo "❌ Post like failed: $LIKE_RESPONSE"
fi

# Test 5: User Signup with Outbox
echo -e "\n5. Testing user signup with outbox..."
TIMESTAMP=$(date +%s)
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser_$TIMESTAMP\",
    \"email\": \"test_$TIMESTAMP@example.com\",
    \"password\": \"testpassword123\"
  }")

if echo "$SIGNUP_RESPONSE" | grep -q "User created successfully"; then
    echo "✅ User signup successful"
else
    echo "❌ User signup failed: $SIGNUP_RESPONSE"
fi

# Test 6: Send Friend Request with Outbox
echo -e "\n6. Testing friend request with outbox..."
FRIEND_RESPONSE=$(curl -s -X POST "$BASE_URL/api/friends/request" \
  -H "Content-Type: application/json" \
  -d "{
    \"sender_id\": \"$TEST_USER_ID\",
    \"receiver_id\": \"test-receiver-456\"
  }")

if echo "$FRIEND_RESPONSE" | grep -q "Friend request sent"; then
    echo "✅ Friend request sent successfully"
else
    echo "❌ Friend request failed: $FRIEND_RESPONSE"
fi

# Test 7: Check Outbox Status
echo -e "\n7. Checking outbox status..."
OUTBOX_STATUS=$(curl -s "$BASE_URL/api/admin/outbox/status")
echo "📊 Outbox Status: $OUTBOX_STATUS"

# Test 8: Wait for Outbox Processor
echo -e "\n8. Waiting for outbox processor to run (5 seconds)..."
sleep 5

# Test 9: Check Outbox Status Again
echo -e "\n9. Checking outbox status after processing..."
OUTBOX_STATUS_AFTER=$(curl -s "$BASE_URL/api/admin/outbox/status")
echo "📊 Outbox Status After Processing: $OUTBOX_STATUS_AFTER"

# Test 10: Concurrent Writes Test
echo -e "\n10. Testing concurrent writes..."
for i in {1..3}; do
    CONCURRENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posts" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$TEST_USER_ID\",
        \"recipeName\": \"Concurrent Test Recipe $i\",
        \"prepTimeMin\": 30,
        \"difficulty\": \"Easy\",
        \"instructions\": \"Concurrent test instructions $i\",
        \"cuisine\": \"Test Cuisine\",
        \"imageUrl\": \"https://test-image-$i.jpg\"
      }" &
    )
    echo "   Concurrent request $i sent"
done

# Wait for concurrent requests to complete
wait

echo -e "\n11. Final outbox status check..."
FINAL_STATUS=$(curl -s "$BASE_URL/api/admin/outbox/status")
echo "📊 Final Outbox Status: $FINAL_STATUS"

echo -e "\n🎉 Outbox pattern tests completed!"
echo "Check the responses above to verify everything is working correctly." 