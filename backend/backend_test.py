import requests
import sys
from datetime import datetime
import json

class KinesioCRMTester:
    def __init__(self, base_url="https://budget-balancer.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.client_id = None
        self.visit_id = None

    def log_test(self, name, passed, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {message}")
        
        self.test_results.append({
            "test": name,
            "passed": passed,
            "message": message,
            "response": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
                if not success:
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
            except:
                if not success:
                    print(f"   Response: {response.text}")

            if success:
                self.log_test(name, True, response_data=response_data)
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}", response_data)

            return success, response_data if success else {}

        except Exception as e:
            print(f"   Error: {str(e)}")
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_register(self, email, password):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✓ Token received: {self.token[:20]}...")
            return True
        return False

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✓ Token received: {self.token[:20]}...")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   ✓ User email: {response.get('email')}")
        return success

    def test_create_client(self, first_name, last_name, dob):
        """Test create client"""
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data={"first_name": first_name, "last_name": last_name, "dob": dob}
        )
        if success and 'id' in response:
            self.client_id = response['id']
            print(f"   ✓ Client created with ID: {self.client_id}")
            return True
        return False

    def test_get_clients(self):
        """Test get all clients"""
        success, response = self.run_test(
            "Get All Clients",
            "GET",
            "clients",
            200
        )
        if success:
            print(f"   ✓ Found {len(response.get('clients', []))} clients")
        return success

    def test_search_clients(self, search_term):
        """Test search clients"""
        success, response = self.run_test(
            "Search Clients",
            "GET",
            f"clients?search={search_term}",
            200
        )
        if success:
            print(f"   ✓ Search returned {len(response.get('clients', []))} results")
        return success

    def test_get_client(self, client_id):
        """Test get single client"""
        success, response = self.run_test(
            "Get Single Client",
            "GET",
            f"clients/{client_id}",
            200
        )
        if success:
            print(f"   ✓ Client: {response.get('first_name')} {response.get('last_name')}")
        return success

    def test_update_client(self, client_id, first_name):
        """Test update client"""
        success, response = self.run_test(
            "Update Client",
            "PUT",
            f"clients/{client_id}",
            200,
            data={"first_name": first_name}
        )
        if success:
            print(f"   ✓ Client updated: {response.get('first_name')}")
        return success

    def test_create_visit(self, client_id, date, topic, notes):
        """Test create visit"""
        success, response = self.run_test(
            "Create Visit",
            "POST",
            f"clients/{client_id}/visits",
            200,
            data={"date": date, "topic": topic, "notes": notes}
        )
        if success and 'id' in response:
            self.visit_id = response['id']
            print(f"   ✓ Visit created with ID: {self.visit_id}")
            return True
        return False

    def test_get_visits(self, client_id):
        """Test get client visits"""
        success, response = self.run_test(
            "Get Client Visits",
            "GET",
            f"clients/{client_id}/visits",
            200
        )
        if success:
            print(f"   ✓ Found {len(response.get('visits', []))} visits")
        return success

    def test_filter_visits_by_date(self, client_id, date_from, date_to):
        """Test filter visits by date"""
        success, response = self.run_test(
            "Filter Visits by Date",
            "GET",
            f"clients/{client_id}/visits?date_from={date_from}&date_to={date_to}",
            200
        )
        if success:
            print(f"   ✓ Filtered visits: {len(response.get('visits', []))}")
        return success

    def test_filter_visits_by_topic(self, client_id, topic):
        """Test filter visits by topic"""
        success, response = self.run_test(
            "Filter Visits by Topic",
            "GET",
            f"clients/{client_id}/visits?topic={topic}",
            200
        )
        if success:
            print(f"   ✓ Filtered visits: {len(response.get('visits', []))}")
        return success

    def test_update_visit(self, visit_id, topic):
        """Test update visit"""
        success, response = self.run_test(
            "Update Visit",
            "PUT",
            f"visits/{visit_id}",
            200,
            data={"topic": topic}
        )
        if success:
            print(f"   ✓ Visit updated: {response.get('topic')}")
        return success

    def test_stats_overview(self):
        """Test stats overview"""
        success, response = self.run_test(
            "Get Stats Overview",
            "GET",
            "stats/overview",
            200
        )
        if success:
            print(f"   ✓ Total clients: {response.get('total_clients')}")
            print(f"   ✓ Visits YTD: {response.get('visits_ytd')}")
            print(f"   ✓ Visits last 30 days: {response.get('visits_last_30')}")
        return success

    def test_financial_stats_detailed(self):
        """Test financial statistics in detail - focusing on retreat expenses"""
        success, response = self.run_test(
            "Get Financial Stats (Detailed)",
            "GET",
            "stats/overview",
            200
        )
        
        if not success:
            return False
            
        # Check if financial object exists
        financial = response.get('financial')
        if not financial:
            self.log_test("Financial Stats - Structure", False, "Missing 'financial' object in response")
            return False
        
        print(f"   ✓ Financial object found")
        
        # Required fields for retreat expenses functionality
        required_fields = [
            'retreat_expenses_ytd',
            'retreat_profit_ytd', 
            'revenue_ytd',
            'tips_ytd'
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in financial:
                missing_fields.append(field)
        
        if missing_fields:
            self.log_test("Financial Stats - Required Fields", False, f"Missing fields: {missing_fields}")
            return False
        
        print(f"   ✓ All required fields present: {required_fields}")
        
        # Validate field types and values
        retreat_expenses = financial.get('retreat_expenses_ytd')
        retreat_profit = financial.get('retreat_profit_ytd')
        revenue_ytd = financial.get('revenue_ytd')
        tips_ytd = financial.get('tips_ytd')
        
        # Check if retreat_expenses_ytd is a number >= 0
        if not isinstance(retreat_expenses, (int, float)) or retreat_expenses < 0:
            self.log_test("Financial Stats - Retreat Expenses Type", False, f"retreat_expenses_ytd should be number >= 0, got: {retreat_expenses}")
            return False
        
        print(f"   ✓ retreat_expenses_ytd: {retreat_expenses} (valid)")
        
        # Check if retreat_profit_ytd is a number (can be negative)
        if not isinstance(retreat_profit, (int, float)):
            self.log_test("Financial Stats - Retreat Profit Type", False, f"retreat_profit_ytd should be number, got: {retreat_profit}")
            return False
        
        print(f"   ✓ retreat_profit_ytd: {retreat_profit} (valid)")
        
        # Check if revenue_ytd is a number >= 0
        if not isinstance(revenue_ytd, (int, float)) or revenue_ytd < 0:
            self.log_test("Financial Stats - Revenue Type", False, f"revenue_ytd should be number >= 0, got: {revenue_ytd}")
            return False
        
        print(f"   ✓ revenue_ytd: {revenue_ytd} (valid)")
        
        # Check if tips_ytd is a number >= 0
        if not isinstance(tips_ytd, (int, float)) or tips_ytd < 0:
            self.log_test("Financial Stats - Tips Type", False, f"tips_ytd should be number >= 0, got: {tips_ytd}")
            return False
        
        print(f"   ✓ tips_ytd: {tips_ytd} (valid)")
        
        # Additional validation: Check if retreat_profit calculation makes sense
        retreat_revenue = financial.get('retreat_revenue_ytd', 0)
        if isinstance(retreat_revenue, (int, float)):
            expected_profit = retreat_revenue - retreat_expenses
            if abs(retreat_profit - expected_profit) > 0.01:  # Allow small floating point differences
                self.log_test("Financial Stats - Profit Calculation", False, 
                            f"retreat_profit_ytd ({retreat_profit}) != retreat_revenue_ytd ({retreat_revenue}) - retreat_expenses_ytd ({retreat_expenses}) = {expected_profit}")
                return False
            print(f"   ✓ Profit calculation correct: {retreat_revenue} - {retreat_expenses} = {retreat_profit}")
        
        # Print all financial stats for verification
        print(f"   📊 Complete Financial Stats:")
        for key, value in financial.items():
            print(f"      {key}: {value}")
        
        self.log_test("Financial Stats - Complete Validation", True, "All financial statistics validated successfully")
        return True

    def test_yearly_summary(self, year):
        """Test yearly summary"""
        success, response = self.run_test(
            "Get Yearly Summary",
            "GET",
            f"stats/yearly-summary?year={year}",
            200
        )
        if success:
            print(f"   ✓ Active clients: {response.get('total_clients_active')}")
            print(f"   ✓ Total visits: {response.get('total_visits')}")
        return success

    def test_get_topics(self):
        """Test get all topics"""
        success, response = self.run_test(
            "Get All Topics",
            "GET",
            "topics",
            200
        )
        if success:
            print(f"   ✓ Found {len(response.get('topics', []))} topics")
        return success

    def test_delete_visit(self, visit_id):
        """Test delete visit"""
        success, response = self.run_test(
            "Delete Visit",
            "DELETE",
            f"visits/{visit_id}",
            200
        )
        return success

    def test_delete_client(self, client_id):
        """Test delete client"""
        success, response = self.run_test(
            "Delete Client",
            "DELETE",
            f"clients/{client_id}",
            200
        )
        return success

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print(f"📊 TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        print("="*60)

def main():
    print("="*60)
    print("🏥 KinesioCRM Backend API Testing")
    print("="*60)
    
    tester = KinesioCRMTester()
    test_email = f"admin_{datetime.now().strftime('%Y%m%d_%H%M%S')}@test.com"
    test_password = "password123"
    
    # Test 1: Health Check
    print("\n📍 PHASE 1: Health Check")
    print("-" * 60)
    tester.test_health_check()
    
    # Test 2: Authentication
    print("\n📍 PHASE 2: Authentication")
    print("-" * 60)
    if not tester.test_register(test_email, test_password):
        print("\n❌ Registration failed. Trying login with existing credentials...")
        if not tester.test_login("admin@test.com", "password123"):
            print("\n❌ CRITICAL: Cannot authenticate. Stopping tests.")
            tester.print_summary()
            return 1
    
    tester.test_get_me()
    
    # Test 3: Client Management
    print("\n📍 PHASE 3: Client Management")
    print("-" * 60)
    tester.test_create_client("John", "Doe", "1985-05-15")
    tester.test_get_clients()
    
    if tester.client_id:
        tester.test_get_client(tester.client_id)
        tester.test_update_client(tester.client_id, "Jonathan")
        tester.test_search_clients("Jonathan")
    
    # Test 4: Visit Management
    print("\n📍 PHASE 4: Visit Management")
    print("-" * 60)
    if tester.client_id:
        tester.test_create_visit(tester.client_id, "2024-01-15", "Stress Management", "Initial consultation")
        tester.test_create_visit(tester.client_id, "2024-02-20", "Sleep Issues", "Follow-up session")
        tester.test_get_visits(tester.client_id)
        tester.test_filter_visits_by_date(tester.client_id, "2024-01-01", "2024-01-31")
        tester.test_filter_visits_by_topic(tester.client_id, "Stress")
        
        if tester.visit_id:
            tester.test_update_visit(tester.visit_id, "Stress and Anxiety")
    
    # Test 5: Statistics
    print("\n📍 PHASE 5: Statistics")
    print("-" * 60)
    tester.test_stats_overview()
    
    # Test 5.1: Detailed Financial Statistics (Focus on retreat expenses)
    print("\n📍 PHASE 5.1: Financial Statistics (Retreat Expenses Focus)")
    print("-" * 60)
    tester.test_financial_stats_detailed()
    
    tester.test_yearly_summary(2024)
    tester.test_get_topics()
    
    # Test 6: Cleanup (Delete operations)
    print("\n📍 PHASE 6: Cleanup")
    print("-" * 60)
    if tester.visit_id:
        tester.test_delete_visit(tester.visit_id)
    if tester.client_id:
        tester.test_delete_client(tester.client_id)
    
    # Print summary
    tester.print_summary()
    
    # Return exit code
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
