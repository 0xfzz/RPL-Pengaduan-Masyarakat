
from selenium.webdriver.common.by import By

class AuthLocators:
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[@type='submit']")
    REGISTER_LINK = (By.LINK_TEXT, "Daftar di sini")
    ERROR_MESSAGE = (By.CLASS_NAME, "text-red-500")
    ERROR_ALERT = (By.XPATH, "//div[contains(@class, 'border-red-200')]")

class RegisterLocators:
    FULL_NAME_INPUT = (By.ID, "fullName")
    NIK_INPUT = (By.ID, "nik")
    EMAIL_INPUT = (By.ID, "email")
    PHONE_INPUT = (By.ID, "phone")
    ADDRESS_INPUT = (By.ID, "address")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirmPassword")
    REGISTER_BUTTON = (By.XPATH, "//button[@type='submit']")

class NavbarLocators:
    USER_DROPDOWN = (By.XPATH, "//button[contains(@class, 'relative')]")
    LOGOUT_BUTTON = (By.XPATH, "//div[contains(@class, 'cursor-pointer') and contains(@class, 'text-red-600')]")
    LOGOUT_SPAN = (By.XPATH, "//span[contains(text(),'Logout')]")
    SETTINGS_LINK = (By.XPATH, "//span[contains(text(),'Pengaturan')]")
    DROPDOWN_MENU = (By.XPATH, "//div[contains(@class, 'w-56')]")

class DashboardLocators:
    DASHBOARD_TITLE = (By.XPATH, "//h1[contains(text(), 'Halo')]")
    GREETING_CARD = (By.XPATH, "//div[contains(@class, 'bg-gradient-to-r')]")
    
class SidebarLocators:
    DASHBOARD_LINK = (By.LINK_TEXT, "Dashboard")
    LIST_ADUAN_LINK = (By.XPATH, "//a[contains(@href, '/dashboard/list-aduan')]")
    PENGADUAN_SAYA_LINK = (By.LINK_TEXT, "Pengaduan Saya")
    LIST_PENGADUAN_LINK = (By.LINK_TEXT, "List Pengaduan")
    MANAJEMEN_USER_LINK = (By.LINK_TEXT, "Manajemen User")

class SettingsLocators:
    SETTINGS_TITLE = (By.XPATH, "//h1[contains(text(), 'Pengaturan Akun')]")
    PROFILE_TAB = (By.XPATH, "//button[contains(text(), 'Profil')]")
    PASSWORD_TAB = (By.XPATH, "//button[contains(text(), 'Password')]")
    SAVE_BUTTON = (By.XPATH, "//button[contains(text(), 'Simpan')]")
    
class ListUserLocators:
    USER_TABLE = (By.XPATH, "//table")
    ADD_USER_BUTTON = (By.XPATH, "//button[contains(text(), 'Tambah User')]")
    
class ListAduanLocators:
    ADUAN_TABLE = (By.XPATH, "//table")
    ADD_ADUAN_BUTTON = (By.XPATH, "//button[contains(text(), 'Tambah Aduan')]")
