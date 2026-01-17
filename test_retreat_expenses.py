#!/usr/bin/env python3
"""
Test script specifically for retreat expenses functionality
Creates test data with retreats and expenses to verify financial calculations
"""

import requests
import json
from datetime import datetime, timedelta

class RetreatExpenseTester:
    def __init__(self, base_url="https://budget-balancer.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.client_ids = []
        self.retreat_id = None

    def authenticate(self):
        """Get authentication token"""
        # Try the most recent user from previous test
        try:
            response = requests.post(f"{self.base_url}/auth/login", 
                                   json={"email": "admin_20260117_070035@test.com", "password": "password123"})
            if response.status_code == 200:
                self.token = response.json()['access_token']
                print("✅ Authenticated with existing user from previous test")
                return True
        except Exception as e:
            print(f"Login with recent user failed: {e}")
        
        # Try existing admin credentials
        try:
            response = requests.post(f"{self.base_url}/auth/login", 
                                   json={"email": "admin@test.com", "password": "password123"})
            if response.status_code == 200:
                self.token = response.json()['access_token']
                print("✅ Authenticated with existing admin credentials")
                return True
        except Exception as e:
            print(f"Login with admin failed: {e}")
        
        print("❌ Failed to authenticate")
        return False

    def create_test_clients(self):
        """Create test clients for retreat"""
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        clients = [
            {"first_name": "Анна", "last_name": "Петрова", "dob": "1990-03-15"},
            {"first_name": "Михаил", "last_name": "Сидоров", "dob": "1985-07-22"},
            {"first_name": "Елена", "last_name": "Козлова", "dob": "1992-11-08"}
        ]
        
        for client_data in clients:
            response = requests.post(f"{self.base_url}/clients", json=client_data, headers=headers)
            if response.status_code == 200:
                client_id = response.json()['id']
                self.client_ids.append(client_id)
                print(f"✅ Created client: {client_data['first_name']} {client_data['last_name']} (ID: {client_id})")
            else:
                print(f"❌ Failed to create client: {client_data['first_name']} {client_data['last_name']}")
        
        return len(self.client_ids) > 0

    def create_retreat_with_expenses(self):
        """Create a retreat with participants and expenses"""
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        # Create retreat
        current_year = datetime.now().year
        retreat_data = {
            "name": "Дыхательный ретрит в горах",
            "start_date": f"{current_year}-06-15",
            "end_date": f"{current_year}-06-17"
        }
        
        response = requests.post(f"{self.base_url}/retreats", json=retreat_data, headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to create retreat: {response.text}")
            return False
        
        self.retreat_id = response.json()['id']
        print(f"✅ Created retreat: {retreat_data['name']} (ID: {self.retreat_id})")
        
        # Add participants with payments
        participant_payments = [35000, 30000, 25000]  # Different payment amounts
        
        for i, client_id in enumerate(self.client_ids):
            participant_data = {
                "client_id": client_id,
                "payment": participant_payments[i] if i < len(participant_payments) else 30000,
                "payment_status": "paid"
            }
            
            response = requests.post(f"{self.base_url}/retreats/{self.retreat_id}/participants", 
                                   json=participant_data, headers=headers)
            if response.status_code == 200:
                print(f"✅ Added participant {client_id} with payment {participant_data['payment']}")
            else:
                print(f"❌ Failed to add participant {client_id}: {response.text}")
        
        # Add expenses
        expenses = [
            {"name": "Аренда помещения", "amount": 15000},
            {"name": "Питание участников", "amount": 8000},
            {"name": "Транспорт", "amount": 5000},
            {"name": "Материалы и оборудование", "amount": 3000}
        ]
        
        total_expenses = 0
        for expense in expenses:
            response = requests.post(f"{self.base_url}/retreats/{self.retreat_id}/expenses", 
                                   json=expense, headers=headers)
            if response.status_code == 200:
                total_expenses += expense['amount']
                print(f"✅ Added expense: {expense['name']} - {expense['amount']} руб.")
            else:
                print(f"❌ Failed to add expense {expense['name']}: {response.text}")
        
        print(f"📊 Total retreat expenses: {total_expenses} руб.")
        print(f"📊 Total retreat revenue: {sum(participant_payments)} руб.")
        print(f"📊 Expected retreat profit: {sum(participant_payments) - total_expenses} руб.")
        
        return True

    def test_financial_stats_with_data(self):
        """Test financial statistics with actual retreat data"""
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        response = requests.get(f"{self.base_url}/stats/overview", headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to get stats: {response.text}")
            return False
        
        data = response.json()
        financial = data.get('financial', {})
        
        print("\n📊 FINANCIAL STATISTICS WITH RETREAT DATA:")
        print("=" * 60)
        
        # Key metrics
        retreat_revenue = financial.get('retreat_revenue_ytd', 0)
        retreat_expenses = financial.get('retreat_expenses_ytd', 0)
        retreat_profit = financial.get('retreat_profit_ytd', 0)
        total_revenue = financial.get('revenue_ytd', 0)
        
        print(f"Retreat Revenue YTD: {retreat_revenue:,} руб.")
        print(f"Retreat Expenses YTD: {retreat_expenses:,} руб.")
        print(f"Retreat Profit YTD: {retreat_profit:,} руб.")
        print(f"Total Revenue YTD: {total_revenue:,} руб.")
        
        # Validation
        expected_profit = retreat_revenue - retreat_expenses
        if abs(retreat_profit - expected_profit) < 0.01:
            print(f"✅ Profit calculation correct: {retreat_revenue} - {retreat_expenses} = {retreat_profit}")
        else:
            print(f"❌ Profit calculation error: Expected {expected_profit}, got {retreat_profit}")
            return False
        
        # Check that expenses are > 0 (we added expenses)
        if retreat_expenses > 0:
            print(f"✅ Retreat expenses properly recorded: {retreat_expenses}")
        else:
            print(f"❌ Retreat expenses not recorded properly: {retreat_expenses}")
            return False
        
        # Check that revenue is > 0 (we added participants with payments)
        if retreat_revenue > 0:
            print(f"✅ Retreat revenue properly recorded: {retreat_revenue}")
        else:
            print(f"❌ Retreat revenue not recorded properly: {retreat_revenue}")
            return False
        
        print("\n📋 Complete Financial Data:")
        for key, value in financial.items():
            print(f"  {key}: {value}")
        
        return True

    def cleanup(self):
        """Clean up test data"""
        headers = {'Authorization': f'Bearer {self.token}', 'Content-Type': 'application/json'}
        
        # Delete retreat (this will also delete associated visits)
        if self.retreat_id:
            response = requests.delete(f"{self.base_url}/retreats/{self.retreat_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ Deleted retreat {self.retreat_id}")
            else:
                print(f"❌ Failed to delete retreat {self.retreat_id}")
        
        # Delete clients
        for client_id in self.client_ids:
            response = requests.delete(f"{self.base_url}/clients/{client_id}", headers=headers)
            if response.status_code == 200:
                print(f"✅ Deleted client {client_id}")
            else:
                print(f"❌ Failed to delete client {client_id}")

def main():
    print("🏔️ RETREAT EXPENSES TESTING")
    print("=" * 60)
    
    tester = RetreatExpenseTester()
    
    # Step 1: Authenticate
    if not tester.authenticate():
        return 1
    
    # Step 2: Create test clients
    print("\n📍 Creating test clients...")
    if not tester.create_test_clients():
        return 1
    
    # Step 3: Create retreat with expenses
    print("\n📍 Creating retreat with participants and expenses...")
    if not tester.create_retreat_with_expenses():
        return 1
    
    # Step 4: Test financial statistics
    print("\n📍 Testing financial statistics...")
    success = tester.test_financial_stats_with_data()
    
    # Step 5: Cleanup
    print("\n📍 Cleaning up test data...")
    tester.cleanup()
    
    if success:
        print("\n✅ ALL RETREAT EXPENSE TESTS PASSED!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED!")
        return 1

if __name__ == "__main__":
    exit(main())