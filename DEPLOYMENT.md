# MangaVault Deployment Guide

## Environment Variables Required

### MongoDB Configuration
```
MONGODB_URI=mongodb://localhost:27017/mangavault
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mangavault
```

### AWS S3 Configuration
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=manga-vault-storage
```

### Optional Configuration
```
NODE_ENV=production
PORT=5000
```

## Setup Instructions

### 1. MongoDB Setup
- **Local**: Install MongoDB locally or use Docker
- **Cloud**: Set up MongoDB Atlas cluster
- Update `MONGODB_URI` environment variable

### 2. AWS S3 Setup
- Create an S3 bucket for manga storage
- Set up IAM user with S3 permissions:
  - `s3:GetObject`
  - `s3:PutObject` 
  - `s3:DeleteObject`
  - `s3:HeadObject`
- Configure bucket CORS if needed for direct browser access

### 3. MangaDx API
- No API key required
- Uses public MangaDx API endpoints
- Rate limiting handled automatically

## Architecture Overview

### Data Flow
1. **Search**: MangaDx API → MongoDB storage → Frontend
2. **Images**: MangaDx → S3 storage → Signed URLs → Frontend  
3. **Chapters**: MangaDx → S3 page storage → Frontend
4. **Stats**: User interactions → MongoDB → Analytics

### Storage Strategy
- **Metadata**: MongoDB (titles, descriptions, tags, stats)
- **Images**: S3 (cover images, manga pages)
- **Caching**: In-memory fallback for development

### API Endpoints
- `GET /api/manga/search?q=query` - Search manga
- `GET /api/manga/:id` - Get manga details
- `GET /api/manga/:id/chapters` - Get chapters
- `GET /api/chapters/:id/pages` - Get chapter pages
- `GET /api/manga/popular` - Popular manga
- `GET /api/manga/recent` - Recently updated
- `GET /api/manga/by-rating?ratings=safe,suggestive` - Filter by content rating

## Production Considerations

### Security
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Set up proper CORS policies
- Use signed URLs for S3 access

### Performance
- Implement Redis caching for frequent queries
- Use CDN for static assets
- Optimize MongoDB indexes
- Implement pagination for large datasets

### Monitoring
- Set up logging for API requests
- Monitor S3 storage costs
- Track MongoDB query performance
- Implement health checks

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string and network access
2. **S3 Access**: Verify AWS credentials and bucket permissions
3. **MangaDx API**: Check for rate limiting or API changes
4. **Memory Usage**: Monitor for large image processing

### Development Mode
- App runs with in-memory fallback when MongoDB unavailable
- S3 operations will fail gracefully without credentials
- MangaDx API calls work without authentication