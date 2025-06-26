@echo off
echo 🔍 RPL Pengaduan Masyarakat - Automation Test Runner
echo ================================================

echo.
echo 📦 Installing dependencies...
pip install -r requirements.txt

echo.
echo 🧪 Running blackbox automation tests...
echo Base URL: https://rpl.0xfzz.xyz
echo.

rem Create directories if they don't exist
if not exist "screenshots" mkdir screenshots
if not exist "reports" mkdir reports

rem Run tests with verbose output and generate reports
pytest test_complete_flow.py -v --tb=short --html=reports/pytest_report.html --self-contained-html

echo.
echo 📊 Test execution completed!
echo 📁 Check the 'reports' folder for detailed test reports
echo 📸 Check the 'screenshots' folder for test evidence
echo.
pause
