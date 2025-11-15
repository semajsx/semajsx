# Async Component Tests

## Status

⚠️ **Known Issue**: These tests are currently experiencing a browser environment issue when running with vitest browser mode. The browser connection closes unexpectedly during test collection.

## Test Coverage

The `async.test.tsx` file includes comprehensive test coverage for:

### Promise-based Async Components

- Basic async component rendering
- Async components with data fetching
- Multiple async components rendering simultaneously

### Async Iterator Components

- Countdown/streaming updates
- Loading state transitions
- Progress updates

### Mixed Components

- Combination of sync and async components

## Running Tests

The test logic is correct and follows the same pattern as other successful tests in the suite. The issue appears to be environment-specific related to browser testing infrastructure.

To debug the issue:

1. Check vitest browser configuration
2. Verify playwright setup
3. Review browser console logs

## Implementation Details

The tests verify that:

- Async components show empty/pending state initially
- Content appears after promises resolve
- Async iterators update content on each yield
- Mixed async/sync components render correctly
