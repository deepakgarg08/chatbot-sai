# Backend Test Suite

This directory contains comprehensive tests for the AI Chatbot Socket backend application. All tests are built using **Mocha** testing framework with **Chai** assertions.

## 📁 Test Structure

```
test/
├── README.md                    # This documentation file
├── app.test.js                  # HTTP server endpoint tests
├── chatStorage.test.js          # Data persistence and storage tests  
├── logger.test.js               # Winston logging system tests
├── socket/                      # Real-time WebSocket communication tests
│   ├── 01-register.test.js      # User registration via Socket.IO
│   ├── 02-single-message.test.js # Single message broadcasting
│   ├── 03-multi-broadcast.test.js # Multi-user message broadcasting
│   ├── 04-private-chat.test.js  # Private 1-to-1 messaging
│   ├── setup.js                 # Socket test utilities and helpers
│   └── Readme.md                # Socket-specific test documentation
└── testreport/                  # Generated test reports and results
    ├── test-execution-report.md
    └── test-results-summary.json
```

## 🧪 What's Being Tested

### 1. **HTTP Server Tests** (`app.test.js`)
- **Basic Routes**: GET `/` endpoint functionality
- **Response Validation**: Correct status codes and messages
- **Server Stability**: Proper request/response handling

### 2. **Chat Storage Tests** (`chatStorage.test.js`)
- **Data Structures**: Initialization and essential methods
- **Message Encoding**: Base64 encoding/decoding for message security
- **User Management**: Add, remove, duplicate handling, existence checks
- **Public Messages**: Storage, retrieval, and empty state handling
- **Private Messages**: 1-to-1 chat functionality, key generation, isolation
- **Statistics**: Storage metrics and data reset capabilities
- **Error Handling**: Invalid inputs, malformed data, edge cases
- **Performance**: Multi-user and multi-message efficiency testing

### 3. **Socket.IO Communication Tests** (`socket/`)
- **User Registration**: WebSocket-based user sign-up process
- **Message Broadcasting**: Real-time message distribution to all users
- **Multi-User Scenarios**: Multiple clients sending/receiving simultaneously
- **Private Messaging**: Direct 1-to-1 communication between specific users
- **Error Scenarios**: Invalid recipients, connection failures, malformed data

### 4. **Winston Logger Tests** (`logger.test.js`)
- **Initialization**: Logger setup, configuration, and directory creation
- **Log Levels**: Error, warn, info, http, debug level functionality
- **File Output**: Creation of log files (combined.log, error.log)
- **Content Handling**: Objects, Error instances, null/undefined values, emojis
- **Performance**: Rapid sequential logging, concurrent write operations
- **Integration**: Works correctly with ChatStorage and other components
- **Error Resilience**: Doesn't crash on errors, handles special characters

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Files
```bash
# HTTP server tests only
npx mocha test/app.test.js

# Chat storage tests only  
npx mocha test/chatStorage.test.js

# Logger tests only
npx mocha test/logger.test.js

# All socket tests
npx mocha "test/socket/*.test.js"

# Specific socket test
npx mocha test/socket/01-register.test.js
```

### Run Tests with Different Log Levels
```bash
# Silent mode (errors only)
LOG_LEVEL=error npm test

# Verbose mode (all logs)
LOG_LEVEL=debug npm test

# No console output
ENABLE_CONSOLE_LOG=false npm test
```

## 📊 Test Results

### Latest Test Run Summary
- **Total Tests**: 50
- **Passed**: 50 ✅
- **Failed**: 0 ❌
- **Success Rate**: 100%
- **Execution Time**: ~1 second

### Performance Benchmarks
- **Fastest Test**: ~5ms (basic logging)
- **Slowest Test**: ~153ms (private messaging with validation)
- **Average Socket Test**: ~108ms
- **Average Storage Test**: ~8ms

## 🔍 Test Categories Explained

### Unit Tests
- **ChatStorage**: Tests individual methods and data operations
- **Logger**: Tests logging functionality in isolation
- **HTTP Routes**: Tests API endpoints independently

### Integration Tests  
- **Socket.IO**: Tests real WebSocket connections between multiple clients
- **End-to-End Flows**: Complete user registration → messaging → storage cycle

### Performance Tests
- **Load Handling**: Multiple users and messages simultaneously
- **Memory Stability**: No memory leaks during rapid operations
- **Concurrent Operations**: Multiple clients acting simultaneously

### Error Handling Tests
- **Invalid Inputs**: Malformed data, missing parameters
- **Edge Cases**: Empty states, duplicate operations, non-existent entities
- **Network Issues**: Connection failures, timeouts, disconnections

## 🛠️ Test Environment Configuration

### Environment Variables
```bash
NODE_ENV=test              # Automatically set by npm test
LOG_LEVEL=error           # Minimize test output noise
ENABLE_FILE_LOG=true      # Test file logging functionality
```

### Test Isolation
- Each test file runs independently
- Clean setup/teardown for each test
- No shared state between tests
- Fresh Socket.IO connections for each socket test

## 📋 Test Coverage Areas

### ✅ Fully Covered
- HTTP endpoint responses
- User registration and management
- Message storage and retrieval
- Real-time broadcasting
- Private messaging
- File logging
- Error handling
- Performance under load

### 🔄 Areas for Future Enhancement
- Database integration testing (currently in-memory)
- Authentication and authorization
- Rate limiting and abuse prevention
- Large-scale load testing (1000+ users)
- Security penetration testing

## 🐛 Debugging Tests

### View Detailed Test Output
```bash
# Run with verbose logging
LOG_LEVEL=debug npm test

# Run single test with full output
npx mocha test/app.test.js --reporter spec
```

### Common Issues
1. **Port conflicts**: Tests use random ports to avoid conflicts
2. **Timing issues**: Socket tests include proper wait conditions
3. **File permissions**: Logger tests create temporary directories
4. **Memory usage**: Tests clean up resources properly

### Test Logs Location
- Console output: Real-time during test execution
- File logs: `logs/` directory (if file logging enabled)
- Test reports: `test/testreport/` directory

## 🎯 Best Practices

### Writing New Tests
1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources (sockets, files, timers)
3. **Assertions**: Use descriptive assertion messages
4. **Async Handling**: Proper promise/callback handling
5. **Error Testing**: Include both success and failure scenarios

### Test Organization
1. **Descriptive Names**: Clear test descriptions
2. **Logical Grouping**: Related tests in same describe block
3. **Setup/Teardown**: Use beforeEach/afterEach appropriately
4. **Documentation**: Comment complex test scenarios

## 📈 Continuous Integration

### Automated Testing
- Tests run automatically on code changes
- All tests must pass before deployment
- Performance benchmarks tracked over time

### Quality Gates
- 100% test pass rate required
- No memory leaks detected
- Performance within acceptable thresholds
- Error handling coverage verified

---

**Need Help?** 
- Check individual test files for specific test details
- Review `socket/Readme.md` for Socket.IO test specifics
- Look at `testreport/` for detailed execution results
- Run tests with `LOG_LEVEL=debug` for detailed debugging