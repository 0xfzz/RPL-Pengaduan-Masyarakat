import pytest

def pytest_configure(config):
    """Configure pytest settings"""
    config.addinivalue_line(
        "markers", 
        "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers"""
    for item in items:
        # Add slow marker to tests that might take longer
        if "login" in item.name or "navigation" in item.name:
            item.add_marker(pytest.mark.slow)

@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment before all tests"""
    print("\n🚀 Starting RPL Pengaduan Masyarakat Test Suite")
    print("=" * 60)
    yield
    print("\n✅ Test Suite Completed")
    print("=" * 60)
