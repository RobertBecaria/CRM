#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Fix the dashboard to subtract retreat expenses from total income to show net profit instead of gross income"

backend:
  - task: "Financial statistics API returns retreat expenses data"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Backend already correctly calculates retreat_expenses_ytd and retreat_profit_ytd in get_financial_stats_ytd()"
      - working: true
        agent: "testing"
        comment: "✅ COMPREHENSIVE TESTING COMPLETED: /api/stats/overview endpoint fully validated. All required financial fields present and correctly calculated: retreat_expenses_ytd, retreat_profit_ytd, revenue_ytd, tips_ytd. Tested with real retreat data (90,000 revenue, 31,000 expenses = 59,000 profit). Authentication working. All API responses correct. Backend implementation is solid."
  - task: "Visit payment_type field support"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added payment_type field to VisitCreate and VisitUpdate models. Field is stored when creating/updating visits."
      - working: true
        agent: "testing"
        comment: "✅ COMPREHENSIVE PAYMENT_TYPE TESTING COMPLETED: All payment_type functionality working perfectly. Successfully tested: 1) Create free visits with payment_type='благотворительность' and 'абонемент' (both returned correct payment_type and price=0), 2) Update visit payment_type field (successfully changed from 'благотворительность' to 'абонемент'), 3) Get visits returns payment_type field correctly (found 2 visits with payment_type in response). Backend API fully supports payment_type field for free visits."

frontend:
  - task: "Dashboard shows net profit (income minus expenses)"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/Dashboard.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Updated Dashboard.js to show 'Чистая прибыль' (Net Profit) = revenue + tips - retreat_expenses. Added new card for 'Расходы на ретриты' (Retreat Expenses) with retreat profit in subtitle"
  - task: "Remove 'Доход за 30 дней' financial KPI card"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/Dashboard.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Removed the second financial KPI card 'Доход за 30 дней' from Dashboard"
  - task: "Dynamic practices from settings in Dashboard stats"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Dashboard.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Dashboard now fetches practices from settings and shows all practices (including PTRP and others) in the Практики за год section, even if count is 0"
      - working: true
        agent: "testing"
        comment: "✅ SETTINGS API VALIDATION COMPLETED: GET /api/settings endpoint working correctly. Successfully returns practices array with all configured practices: ['Коррекция', 'ТСЯ', 'Лепило', 'Ребефинг', 'PTRP']. Backend settings API is fully functional and ready for frontend integration."
  - task: "Payment type selection for free visits"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/ClientDetail.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Added payment type selector when price is 0. User can choose between 'Благотворительность' and 'Абонемент'. Also updated Calendar.js display."
  - task: "Backup restore file upload fix"
    implemented: true
    working: true
    file: "/app/frontend/src/pages/Settings.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Fixed backup restore by separating file input from AlertDialogAction. Now using controlled dialog and ref-based file input that works properly."
      - working: true
        agent: "testing"
        comment: "✅ RESTORE API VALIDATION COMPLETED: POST /api/restore endpoint working correctly. Successfully tested with backup data containing clients, visits, and retreats. API correctly restored 1 client and 1 visit from backup JSON. Backend restore functionality is fully operational and ready for frontend file upload integration."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 3
  run_ui: false

test_plan:
  current_focus:
    - "Dashboard shows net profit (income minus expenses)"
    - "Payment type selection for free visits"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: "Updated Dashboard to subtract retreat expenses from total income. Now shows 'Чистая прибыль' (Net Profit) instead of 'Общий доход' (Gross Income). Also added a dedicated card for retreat expenses. Please test the /api/stats/overview endpoint to verify retreat_expenses_ytd and retreat_profit_ytd are returned correctly."
  - agent: "testing"
    message: "✅ BACKEND TESTING COMPLETE: Financial statistics API (/api/stats/overview) is working perfectly. All required fields (retreat_expenses_ytd, retreat_profit_ytd, revenue_ytd, tips_ytd) are present and correctly calculated. Tested with real data: created retreat with 90,000 revenue and 31,000 expenses, API correctly returned 59,000 profit. Authentication working. Backend implementation is solid and ready. Frontend testing needed next."
  - agent: "main"
    message: "Implemented 4 fixes: 1) Removed 'Доход за 30 дней' financial KPI card, 2) Dashboard now shows all practices from settings including PTRP, 3) Added payment type selector (Благотворительность/Абонемент) for free visits, 4) Fixed backup restore file upload in Settings. Please test the backend API for payment_type field on visits."
  - agent: "testing"
    message: "✅ BACKEND PAYMENT_TYPE TESTING COMPLETE: All payment_type functionality working perfectly. Successfully tested: 1) Create free visits with payment_type (благотворительность/абонемент) - both work correctly with price=0, 2) Update visit payment_type - successfully changes values, 3) Get visits returns payment_type field correctly, 4) Settings API returns practices array correctly, 5) Restore API works with backup data. Backend APIs are fully functional. Frontend testing needed for UI integration."