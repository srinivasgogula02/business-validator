#!/bin/bash

BASE_URL="http://localhost:3000/api/chat"
VENTURE_ID="test-venture-e2e-$(date +%s)"

echo "Starting E2E Test for Venture ID: $VENTURE_ID"

# Helper function to send chat message
send_message() {
  local content="$1"
  local stage="$2"
  local kg="$3"
  
  echo "----------------------------------------------------------------"
  echo "User: $content"
  echo "Current Stage: $stage"
  
  response=$(curl -s -N -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [{\"role\": \"user\", \"content\": \"$content\"}],
      \"knowledgeGraph\": $kg,
      \"stage\": \"$stage\",
      \"ventureId\": \"$VENTURE_ID\"
    }")
  
  echo "AI Response (First 100 chars): ${response:0:100}..."
  return 0
}

# 1. Start / Reset
echo "STEP 1: Initial Discovery"
KG='{
  "core_inputs": {},
  "refinements": {},
  "validation_evidence": {},
  "market_data": {"competitors": []},
  "red_flags": [],
  "outputs": {}
}'

# We'll just print the curl command to verify connectivity first
curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [{\"role\": \"user\", \"content\": \"I want to start a drone delivery service for medicines in rural India.\"}],
      \"knowledgeGraph\": $KG,
      \"stage\": \"discovery\",
      \"ventureId\": \"$VENTURE_ID\"
    }"

echo ""
echo "Test ping complete. Running robust simulation..."

# Simulating a full flow is complex with just bash due to JSON manipulation needed for the KnowledgeGraph updates.
# Instead, I will run a sequence of independent checks that assume state persistence (which we mocked in the previous steps).
# actually, since I can't easily parse the JSON response in bash without 'jq' (which might not be available), 
# I will output the raw response to a file and grep for success indicators.

# 1. Core Input --> Should stay in Discovery
echo "Sending Core Input..."
curl -s -N -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [{\"role\": \"user\", \"content\": \"I want to start a drone delivery service for medicines in rural India.\"}],
      \"knowledgeGraph\": $KG,
      \"stage\": \"discovery\",
      \"ventureId\": \"$VENTURE_ID\"
    }" > step1_response.txt

if grep -q "medicine" step1_response.txt; then
    echo "✅ Step 1: AI acknowledged topic."
else
    echo "❌ Step 1 Failed."
fi

# 2. Force Analysis Logic Check
# We'll simulate a KG that is FULL and see if it triggers 'analysis'
FULL_KG='{
  "core_inputs": {
      "business_idea": "Drone Delivery",
      "target_customer": "Rural Hospitals",
      "problem_statement": "Slow ambulance access",
      "solution_differentiation": "Autonomous drones",
      "location": "Rural India",
      "context_type": "new_idea"
  },
  "refinements": {},
  "validation_evidence": {},
  "market_data": {"competitors": []},
  "red_flags": [],
  "outputs": {}
}'

echo "Sending Completed Core Inputs (Expect: Transition to Analysis)..."
# We look for the custom header X-Stage if possible, but standard curl might not show it easily without -v. 
# We'll look for the AI's verbal confirmation in the text stream.
curl -s -N -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [{\"role\": \"user\", \"content\": \"Yes, I have confirmed the location is rural Andhra Pradesh.\"}],
      \"knowledgeGraph\": $FULL_KG,
      \"stage\": \"discovery\",
      \"ventureId\": \"$VENTURE_ID\"
    }" > step2_response.txt

if grep -q "Analysis" step2_response.txt || grep -q "analysis" step2_response.txt; then
    echo "✅ Step 2: AI transitioned to Analysis phase (detected keywords)."
else
    echo "❌ Step 2 Warning: AI might have transitioned but text didn't explicitly say 'Analysis'. Checking logs recommended."
    cat step2_response.txt
fi

# 3. Report Generation Check
# Simulate user asking for report
echo "Requesting Report..."
curl -s -N -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [{\"role\": \"user\", \"content\": \"I am done, give me the report.\"}],
      \"knowledgeGraph\": $FULL_KG,
      \"stage\": \"analysis\",
      \"ventureId\": \"$VENTURE_ID\"
    }" > step3_response.txt

# We check if it mentions 'Report' or 'Pitch Deck' or similar
if grep -q "Report" step3_response.txt || grep -q "report" step3_response.txt; then
     echo "✅ Step 3: AI recognized Report request."
else
     echo "❌ Step 3 Failed."
fi

rm step1_response.txt step2_response.txt step3_response.txt
echo "E2E Test Simulation Complete."
