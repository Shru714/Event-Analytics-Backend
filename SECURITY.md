# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. Do Not Disclose Publicly

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to security@example.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide regular updates on our progress
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

### For Deployment

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, random secrets for JWT_SECRET and API_KEY_SECRET
   - Rotate secrets regularly

2. **Database Security**
   - Use strong database passwords
   - Enable SSL/TLS for database connections
   - Restrict database access to application servers only
   - Regular backups with encryption

3. **Redis Security**
   - Set Redis password (requirepass)
   - Disable dangerous commands (CONFIG, FLUSHALL)
   - Use Redis over TLS if exposed

4. **API Security**
   - Always use HTTPS in production
   - Configure CORS for specific origins
   - Enable rate limiting
   - Monitor for suspicious activity

5. **Container Security**
   - Use official base images
   - Keep dependencies updated
   - Scan images for vulnerabilities
   - Run containers as non-root user

### For Development

1. **Dependencies**
   - Regularly update dependencies
   - Use `npm audit` to check for vulnerabilities
   - Review dependency licenses

2. **Code Security**
   - Never log sensitive data (API keys, passwords)
   - Use parameterized queries (already implemented)
   - Validate and sanitize all inputs
   - Implement proper error handling

3. **API Keys**
   - Never expose API keys in client-side code
   - Implement key rotation
   - Monitor key usage for anomalies
   - Revoke compromised keys immediately

## Known Security Considerations

### API Key Storage
- API keys are hashed using HMAC-SHA256
- Only key prefix (12 chars) is stored in plaintext
- Raw keys are never logged or stored

### JWT Tokens
- Tokens expire after 7 days
- Use strong JWT_SECRET (minimum 32 characters)
- Tokens are stateless (no server-side session storage)

### Rate Limiting
- Distributed rate limiting via Redis
- Per-endpoint limits configured
- IP-based and API key-based limits

### Database
- Connection pooling prevents connection exhaustion
- Parameterized queries prevent SQL injection
- Indexes optimize query performance

### Input Validation
- Request body size limited to 10MB
- Event batch size limited to 100 events
- All inputs validated before processing

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- CHANGELOG.md
- Email notifications (if registered)

## Compliance

This project follows:
- OWASP Top 10 security guidelines
- Node.js security best practices
- Docker security best practices
- PostgreSQL security recommendations

## Security Checklist for Production

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong secrets configured (JWT_SECRET, API_KEY_SECRET)
- [ ] Database password is strong and unique
- [ ] Redis password configured
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] Security headers enabled (Helmet.js)
- [ ] Dependencies updated
- [ ] Vulnerability scanning enabled
- [ ] Access logs enabled
- [ ] Error tracking configured

## Contact

For security concerns: security@example.com

For general questions: support@example.com
