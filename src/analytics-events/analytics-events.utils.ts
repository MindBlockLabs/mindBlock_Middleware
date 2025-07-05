// analytics-event.util.ts

type AnalyticsEvent = {
  userId: string;
  type: string;
  metadata: Record<string, any>;
  timestamp: string;
  requestId?: string;
  ip?: string;
};

/**
 * Builds a consistent analytics event object for tracking purposes.
 */
function buildAnalyticsEvent(
  userId: string,
  type: string,
  metadata: Record<string, any>,
  context?: {
    requestId?: string;
    ip?: string;
  }
): AnalyticsEvent {
  return {
    userId,
    type,
    metadata,
    timestamp: new Date().toISOString(),
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.ip ? { ip: context.ip } : {}),
  };
}

// Optional: Expose for local testing if needed
if (require.main === module) {
  console.log(
    buildAnalyticsEvent('user-1', 'login', { method: 'google' }, { ip: '127.0.0.1' })
  );
}
