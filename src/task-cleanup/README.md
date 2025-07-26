# Task Cleanup Service

This module provides automatic cleanup functionality to prevent table bloat by regularly deleting old puzzle sessions.

## Features

- **Automatic Cleanup**: Runs daily at midnight to delete puzzle sessions older than 7 days
- **Manual Cleanup**: API endpoints for on-demand cleanup
- **Statistics**: Get information about old tasks and cleanup statistics
- **Configurable Retention**: Customize the retention period for cleanup

## Configuration

The service uses the following default settings:
- **Retention Period**: 7 days
- **Schedule**: Every day at midnight (`0 0 * * *`)
- **Target Table**: `puzzle_sessions`

## API Endpoints

### Manual Cleanup
```http
POST /task-cleanup/manual?daysOld=7
```
Deletes puzzle sessions older than the specified number of days (default: 7).

**Query Parameters:**
- `daysOld` (optional): Number of days to retain (default: 7)

**Response:**
```json
{
  "success": true,
  "deletedCount": 15,
  "cutoffDate": "2024-01-01T00:00:00.000Z",
  "message": "Successfully deleted 15 old puzzle sessions"
}
```

### Get Cleanup Statistics
```http
GET /task-cleanup/stats?daysOld=7
```
Returns statistics about old puzzle sessions.

**Query Parameters:**
- `daysOld` (optional): Number of days to consider as "old" (default: 7)

**Response:**
```json
{
  "oldTasksCount": 25,
  "totalTasksCount": 1000,
  "cutoffDate": "2024-01-01T00:00:00.000Z",
  "percentageOld": "2.50"
}
```

## Implementation Details

### Service Methods

1. **`cleanupOldTasks()`**: Scheduled method that runs automatically
2. **`manualCleanup(daysOld: number)`**: Manual cleanup with custom retention period
3. **`getCleanupStats(daysOld: number)`**: Get statistics about old tasks

### Database Operations

The service uses TypeORM to:
- Delete records older than the cutoff date using `LessThan` operator
- Count records for statistics
- Log all operations for monitoring

### Logging

All cleanup operations are logged with:
- Start/completion messages
- Number of deleted records
- Error handling and logging

## Usage

The service is automatically started when the application starts. The scheduled cleanup runs every day at midnight.

To manually trigger cleanup:
```bash
curl -X POST "http://localhost:3000/task-cleanup/manual?daysOld=7"
```

To check statistics:
```bash
curl "http://localhost:3000/task-cleanup/stats?daysOld=7"
```

## Dependencies

- `@nestjs/schedule`: For cron job functionality
- `@nestjs/typeorm`: For database operations
- `typeorm`: For database queries

## Testing

Run the tests with:
```bash
npm test -- task-cleanup.service.spec.ts
```

The tests cover:
- Automatic cleanup functionality
- Manual cleanup with custom retention periods
- Statistics calculation
- Error handling 