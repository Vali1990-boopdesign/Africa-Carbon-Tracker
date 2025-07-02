
# Security Configuration

## API Key Setup

For production deployment, set up an API key to protect sensitive endpoints:

1. In Replit Secrets, add `API_KEY` with a strong random value
2. Protected endpoints requiring API key:
   - `/api/export/transactions` - Full data export
   - `/api/validate` - Data validation
   - `/api/validate/report` - Validation reports  
   - `/api/import-latest` - Data import

## Rate Limiting

- General API: 100 requests per 15 minutes
- Export endpoints: 5 requests per hour
- Admin endpoints: 10 requests per hour

## CORS Configuration

Production restricts origins to your deployed domain.
Development allows all origins for testing.

## Input Validation

All filter parameters are sanitized to prevent injection attacks:
- String inputs: HTML characters removed, length limited
- Year inputs: Bounded between 2000-2030

## Security Headers

Standard security headers are applied:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- Content Security Policy: restricts resource loading
