# RPL Pengaduan Masyarakat - Automation Test Suite

## 🔍 Blackbox Automation Testing

This automation test suite provides comprehensive blackbox testing for the RPL Pengaduan Masyarakat web application using Selenium WebDriver and pytest.

## 📋 Test Coverage

### Authentication Tests
- ✅ Login page accessibility
- ✅ Admin login functionality
- ✅ Petugas login functionality
- ✅ Masyarakat login functionality
- ✅ Invalid login attempts (various scenarios)
- ✅ Logout functionality for all user types

### Navigation Tests
- ✅ Admin navigation (full access)
- ✅ Petugas navigation (limited access)
- ✅ Masyarakat navigation (restricted access)
- ✅ Role-based access control verification

### UI/UX Tests
- ✅ Registration page functionality
- ✅ Form validation testing
- ✅ Error message display
- ✅ Page loading verification

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download ChromeDriver**
   - Download ChromeDriver from https://chromedriver.chromium.org/
   - Add ChromeDriver to your system PATH

3. **Run Tests**
   ```bash
   # Run all tests
   pytest test_complete_flow.py -v

   # Run with HTML report
   pytest test_complete_flow.py --html=reports/pytest_report.html --self-contained-html

   # Run specific test
   pytest test_complete_flow.py::TestCompleteFlow::test_01_login_page_accessibility -v
   ```

## 👥 Test Users

The following user accounts are used for testing:

| No | Email | Password | Role |
|----|-------|----------|------|
| 1 | admin@rpl.0xfzz.xyz | 12345678 | Admin |
| 2 | petugas@rpl.0xfzz.xyz | 12345678 | Petugas |
| 3 | rakyat@rakyat.com | rakyat@rakyat.com | Masyarakat |

## 📊 Test Reports

After running tests, you'll find:

1. **Custom HTML Report**: `reports/test_report_TIMESTAMP.html`
   - Detailed test execution report
   - Screenshots for each test step
   - Test summary and statistics
   - Pass/fail status for each test

2. **Screenshots**: `screenshots/`
   - Individual screenshots for each test step
   - Organized by test name and timestamp
   - Evidence of test execution

3. **pytest HTML Report**: `reports/pytest_report.html` (if using --html option)

## 🎯 Test Scenarios

### 1. Login Page Accessibility
- Verifies login page loads correctly
- Checks all form elements are present
- Validates page title

### 2. Role-based Login Tests
- **Admin**: Full system access verification
- **Petugas**: Officer-level access verification
- **Masyarakat**: Citizen-level access verification

### 3. Navigation Tests
- **Admin**: Can access all pages including user management
- **Petugas**: Can access reports but not user management
- **Masyarakat**: Limited access to personal complaints only

### 4. Security Tests
- Invalid email format handling
- Non-existent user error handling
- Wrong password error handling
- Empty field validation

### 5. Logout Tests
- Successful logout for all user types
- Proper redirection to login page
- Session cleanup verification

### 6. Registration Tests
- Registration form accessibility
- Form validation testing
- Error message display

## 🔧 Configuration

### Browser Settings
- **Default**: Chrome browser with GUI
- **Headless Mode**: Uncomment `options.add_argument("--headless")` in conftest
- **Window Size**: 1920x1080 for consistent screenshots

### Base URL
- **Production**: https://rpl.0xfzz.xyz
- Change `base_url` in test files if testing different environment

## 📝 Test Structure

```
automation/
├── locators.py              # UI element locators
├── test_complete_flow.py    # Main test suite
├── requirements.txt         # Python dependencies
├── screenshots/            # Test evidence screenshots
├── reports/               # Test execution reports
└── README.md             # This documentation
```

## 🐛 Troubleshooting

### Common Issues

1. **ChromeDriver not found**
   - Ensure ChromeDriver is in system PATH
   - Match ChromeDriver version with Chrome browser

2. **Element not found errors**
   - Check if page loaded completely
   - Verify element locators are correct
   - Increase wait times if needed

3. **Network timeouts**
   - Check internet connection
   - Verify base URL is accessible
   - Increase implicit wait times

### Debug Mode
To run tests with more verbose output:
```bash
pytest test_complete_flow.py -v -s --tb=short
```

## 📈 Continuous Integration

This test suite can be integrated with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Automation Tests
  run: |
    pip install -r automation/requirements.txt
    pytest automation/test_complete_flow.py --html=test-report.html
```

## 🤝 Contributing

1. Add new test methods following the naming convention `test_XX_description`
2. Use the report manager for screenshot capture
3. Update locators.py for new UI elements
4. Document test scenarios in this README

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review test logs and screenshots
- Verify test user credentials are active
