# Performance Optimization Guide

## Overview

This document outlines performance optimization strategies and benchmarks for the Unified Event Analytics Backend.

## Current Performance Metrics

### Response Times (p95)
- Event ingestion (single): 30-50ms
- Event ingestion (batch 100): 200-300ms
- Analytics query (cached): 10-20ms
- Analytics query (uncached): 200-800ms
- API key validation: 5-10ms

### Throughput
- Target: 10,000 events/second per instance
- Concurrent users: 1,000+
- Database connections: 20 max pool size

## Database Optimization

### Index Strategy

**Existing Indexes:**
```sql
-- Event queries
CREATE INDEX idx_events_app_id ON events(app_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_app_event_time ON events(app_id, event_type, created_at);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_session_id ON events(session_id);
CREATE INDEX idx_events_metadata ON events USING GIN(metadata);
```

**Index Maintenance:**
```sql
-- Analyze tables regularly
ANALYZE events;
ANALYZE api_keys;
ANALYZE apps;

-- Vacuum to reclaim space
VACUUM ANALYZE events;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Query Optimization

**Slow Query Monitoring:**
```sql
-- Enable slow query logging
ALTER DATABASE analytics_db SET log_min_duration_statement = 1000;

-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Connection Pooling:**
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

### Table Partitioning (Future)

For high-volume deployments:
```sql
-- Partition events by month
CREATE TABLE events_2024_01 PARTITION OF events
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## Caching Strategy

### Redis Configuration

**Memory Policy:**
```
maxmemory-policy: allkeys-lru
maxmemory: 256mb (adjust based on needs)
```

**Cache Keys:**
```
analytics:summary:{userId}:{appId}:{eventType}:{startDate}:{endDate}
analytics:timeline:{userId}:{appId}:{eventType}:{startDate}:{endDate}:{interval}
analytics:user:{userId}:{targetUserId}:{appId}
analytics:app-overview:{userId}:{appId}
```

**TTL Strategy:**
- Default: 3600 seconds (1 hour)
- High-frequency queries: 300 seconds (5 minutes)
- Low-frequency queries: 7200 seconds (2 hours)

### Cache Warming

Preload frequently accessed data:
```javascript
async function warmCache() {
  const popularApps = await getPopularApps();
  for (const app of popularApps) {
    await getAppOverview(app.id);
    await getEventSummary({ appId: app.id });
  }
}
```

### Cache Invalidation

**Pattern-based:**
```javascript
// Invalidate all analytics for an app
await invalidatePattern(`analytics:${appId}:*`);
```

**Event-driven:**
- New event → Invalidate app analytics
- API key revoked → Invalidate key cache
- User deleted → Invalidate user analytics

## Application Optimization

### Batch Processing

**Event Ingestion:**
```javascript
// Process events in batches
const BATCH_SIZE = 100;
for (let i = 0; i < events.length; i += BATCH_SIZE) {
  const batch = events.slice(i, i + BATCH_SIZE);
  await processBatch(batch);
}
```

### Async Processing (Future)

**Message Queue Integration:**
```javascript
// Publish event to queue
await queue.publish('events', event);

// Worker processes events asynchronously
queue.subscribe('events', async (event) => {
  await processEvent(event);
});
```

### Response Compression

Enable gzip compression:
```javascript
const compression = require('compression');
app.use(compression());
```

## Load Testing

### Tools
- Apache Bench (ab)
- Artillery
- k6
- JMeter

### Test Scenarios

**Event Ingestion:**
```bash
# 1000 requests, 100 concurrent
ab -n 1000 -c 100 -p event.json -T application/json \
  -H "X-API-Key: ak_test" \
  http://localhost:3000/api/events/track
```

**Analytics Query:**
```bash
# 500 requests, 50 concurrent
ab -n 500 -c 50 \
  -H "Authorization: Bearer token" \
  http://localhost:3000/api/analytics/events/summary?appId=uuid
```

### Artillery Configuration

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
    - duration: 60
      arrivalRate: 100
      name: Peak load

scenarios:
  - name: Track events
    flow:
      - post:
          url: '/api/events/track'
          headers:
            X-API-Key: 'ak_test'
          json:
            eventType: 'page_view'
            userId: 'user{{ $randomNumber() }}'
```

## Monitoring

### Key Metrics

**Application:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

**Database:**
- Query execution time
- Connection pool usage
- Cache hit ratio
- Slow queries

**Redis:**
- Memory usage
- Cache hit rate
- Eviction rate
- Connection count

### Monitoring Tools

**Application Performance Monitoring:**
- New Relic
- Datadog
- AppDynamics

**Database Monitoring:**
- pgAdmin
- pg_stat_statements
- pgBadger

**Redis Monitoring:**
- Redis CLI (INFO command)
- RedisInsight
- Prometheus + Grafana

### Alerting Thresholds

```yaml
alerts:
  - name: High error rate
    condition: error_rate > 1%
    severity: critical
  
  - name: Slow response time
    condition: p95_latency > 1000ms
    severity: warning
  
  - name: Database connection pool exhausted
    condition: active_connections > 18
    severity: critical
  
  - name: Redis memory high
    condition: memory_usage > 80%
    severity: warning
```

## Scaling Strategies

### Vertical Scaling

**Application:**
- Increase CPU cores
- Add more RAM
- Use faster storage (SSD)

**Database:**
- Increase connection pool size
- Add more RAM for caching
- Use faster disks

### Horizontal Scaling

**Application:**
```
Load Balancer
    ├── App Instance 1
    ├── App Instance 2
    ├── App Instance 3
    └── App Instance N
```

**Database:**
- Read replicas for analytics queries
- Write to primary, read from replicas
- Connection pooling per instance

**Redis:**
- Redis Cluster for high availability
- Sentinel for automatic failover

### Auto-scaling

**AWS ECS:**
```json
{
  "targetTrackingScalingPolicyConfiguration": {
    "targetValue": 70.0,
    "predefinedMetricSpecification": {
      "predefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }
}
```

**Kubernetes:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: analytics-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: analytics-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Performance Checklist

- [ ] Database indexes optimized
- [ ] Connection pooling configured
- [ ] Redis caching enabled
- [ ] Cache TTL tuned
- [ ] Compression enabled
- [ ] Rate limiting configured
- [ ] Load testing completed
- [ ] Monitoring configured
- [ ] Alerting set up
- [ ] Auto-scaling configured (if applicable)
- [ ] Database backups optimized
- [ ] Slow query logging enabled

## Troubleshooting

### High Latency

**Symptoms:**
- Slow API responses
- Timeouts

**Solutions:**
1. Check database query performance
2. Verify cache hit rate
3. Monitor network latency
4. Check resource utilization (CPU, memory)
5. Review slow query logs

### High Memory Usage

**Symptoms:**
- Out of memory errors
- Slow performance

**Solutions:**
1. Check Redis memory usage
2. Review cache TTL settings
3. Monitor connection pool size
4. Check for memory leaks
5. Increase available memory

### Database Connection Errors

**Symptoms:**
- Connection timeout errors
- Pool exhausted errors

**Solutions:**
1. Increase connection pool size
2. Reduce connection timeout
3. Check database server capacity
4. Review long-running queries
5. Implement connection retry logic

## Best Practices

1. **Monitor continuously** - Track metrics in real-time
2. **Test regularly** - Run load tests before major releases
3. **Optimize incrementally** - Make small, measurable improvements
4. **Cache strategically** - Cache frequently accessed data
5. **Scale proactively** - Scale before hitting limits
6. **Document changes** - Keep performance notes updated
7. **Review regularly** - Analyze slow queries monthly
8. **Benchmark** - Establish baseline performance metrics
