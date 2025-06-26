import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from locators import (
    AuthLocators, RegisterLocators, NavbarLocators, DashboardLocators,
    SidebarLocators, SettingsLocators, ListUserLocators, ListAduanLocators
)
import time
import os
from datetime import datetime

class TestReportManager:
    def __init__(self):
        self.test_results = []
        self.screenshots_dir = "screenshots"
        self.reports_dir = "reports"
        self.current_test = None
        
        # Create directories
        os.makedirs(self.screenshots_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def start_test(self, test_name):
        self.current_test = {
            'name': test_name,
            'start_time': datetime.now(),
            'steps': [],
            'status': 'RUNNING'
        }
    
    def add_step(self, description, screenshot_path=None, status='PASS'):
        if self.current_test:
            self.current_test['steps'].append({
                'description': description,
                'screenshot': screenshot_path,
                'status': status,
                'timestamp': datetime.now()
            })
    
    def end_test(self, status='PASS'):
        if self.current_test:
            self.current_test['status'] = status
            self.current_test['end_time'] = datetime.now()
            self.current_test['duration'] = (self.current_test['end_time'] - self.current_test['start_time']).total_seconds()
            self.test_results.append(self.current_test)
            self.current_test = None
    
    def generate_html_report(self):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(self.reports_dir, f"test_report_{timestamp}.html")
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['status'] == 'PASS'])
        failed_tests = total_tests - passed_tests
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Automation Test Report - RPL Pengaduan Masyarakat</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background: #1e3a8a; color: white; padding: 20px; border-radius: 8px; }}
                .summary {{ background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 8px; }}
                .test-case {{ border: 1px solid #ddd; margin: 10px 0; border-radius: 8px; }}
                .test-header {{ padding: 15px; background: #f8f9fa; border-bottom: 1px solid #ddd; }}
                .test-steps {{ padding: 15px; }}
                .step {{ margin: 10px 0; padding: 10px; border-left: 3px solid #28a745; }}
                .step.fail {{ border-left-color: #dc3545; }}
                .pass {{ color: #28a745; font-weight: bold; }}
                .fail {{ color: #dc3545; font-weight: bold; }}
                .screenshot {{ max-width: 100%; margin: 10px 0; border: 1px solid #ddd; }}
                .stats {{ display: flex; gap: 20px; }}
                .stat-box {{ background: white; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔍 Blackbox Automation Test Report</h1>
                <p>RPL Pengaduan Masyarakat - Test Execution Report</p>
                <p>Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>
            
            <div class="summary">
                <h2>📊 Test Summary</h2>
                <div class="stats">
                    <div class="stat-box">
                        <h3>{total_tests}</h3>
                        <p>Total Tests</p>
                    </div>
                    <div class="stat-box">
                        <h3 class="pass">{passed_tests}</h3>
                        <p>Passed</p>
                    </div>
                    <div class="stat-box">
                        <h3 class="fail">{failed_tests}</h3>
                        <p>Failed</p>
                    </div>
                    <div class="stat-box">
                        <h3>{(passed_tests/total_tests*100):.1f}%</h3>
                        <p>Success Rate</p>
                    </div>
                </div>
            </div>
        """
        
        for test in self.test_results:
            status_class = "pass" if test['status'] == 'PASS' else "fail"
            html_content += f"""
            <div class="test-case">
                <div class="test-header">
                    <h3>{test['name']} - <span class="{status_class}">{test['status']}</span></h3>
                    <p>Duration: {test['duration']:.2f} seconds</p>
                </div>
                <div class="test-steps">
            """
            
            for step in test['steps']:
                step_class = "fail" if step['status'] == 'FAIL' else ""
                html_content += f"""
                <div class="step {step_class}">
                    <strong>{step['description']}</strong> - <span class="{step['status'].lower()}">{step['status']}</span>
                    <br><small>{step['timestamp'].strftime("%H:%M:%S")}</small>
                """
                if step['screenshot']:
                    html_content += f'<br><img src="../{step["screenshot"]}" class="screenshot" alt="Screenshot">'
                html_content += "</div>"
            
            html_content += "</div></div>"
        
        html_content += """
        </body>
        </html>
        """
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return report_path

@pytest.fixture
def driver():
    options = Options()

# Disable password saving prompts
    prefs = {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False
    }
    options.add_experimental_option("prefs", prefs)
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--window-size=1920,1080")
    # options.add_argument("--headless")  # Uncomment for headless mode
    
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.fixture
def report_manager():
    return TestReportManager()

def take_screenshot(driver, report_manager, description):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    filename = f"{description.replace(' ', '_').lower()}_{timestamp}.png"
    filepath = os.path.join(report_manager.screenshots_dir, filename)
    driver.save_screenshot(filepath)
    return filepath

class TestCompleteFlow:
    base_url = "https://rpl.0xfzz.xyz"
    
    # Test user credentials
    users = {
        'admin': {'email': 'admin@rpl.0xfzz.xyz', 'password': '12345678', 'role': 'admin'},
        'petugas': {'email': 'petugas@rpl.0xfzz.xyz', 'password': '12345678', 'role': 'petugas'},
        'masyarakat': {'email': 'rakyat@rakyat.com', 'password': 'rakyat@rakyat.com', 'role': 'masyarakat'}
    }

    def test_01_login_page_accessibility(self, driver, report_manager):
        """Test if login page is accessible and UI elements are present"""
        report_manager.start_test("Login Page Accessibility")
        
        try:
            driver.get(f"{self.base_url}/auth/login")
            screenshot_path = take_screenshot(driver, report_manager, "login_page_loaded")
            report_manager.add_step("Navigate to login page", screenshot_path)
            
            # Check if page title is correct
            assert "Login" in driver.title
            report_manager.add_step("Page title validation - PASS")
            
            # Check if all required elements are present
            driver.find_element(*AuthLocators.EMAIL_INPUT)
            driver.find_element(*AuthLocators.PASSWORD_INPUT)
            driver.find_element(*AuthLocators.LOGIN_BUTTON)
            driver.find_element(*AuthLocators.REGISTER_LINK)
            
            screenshot_path = take_screenshot(driver, report_manager, "login_form_elements")
            report_manager.add_step("All form elements present", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "login_page_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_02_login_admin(self, driver, report_manager):
        """Test admin login functionality"""
        report_manager.start_test("Admin Login Test")
        
        try:
            user = self.users['admin']
            driver.get(f"{self.base_url}/auth/login")
            
            screenshot_path = take_screenshot(driver, report_manager, "admin_login_start")
            report_manager.add_step("Navigate to login page", screenshot_path)
            
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            
            screenshot_path = take_screenshot(driver, report_manager, "admin_credentials_filled")
            report_manager.add_step("Admin credentials entered", screenshot_path)
            
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "admin_dashboard_loaded")
            report_manager.add_step("Admin dashboard loaded successfully", screenshot_path)
            
            assert "dashboard" in driver.current_url
            assert "Administrator" in driver.page_source
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "admin_login_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_03_admin_navigation(self, driver, report_manager):
        """Test admin navigation through different pages"""
        report_manager.start_test("Admin Navigation Test")
        
        try:
            # Login as admin first
            user = self.users['admin']
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "admin_logged_in")
            report_manager.add_step("Admin logged in successfully", screenshot_path)
            
            # Test Dashboard navigation
            driver.find_element(*SidebarLocators.DASHBOARD_LINK).click()
            assert "dashboard" in driver.current_url
            screenshot_path = take_screenshot(driver, report_manager, "admin_dashboard_nav")
            report_manager.add_step("Dashboard navigation - PASS", screenshot_path)
            
            # Test List Pengaduan navigation
            driver.find_element(*SidebarLocators.LIST_PENGADUAN_LINK).click()
            WebDriverWait(driver, 10).until(EC.url_contains("/dashboard/list-aduan"))
            screenshot_path = take_screenshot(driver, report_manager, "admin_list_aduan")
            report_manager.add_step("List Pengaduan navigation - PASS", screenshot_path)
            
            # Test Manajemen User navigation (admin only)
            driver.find_element(*SidebarLocators.MANAJEMEN_USER_LINK).click()
            WebDriverWait(driver, 10).until(EC.url_contains("/dashboard/list-user"))
            screenshot_path = take_screenshot(driver, report_manager, "admin_manajemen_user")
            report_manager.add_step("Manajemen User navigation - PASS", screenshot_path)
            
            # Test Settings navigation
            dropdown_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(NavbarLocators.USER_DROPDOWN)
            )
            dropdown_button.click()
            time.sleep(1)
            
            settings_link = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable(NavbarLocators.SETTINGS_LINK)
            )
            settings_link.click()
            WebDriverWait(driver, 10).until(EC.url_contains("/dashboard/settings"))
            screenshot_path = take_screenshot(driver, report_manager, "admin_settings")
            report_manager.add_step("Settings navigation - PASS", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "admin_navigation_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_04_login_petugas(self, driver, report_manager):
        """Test petugas login functionality"""
        report_manager.start_test("Petugas Login Test")
        
        try:
            user = self.users['petugas']
            driver.get(f"{self.base_url}/auth/login")
            
            screenshot_path = take_screenshot(driver, report_manager, "petugas_login_start")
            report_manager.add_step("Navigate to login page", screenshot_path)
            
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            
            screenshot_path = take_screenshot(driver, report_manager, "petugas_credentials_filled")
            report_manager.add_step("Petugas credentials entered", screenshot_path)
            
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "petugas_dashboard_loaded")
            report_manager.add_step("Petugas dashboard loaded successfully", screenshot_path)
            
            assert "dashboard" in driver.current_url
            assert "Petugas" in driver.page_source
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "petugas_login_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_05_petugas_navigation(self, driver, report_manager):
        """Test petugas navigation (should not see user management)"""
        report_manager.start_test("Petugas Navigation Test")
        
        try:
            # Login as petugas first
            user = self.users['petugas']
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "petugas_logged_in")
            report_manager.add_step("Petugas logged in successfully", screenshot_path)
            
            # Test Dashboard navigation
            driver.find_element(*SidebarLocators.DASHBOARD_LINK).click()
            assert "dashboard" in driver.current_url
            screenshot_path = take_screenshot(driver, report_manager, "petugas_dashboard_nav")
            report_manager.add_step("Dashboard navigation - PASS", screenshot_path)
            
            # Test List Pengaduan navigation
            driver.find_element(*SidebarLocators.LIST_PENGADUAN_LINK).click()
            WebDriverWait(driver, 10).until(EC.url_contains("/dashboard/list-aduan"))
            screenshot_path = take_screenshot(driver, report_manager, "petugas_list_aduan")
            report_manager.add_step("List Pengaduan navigation - PASS", screenshot_path)
            
            # Verify Manajemen User is NOT visible for petugas
            try:
                driver.find_element(*SidebarLocators.MANAJEMEN_USER_LINK)
                report_manager.add_step("ERROR: Manajemen User should not be visible to petugas", None, "FAIL")
                report_manager.end_test("FAIL")
            except:
                screenshot_path = take_screenshot(driver, report_manager, "petugas_no_user_management")
                report_manager.add_step("Manajemen User correctly hidden from petugas", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "petugas_navigation_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_06_login_masyarakat(self, driver, report_manager):
        """Test masyarakat login functionality"""
        report_manager.start_test("Masyarakat Login Test")
        
        try:
            user = self.users['masyarakat']
            driver.get(f"{self.base_url}/auth/login")
            
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_login_start")
            report_manager.add_step("Navigate to login page", screenshot_path)
            
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_credentials_filled")
            report_manager.add_step("Masyarakat credentials entered", screenshot_path)
            
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_dashboard_loaded")
            report_manager.add_step("Masyarakat dashboard loaded successfully", screenshot_path)
            
            assert "dashboard" in driver.current_url
            assert "Portal Pengaduan Masyarakat" in driver.page_source
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_login_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_07_masyarakat_navigation(self, driver, report_manager):
        """Test masyarakat navigation (limited access)"""
        report_manager.start_test("Masyarakat Navigation Test")
        
        try:
            # Login as masyarakat first
            user = self.users['masyarakat']
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
            )
            
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_logged_in")
            report_manager.add_step("Masyarakat logged in successfully", screenshot_path)
            
            # Test Dashboard navigation
            driver.find_element(*SidebarLocators.DASHBOARD_LINK).click()
            assert "dashboard" in driver.current_url
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_dashboard_nav")
            report_manager.add_step("Dashboard navigation - PASS", screenshot_path)
            
            # Test Pengaduan Saya navigation
            driver.find_element(*SidebarLocators.PENGADUAN_SAYA_LINK).click()
            WebDriverWait(driver, 10).until(EC.url_contains("/dashboard/list-aduan"))
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_pengaduan_saya")
            report_manager.add_step("Pengaduan Saya navigation - PASS", screenshot_path)
            
            # Verify Manajemen User is NOT visible for masyarakat
            try:
                driver.find_element(*SidebarLocators.MANAJEMEN_USER_LINK)
                report_manager.add_step("ERROR: Manajemen User should not be visible to masyarakat", None, "FAIL")
                report_manager.end_test("FAIL")
            except:
                screenshot_path = take_screenshot(driver, report_manager, "masyarakat_no_user_management")
                report_manager.add_step("Manajemen User correctly hidden from masyarakat", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "masyarakat_navigation_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_08_invalid_login_attempts(self, driver, report_manager):
        """Test various invalid login scenarios"""
        report_manager.start_test("Invalid Login Attempts Test")
        
        try:
            # Test 1: Invalid email format
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys("invalid-email")
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys("password")
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            screenshot_path = take_screenshot(driver, report_manager, "invalid_email_format")
            report_manager.add_step("Invalid email format test", screenshot_path)
            
            # Test 2: Non-existent user
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).clear()
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys("nonexistent@example.com")
            driver.find_element(*AuthLocators.PASSWORD_INPUT).clear()
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys("password")
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located(AuthLocators.ERROR_ALERT)
            )
            screenshot_path = take_screenshot(driver, report_manager, "nonexistent_user")
            report_manager.add_step("Non-existent user error displayed", screenshot_path)
            
            # Test 3: Wrong password
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.EMAIL_INPUT).clear()
            driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys("admin@rpl.0xfzz.xyz")
            driver.find_element(*AuthLocators.PASSWORD_INPUT).clear()
            driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys("wrongpassword")
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located(AuthLocators.ERROR_ALERT)
            )
            screenshot_path = take_screenshot(driver, report_manager, "wrong_password")
            report_manager.add_step("Wrong password error displayed", screenshot_path)
            
            # Test 4: Empty fields
            driver.get(f"{self.base_url}/auth/login")
            driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
            
            error_messages = driver.find_elements(*AuthLocators.ERROR_MESSAGE)
            assert len(error_messages) >= 1
            screenshot_path = take_screenshot(driver, report_manager, "empty_fields")
            report_manager.add_step("Empty fields validation working", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "invalid_login_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_09_logout_functionality(self, driver, report_manager):
        """Test logout functionality for all user types"""
        report_manager.start_test("Logout Functionality Test")
        
        try:
            for role, user in self.users.items():
                # Login
                driver.get(f"{self.base_url}/auth/login")
                driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
                driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
                driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
                
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
                )
                
                screenshot_path = take_screenshot(driver, report_manager, f"{role}_logged_in_for_logout")
                report_manager.add_step(f"{role.capitalize()} logged in", screenshot_path)
                
                # Logout - Click on user dropdown
                dropdown_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable(NavbarLocators.USER_DROPDOWN)
                )
                dropdown_button.click()
                
                screenshot_path = take_screenshot(driver, report_manager, f"{role}_dropdown_opened")
                report_manager.add_step(f"{role.capitalize()} dropdown opened", screenshot_path)
                
                # Wait for dropdown menu to appear and click logout
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located(NavbarLocators.DROPDOWN_MENU)
                )
                
                # Click on the logout option using the span text
                logout_span = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable(NavbarLocators.LOGOUT_SPAN)
                )
                logout_span.click()
                
                # Wait for redirect to login page
                WebDriverWait(driver, 10).until(EC.url_contains("/auth/login"))
                
                screenshot_path = take_screenshot(driver, report_manager, f"{role}_logged_out")
                report_manager.add_step(f"{role.capitalize()} logged out successfully", screenshot_path)
                
                assert "/auth/login" in driver.current_url
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "logout_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_10_registration_page(self, driver, report_manager):
        """Test registration page functionality"""
        report_manager.start_test("Registration Page Test")
        
        try:
            driver.get(f"{self.base_url}/auth/register")
            
            screenshot_path = take_screenshot(driver, report_manager, "registration_page_loaded")
            report_manager.add_step("Registration page loaded", screenshot_path)
            
            # Check if all required elements are present
            driver.find_element(*RegisterLocators.FULL_NAME_INPUT)
            driver.find_element(*RegisterLocators.NIK_INPUT)
            driver.find_element(*RegisterLocators.EMAIL_INPUT)
            driver.find_element(*RegisterLocators.PHONE_INPUT)
            driver.find_element(*RegisterLocators.ADDRESS_INPUT)
            driver.find_element(*RegisterLocators.PASSWORD_INPUT)
            driver.find_element(*RegisterLocators.CONFIRM_PASSWORD_INPUT)
            driver.find_element(*RegisterLocators.REGISTER_BUTTON)
            
            screenshot_path = take_screenshot(driver, report_manager, "registration_form_elements")
            report_manager.add_step("All registration form elements present", screenshot_path)
            
            # Test form validation with invalid data
            driver.find_element(*RegisterLocators.FULL_NAME_INPUT).send_keys("Test User")
            driver.find_element(*RegisterLocators.NIK_INPUT).send_keys("123")  # Invalid NIK (too short)
            driver.find_element(*RegisterLocators.EMAIL_INPUT).send_keys("admin@rpl.0xfzz.xyz")  # Existing email
            driver.find_element(*RegisterLocators.PHONE_INPUT).send_keys("123")  # Invalid phone
            driver.find_element(*RegisterLocators.ADDRESS_INPUT).send_keys("Test Address")
            driver.find_element(*RegisterLocators.PASSWORD_INPUT).send_keys("pass")  # Too short
            driver.find_element(*RegisterLocators.CONFIRM_PASSWORD_INPUT).send_keys("different")  # Mismatched
            
            screenshot_path = take_screenshot(driver, report_manager, "registration_invalid_data")
            report_manager.add_step("Invalid registration data entered", screenshot_path)
            
            driver.find_element(*RegisterLocators.REGISTER_BUTTON).click()
            
            # Should show validation errors
            time.sleep(2)
            screenshot_path = take_screenshot(driver, report_manager, "registration_validation_errors")
            report_manager.add_step("Registration validation errors displayed", screenshot_path)
            
            report_manager.end_test("PASS")
            
        except Exception as e:
            screenshot_path = take_screenshot(driver, report_manager, "registration_error")
            report_manager.add_step(f"Error: {str(e)}", screenshot_path, "FAIL")
            report_manager.end_test("FAIL")
            raise

    def test_99_generate_report(self, report_manager):
        """Generate final HTML report"""
        report_path = report_manager.generate_html_report()
        print(f"\n🎉 Test Report Generated: {report_path}")
        print(f"📁 Screenshots Directory: {report_manager.screenshots_dir}")
        print(f"📊 Total Tests: {len(report_manager.test_results)}")
        print(f"✅ Passed: {len([t for t in report_manager.test_results if t['status'] == 'PASS'])}")
        print(f"❌ Failed: {len([t for t in report_manager.test_results if t['status'] == 'FAIL'])}")
