import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from locators import AuthLocators, DashboardLocators, NavbarLocators
import time
import os
from datetime import datetime

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

def take_screenshot(driver, description):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
    filename = f"{description.replace(' ', '_').lower()}_{timestamp}.png"
    os.makedirs("screenshots", exist_ok=True)
    filepath = os.path.join("screenshots", filename)
    driver.save_screenshot(filepath)
    return filepath

class TestLogoutFix:
    base_url = "https://rpl.0xfzz.xyz"
    
    users = {
        'admin': {'email': 'admin@rpl.0xfzz.xyz', 'password': '12345678'},
        'petugas': {'email': 'petugas@rpl.0xfzz.xyz', 'password': '12345678'},
        'masyarakat': {'email': 'rakyat@rakyat.com', 'password': 'rakyat@rakyat.com'}
    }

    def test_logout_admin(self, driver):
        """Test admin logout functionality"""
        user = self.users['admin']
        
        # Login
        driver.get(f"{self.base_url}/auth/login")
        driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
        driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
        driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
        )
        take_screenshot(driver, "admin_logged_in")
        
        # Logout process
        dropdown_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.USER_DROPDOWN)
        )
        dropdown_button.click()
        take_screenshot(driver, "admin_dropdown_opened")
        
        # Wait for dropdown menu and click logout
        logout_span = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.LOGOUT_SPAN)
        )
        logout_span.click()
        
        # Verify redirect to login
        WebDriverWait(driver, 10).until(EC.url_contains("/auth/login"))
        take_screenshot(driver, "admin_logged_out")
        
        assert "/auth/login" in driver.current_url
        print("✅ Admin logout test passed!")

    def test_logout_petugas(self, driver):
        """Test petugas logout functionality"""
        user = self.users['petugas']
        
        # Login
        driver.get(f"{self.base_url}/auth/login")
        driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
        driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
        driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
        )
        take_screenshot(driver, "petugas_logged_in")
        
        # Logout process
        dropdown_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.USER_DROPDOWN)
        )
        dropdown_button.click()
        take_screenshot(driver, "petugas_dropdown_opened")
        
        # Wait for dropdown menu and click logout
        logout_span = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.LOGOUT_SPAN)
        )
        logout_span.click()
        
        # Verify redirect to login
        WebDriverWait(driver, 10).until(EC.url_contains("/auth/login"))
        take_screenshot(driver, "petugas_logged_out")
        
        assert "/auth/login" in driver.current_url
        print("✅ Petugas logout test passed!")

    def test_logout_masyarakat(self, driver):
        """Test masyarakat logout functionality"""
        user = self.users['masyarakat']
        
        # Login
        driver.get(f"{self.base_url}/auth/login")
        driver.find_element(*AuthLocators.EMAIL_INPUT).send_keys(user['email'])
        driver.find_element(*AuthLocators.PASSWORD_INPUT).send_keys(user['password'])
        driver.find_element(*AuthLocators.LOGIN_BUTTON).click()
        
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located(DashboardLocators.DASHBOARD_TITLE)
        )
        take_screenshot(driver, "masyarakat_logged_in")
        
        # Logout process
        dropdown_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.USER_DROPDOWN)
        )
        dropdown_button.click()
        take_screenshot(driver, "masyarakat_dropdown_opened")
        
        # Wait for dropdown menu and click logout
        logout_span = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable(NavbarLocators.LOGOUT_SPAN)
        )
        logout_span.click()
        
        # Verify redirect to login
        WebDriverWait(driver, 10).until(EC.url_contains("/auth/login"))
        take_screenshot(driver, "masyarakat_logged_out")
        
        assert "/auth/login" in driver.current_url
        print("✅ Masyarakat logout test passed!")
