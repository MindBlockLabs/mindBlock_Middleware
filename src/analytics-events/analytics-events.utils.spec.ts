
type AnalyticsEvent = {
  userId: string;
  type: string;
  metadata: Record<string, any>;
  timestamp: string;
  requestId?: string;
  ip?: string;
};

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

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error('❌ ' + message);
}

// Run all test cases
function runTests() {
  const base = buildAnalyticsEvent('u1', 'signup', { source: 'referral' });

  assert(base.userId === 'u1', 'userId should match');
  assert(base.type === 'signup', 'type should match');
  assert(base.metadata.source === 'referral', 'metadata should match');
  assert(typeof base.timestamp === 'string', 'timestamp should be a string');
  assert(!base.requestId, 'requestId should be undefined when not passed');
  assert(!base.ip, 'ip should be undefined when not passed');

  const withCtx = buildAnalyticsEvent(
    'u2',
    'click',
    { element: 'cta' },
    { requestId: 'req-001', ip: '192.168.0.1' }
  );

  assert(withCtx.requestId === 'req-001', 'requestId should match');
  assert(withCtx.ip === '192.168.0.1', 'ip should match');

  console.log('✅ All tests passed.');
}

// Run when executed directly
if (require.main === module) {
  runTests();
}
