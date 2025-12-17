# Requirements Document

## Introduction

The application is experiencing Supabase-related errors even after migrating to Clerk for authentication. The system is throwing "No hay sesión activa en Supabase" errors and "Server Action not found" errors, indicating that there are still remnants of Supabase code being executed. This feature will completely remove all Supabase dependencies and ensure the authentication system works purely with Clerk.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to completely remove all Supabase dependencies from the codebase, so that the application no longer attempts to use Supabase authentication or throws Supabase-related errors.

#### Acceptance Criteria

1. WHEN the application loads THEN it SHALL NOT import or initialize any Supabase clients
2. WHEN authentication is required THEN the system SHALL use only Clerk authentication methods
3. WHEN API requests are made THEN they SHALL NOT attempt to refresh Supabase sessions
4. WHEN the application runs THEN it SHALL NOT log any Supabase-related errors in the console

### Requirement 2

**User Story:** As a developer, I want the useAuthenticatedFetch hook to work exclusively with Clerk authentication, so that API requests are properly authenticated without Supabase dependencies.

#### Acceptance Criteria

1. WHEN useAuthenticatedFetch is called THEN it SHALL use only Clerk user data for authentication headers
2. WHEN a 401 error occurs THEN the system SHALL handle it using Clerk session refresh methods
3. WHEN authentication fails THEN the system SHALL redirect to Clerk sign-in flow
4. WHEN making API requests THEN the system SHALL send Clerk session tokens instead of Supabase tokens

### Requirement 3

**User Story:** As a developer, I want all authentication-related hooks and components to use only Clerk, so that there are no conflicts between authentication systems.

#### Acceptance Criteria

1. WHEN useAuth hook is used THEN it SHALL return only Clerk user data and authentication state
2. WHEN authentication state changes THEN it SHALL be managed exclusively by Clerk providers
3. WHEN session management is needed THEN it SHALL use Clerk session management methods
4. WHEN user data is accessed THEN it SHALL come from Clerk user objects

### Requirement 4

**User Story:** As a developer, I want to remove all Supabase configuration files and imports, so that the build process doesn't include any Supabase code.

#### Acceptance Criteria

1. WHEN the application builds THEN it SHALL NOT include any Supabase packages in the bundle
2. WHEN configuration is loaded THEN it SHALL NOT reference any Supabase environment variables
3. WHEN the application starts THEN it SHALL NOT attempt to connect to Supabase services
4. WHEN dependencies are installed THEN Supabase packages SHALL be removed from package.json

### Requirement 5

**User Story:** As a developer, I want to fix all Server Action errors that occur due to missing or broken server actions, so that form submissions and server interactions work correctly.

#### Acceptance Criteria

1. WHEN server actions are called THEN they SHALL be properly defined and accessible on the server
2. WHEN forms are submitted THEN they SHALL not throw "Server Action not found" errors
3. WHEN server actions are referenced THEN they SHALL have valid action IDs that exist on the server
4. WHEN the application builds THEN all server actions SHALL be properly compiled and available

### Requirement 6

**User Story:** As a user, I want the application to work seamlessly with Clerk authentication, so that I can use all features without encountering authentication errors.

#### Acceptance Criteria

1. WHEN I log in THEN the authentication SHALL work using only Clerk
2. WHEN I make authenticated requests THEN they SHALL succeed without Supabase errors
3. WHEN my session expires THEN the system SHALL handle renewal using Clerk methods
4. WHEN I use protected features THEN they SHALL work without any Supabase-related console errors
5. WHEN I access the "escritor-ia" page THEN it SHALL load without Server Action errors