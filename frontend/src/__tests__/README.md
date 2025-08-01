# Frontend Redux Store Test Suite

This directory contains comprehensive test cases for the Redux store used in the AI Chatbot Socket application. The tests are built using Vitest and React Testing Library.

## Test Structure

```
src/__tests__/
├── README.md                 # This documentation
├── setup.js                  # Test environment setup
├── store/
│   ├── chatSlice.test.js     # Unit tests for chat slice reducers
│   ├── store.test.js         # Store configuration and integration tests
│   ├── integration.test.jsx  # React component integration tests
│   └── edgeCases.test.js     # Edge cases and async operation tests
└── utils/
    └── testUtils.js          # Test utilities and helpers
```

## Test Coverage

### 1. Chat Slice Tests (`chatSlice.test.js`)
- **Initial State**: Validates the default state structure
- **Username Management**: Tests setting and updating usernames
- **Message Management**: Tests adding individual messages and bulk message operations
- **Typing Indicators**: Tests adding/removing typing users and clearing all typing
- **Animation Controls**: Tests animation triggers and icon state changes
- **Online Users**: Tests online user list management
- **Private Chat Management**: 
  - Setting active private chats
  - Adding private messages (sent and received)
  - Unread count management
  - Message thread separation
- **State Reset**: Tests clearing all data
- **Immutability**: Ensures state mutations don't affect original objects
- **Edge Cases**: Handles undefined properties and invalid values

### 2. Store Configuration Tests (`store.test.js`)
- **Store Creation**: Validates Redux store is properly configured
- **Initial State**: Ensures correct initial state structure
- **Action Handling**: Tests store responds correctly to dispatched actions
- **State Consistency**: Validates state remains consistent across multiple dispatches
- **Subscriptions**: Tests store subscription and unsubscription
- **Performance**: Tests store performance with large datasets
- **Error Handling**: Tests graceful handling of unknown actions

### 3. Integration Tests (`integration.test.jsx`)
- **Component-Store Integration**: Tests React components with Redux store
- **Multi-Component Sync**: Ensures multiple components stay synchronized
- **State Persistence**: Tests state persistence across component unmounts/remounts
- **User Interactions**: Tests user interactions trigger correct store updates
- **Private Chat Workflows**: Tests complete private chat functionality
- **Animation Integration**: Tests animation state management through components
- **Error Boundaries**: Tests error handling in component-store integration

### 4. Edge Cases Tests (`edgeCases.test.js`)
- **Data Validation**: Tests handling of null, undefined, and malformed data
- **Special Characters**: Tests Unicode, emojis, and special character handling
- **Large Datasets**: Tests performance with large state objects
- **Concurrent Operations**: Simulates rapid state changes and race conditions
- **Async Operations**: Tests delayed actions and subscription behavior
- **Memory Management**: Tests large state handling without memory issues
- **State Corruption**: Tests graceful handling of corrupted state
- **Circular References**: Tests prevention of infinite loops

### 5. Test Utilities (`testUtils.js`)
- **Store Creation**: Helper for creating test stores with custom initial state
- **Component Rendering**: Utility for rendering components with Redux provider
- **Mock Data Generation**: Functions to create mock messages and chat states
- **Async Helpers**: Utilities for waiting on store changes and action sequences
- **Performance Testing**: Helpers for measuring operation performance
- **State Validation**: Functions to validate state structure and consistency

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Running Specific Test Files

```bash
# Run only chat slice tests
npx vitest src/__tests__/store/chatSlice.test.js

# Run only integration tests
npx vitest src/__tests__/store/integration.test.jsx

# Run only edge case tests
npx vitest src/__tests__/store/edgeCases.test.js
```

### Running Specific Test Suites

```bash
# Run tests matching a pattern
npx vitest --run -t "private chat"

# Run tests in a specific describe block
npx vitest --run -t "Animation Controls"
```

## Test Configuration

### Vitest Configuration (`vitest.config.js`)
- Uses jsdom environment for DOM testing
- Includes React plugin for JSX support
- Sets up global test utilities
- Configures test file patterns

### Test Setup (`setup.js`)
- Extends expect with React Testing Library matchers
- Configures automatic cleanup after each test
- Sets up global test environment

## Writing New Tests

### Best Practices

1. **Descriptive Test Names**: Use clear, specific test descriptions
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases
3. **Test Isolation**: Each test should be independent and not rely on others
4. **Mock Data**: Use test utilities to create consistent mock data
5. **Edge Cases**: Always test boundary conditions and error scenarios

### Example Test Structure

```javascript
describe('Feature Name', () => {
  let store
  
  beforeEach(() => {
    store = createTestStore()
  })
  
  describe('specific functionality', () => {
    it('should handle expected behavior', () => {
      // Arrange
      const initialState = store.getState()
      
      // Act
      store.dispatch(someAction('payload'))
      
      // Assert
      const newState = store.getState()
      expect(newState.someProperty).toBe('expectedValue')
    })
  })
})
```

### Testing Redux Actions

```javascript
it('should update state correctly', () => {
  const action = setUsername('testUser')
  const result = chatReducer(initialState, action)
  
  expect(result.username).toBe('testUser')
  expect(result).not.toBe(initialState) // Immutability check
})
```

### Testing React Components with Redux

```javascript
it('should display updated state', () => {
  const { store } = renderWithRedux(<TestComponent />)
  
  store.dispatch(setUsername('testUser'))
  
  expect(screen.getByTestId('username')).toHaveTextContent('testUser')
})
```

## Test Data Patterns

### Message Structure
```javascript
{
  user: 'username',
  text: 'message content',
  timestamp: Date.now()
}
```

### Private Message Structure
```javascript
{
  from: 'sender',
  to: 'recipient', 
  text: 'message content',
  timestamp: Date.now()
}
```

### State Structure
```javascript
{
  messages: [],
  username: "",
  typingUsers: [],
  animationTrigger: false,
  iconState: "static",
  onlineUsers: [],
  privateChats: {},
  activePrivateChat: null,
  unreadCounts: {},
}
```

## Performance Considerations

### Large Dataset Testing
- Tests include scenarios with 1000+ messages
- Private chat tests with 100+ conversations
- Typing user tests with 50+ concurrent users

### Memory Management
- Tests verify no memory leaks in state management
- Large state serialization/deserialization testing
- Circular reference prevention

### Timing Considerations
- Async operations use realistic delays
- Race condition simulations
- Concurrent operation testing

## Debugging Tests

### Useful Commands

```bash
# Run tests with verbose output
npx vitest --reporter=verbose

# Run specific test with debugging
npx vitest --run -t "test name" --reporter=verbose

# Debug failed tests
npx vitest --run --reporter=verbose --bail=1
```

### Debug Utilities

The test utilities include debugging helpers:
- `measurePerformance()` for timing operations
- `validateChatStateStructure()` for state validation
- `deepClone()` for state comparison

## Continuous Integration

These tests are designed to run in CI environments:
- All tests complete within reasonable time limits
- No external dependencies required
- Deterministic results (no random failures)
- Comprehensive coverage of all Redux functionality

## Future Enhancements

Potential areas for test expansion:
- WebSocket integration testing
- Local storage persistence testing
- Error boundary component testing
- Accessibility testing
- Performance regression testing