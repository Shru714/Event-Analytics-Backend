# API Usage Examples

## Authentication

### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Google OAuth

Navigate to: `http://localhost:3000/api/auth/google`

## API Key Management

### Create API Key

```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "app-uuid",
    "name": "Production Key",
    "expiresInDays": 365
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "key-uuid",
    "app_id": "app-uuid",
    "key_prefix": "ak_1234567890",
    "name": "Production Key",
    "status": "active",
    "expires_at": "2025-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "apiKey": "ak_1234567890abcdef..."
  },
  "message": "Store this API key securely. It will not be shown again."
}
```

### List API Keys

```bash
curl -X GET "http://localhost:3000/api/keys?appId=app-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Regenerate API Key

```bash
curl -X POST http://localhost:3000/api/keys/key-uuid/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Revoke API Key

```bash
curl -X DELETE http://localhost:3000/api/keys/key-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Event Tracking

### Track Single Event

```bash
curl -X POST http://localhost:3000/api/events/track \
  -H "X-API-Key: ak_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "page_view",
    "userId": "user123",
    "sessionId": "session456",
    "url": "https://example.com/products",
    "referrer": "https://google.com/search",
    "screenWidth": 1920,
    "screenHeight": 1080,
    "metadata": {
      "product_id": "prod_123",
      "category": "electronics"
    }
  }'
```

Response:
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

### Track Batch Events

```bash
curl -X POST http://localhost:3000/api/events/track/batch \
  -H "X-API-Key: ak_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "eventType": "button_click",
        "userId": "user123",
        "sessionId": "session456",
        "url": "https://example.com/checkout",
        "metadata": {"button": "add_to_cart"}
      },
      {
        "eventType": "form_submit",
        "userId": "user123",
        "sessionId": "session456",
        "url": "https://example.com/checkout",
        "metadata": {"form": "payment"}
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "message": "2 events tracked successfully"
}
```

## Analytics

### Get Event Summary

```bash
curl -X GET "http://localhost:3000/api/analytics/events/summary?appId=app-uuid&eventType=page_view&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "event_type": "page_view",
      "total_events": 15420,
      "unique_users": 3245,
      "unique_sessions": 4567,
      "device_breakdown": {
        "Desktop": 8234,
        "Mobile": 6012,
        "Tablet": 1174
      },
      "browser_breakdown": {
        "Chrome": 9876,
        "Safari": 3210,
        "Firefox": 1234,
        "Edge": 1100
      },
      "os_breakdown": {
        "Windows": 7890,
        "macOS": 3456,
        "iOS": 2345,
        "Android": 1729
      }
    }
  ],
  "cached": false
}
```

### Get Event Timeline

```bash
curl -X GET "http://localhost:3000/api/analytics/events/timeline?appId=app-uuid&eventType=click&startDate=2024-01-01&endDate=2024-01-07&interval=day" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "time_bucket": "2024-01-01",
      "event_count": 1234,
      "unique_users": 456
    },
    {
      "time_bucket": "2024-01-02",
      "event_count": 1567,
      "unique_users": 523
    }
  ],
  "cached": true
}
```

### Get User Analytics

```bash
curl -X GET "http://localhost:3000/api/analytics/users/user123?appId=app-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_events": 234,
      "unique_event_types": 12,
      "total_sessions": 45,
      "last_seen": "2024-01-15T14:30:00.000Z",
      "first_seen": "2023-12-01T10:15:00.000Z",
      "primary_device": "Desktop",
      "primary_browser": "Chrome",
      "primary_os": "Windows"
    },
    "recentEvents": [
      {
        "event_type": "page_view",
        "url": "https://example.com/products",
        "created_at": "2024-01-15T14:30:00.000Z",
        "device": "Desktop",
        "browser": "Chrome"
      }
    ]
  },
  "cached": false
}
```

### Get App Overview

```bash
curl -X GET http://localhost:3000/api/analytics/apps/app-uuid/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "app": {
      "id": "app-uuid",
      "name": "My App",
      "description": "Production application",
      "domain": "example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "stats": {
      "total_events": 125430,
      "total_users": 8765,
      "total_sessions": 23456,
      "unique_event_types": 15
    },
    "topEvents": [
      {"event_type": "page_view", "count": 45678},
      {"event_type": "button_click", "count": 23456},
      {"event_type": "form_submit", "count": 12345}
    ]
  },
  "cached": false
}
```

## JavaScript SDK Example

```javascript
class AnalyticsSDK {
  constructor(apiKey, baseUrl = 'https://api.example.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getUserId() {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  async track(eventType, metadata = {}) {
    const event = {
      eventType,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      metadata
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/events/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(event)
      });

      return await response.json();
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  trackPageView() {
    this.track('page_view', {
      title: document.title,
      path: window.location.pathname
    });
  }

  trackClick(element, metadata = {}) {
    this.track('click', {
      element: element.tagName,
      text: element.innerText,
      ...metadata
    });
  }
}

// Usage
const analytics = new AnalyticsSDK('ak_your_api_key_here');

// Track page view
analytics.trackPageView();

// Track button clicks
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    analytics.trackClick(button, { button_id: button.id });
  });
});

// Track custom events
analytics.track('purchase_completed', {
  order_id: '12345',
  amount: 99.99,
  currency: 'USD'
});
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Event type is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or inactive API key"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```
