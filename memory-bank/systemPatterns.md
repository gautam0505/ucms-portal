# System Patterns

## System Architecture
- Modular architecture with separate modules for user authentication, complaint management, reporting, and administration.
- RESTful API for communication between the front-end and back-end.

## Key Technical Decisions
- Using Next.js for the front-end framework.
- Using Prisma for the ORM.
- Using PostgreSQL for the database.

## Design Patterns
- Model-View-Controller (MVC) for structuring the application.
- Repository pattern for data access.
- Observer pattern for event handling.

## Component Relationships
- The user authentication module interacts with the user management module.
- The complaint management module interacts with the reporting module.

## Critical Implementation Paths
- User registration and login.
- Complaint submission and tracking.
- Report generation.
