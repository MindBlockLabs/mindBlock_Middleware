# @mindblock/shared-dtos

A comprehensive collection of shared DTOs (Data Transfer Objects) for MindBlock middleware and backend services. This package provides type-safe, validated data structures for consistent API communication between services.

## 🚀 Features

- **Type-safe DTOs**: Full TypeScript support with comprehensive type definitions
- **Validation**: Built-in validation using class-validator decorators
- **Transformation**: Automatic data transformation with class-transformer
- **Consistent APIs**: Standardized DTOs across all MindBlock services
- **Extensible**: Easy to extend and customize for specific needs
- **Well-documented**: Comprehensive documentation and examples

## 📦 Installation

```bash
npm install @mindblock/shared-dtos
```

## 🏗️ Structure

```
src/shared-dtos/
├── dto/                    # Core DTOs
│   ├── user.dto.ts        # User-related DTOs
│   ├── challenge.dto.ts   # Challenge-related DTOs
│   ├── submission.dto.ts  # Submission-related DTOs
│   └── leaderboard.dto.ts # Leaderboard-related DTOs
├── types/                  # Common types and interfaces
│   ├── common.types.ts    # General application types
│   └── validation.types.ts # Validation-specific types
├── enums/                  # Enumerations
│   ├── challenge.enum.ts  # Challenge-related enums
│   └── user.enum.ts       # User-related enums
├── utils/                  # Utility functions
│   └── dto.utils.ts       # DTO manipulation utilities
└── index.ts               # Main exports
```

## 📋 Available DTOs

### User DTOs

```typescript
import { 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto, 
  LoginUserDto, 
  UserProfileDto,
  UserStatsDto 
} from '@mindblock/shared-dtos';

// Create a new user
const createUserData: CreateUserDto = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securepassword123',
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Software developer'
};

// Update user profile
const updateUserData: UpdateUserDto = {
  bio: 'Updated bio',
  firstName: 'Johnny'
};
```

### Challenge DTOs

```typescript
import { 
  ChallengeDto, 
  CreateChallengeDto, 
  UpdateChallengeDto,
  ChallengeResponseDto,
  ChallengeDifficulty,
  ChallengeCategory 
} from '@mindblock/shared-dtos';

// Create a new challenge
const createChallengeData: CreateChallengeDto = {
  title: 'Logic Puzzle #1',
  description: 'Solve this complex logic puzzle...',
  difficulty: ChallengeDifficulty.MEDIUM,
  category: ChallengeCategory.LOGIC,
  points: 100,
  timeLimit: 300, // 5 minutes
  hint: 'Think about the pattern...',
  tags: ['logic', 'puzzle', 'medium']
};
```

### Submission DTOs

```typescript
import { 
  SubmissionDto, 
  CreateSubmissionDto, 
  PuzzleSubmissionDto,
  SubmissionStatus,
  SubmissionType 
} from '@mindblock/shared-dtos';

// Create a puzzle submission
const submissionData: PuzzleSubmissionDto = {
  sessionId: 'session-123',
  puzzleId: 'puzzle-456',
  answer: 'correct_answer',
  timeSpent: 120, // 2 minutes
  metadata: { attempts: 3, hintsUsed: 1 }
};
```

### Leaderboard DTOs

```typescript
import { 
  LeaderboardEntryDto, 
  LeaderboardUpdateDto,
  LeaderboardType,
  LeaderboardPeriod 
} from '@mindblock/shared-dtos';

// Update leaderboard entry
const leaderboardUpdate: LeaderboardUpdateDto = {
  userId: 123,
  username: 'john_doe',
  scoreChange: 50,
  challengesCompleted: 1,
  challengeName: 'Logic Puzzle #1',
  challengeCategory: 'logic'
};
```

## 🔧 Utility Functions

### Validation and Transformation

```typescript
import { 
  transformAndValidate, 
  createPartialDto, 
  mergeDtos,
  sanitizeDto 
} from '@mindblock/shared-dtos/utils/dto.utils';

// Transform and validate data
const result = await transformAndValidate(CreateUserDto, userData);
if (result.isValid) {
  const validatedUser = result.data;
  // Use validated user data
} else {
  console.log('Validation errors:', result.errors);
}

// Create partial DTO
const partialUser = createPartialDto(UserDto, { username: 'john' });

// Merge DTOs
const mergedUser = mergeDtos(UserDto, baseUser, updates);

// Sanitize DTO
const cleanUser = sanitizeDto(userWithNullValues);
```

### Field Operations

```typescript
import { 
  extractFields, 
  omitFields, 
  hasRequiredFields,
  getMissingFields 
} from '@mindblock/shared-dtos/utils/dto.utils';

// Extract specific fields
const publicUser = extractFields(user, ['username', 'email', 'bio']);

// Omit sensitive fields
const safeUser = omitFields(user, ['password', 'twoFASecret']);

// Check required fields
const hasRequired = hasRequiredFields(user, ['username', 'email']);

// Get missing fields
const missing = getMissingFields(user, ['username', 'email', 'password']);
```

## 🎯 Common Types

```typescript
import { 
  ApiResponse, 
  PaginationParams, 
  QueryParams,
  RequestContext,
  ValidationErrorResponse 
} from '@mindblock/shared-dtos/types/common.types';

// API response wrapper
const response: ApiResponse<UserProfileDto> = {
  success: true,
  data: userProfile,
  message: 'User profile retrieved successfully',
  timestamp: new Date(),
  requestId: 'req-123'
};

// Pagination parameters
const pagination: PaginationParams = {
  page: 1,
  limit: 20
};

// Query parameters
const query: QueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filters: { status: 'active' },
  search: 'john'
};
```

## 🔍 Validation Types

```typescript
import { 
  ValidationOptions, 
  ValidationResult,
  ValidationError 
} from '@mindblock/shared-dtos/types/validation.types';

// Validation options
const options: ValidationOptions = {
  skipMissingProperties: false,
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true
};

// Validation result
const validationResult: ValidationResult<UserDto> = {
  isValid: true,
  data: validatedUser,
  errors: [],
  warnings: []
};
```

## 🏷️ Enums

```typescript
import { 
  ChallengeDifficulty,
  ChallengeCategory,
  UserRole,
  UserStatus,
  SubmissionStatus 
} from '@mindblock/shared-dtos/enums';

// Use enums for type safety
const challenge = {
  difficulty: ChallengeDifficulty.HARD,
  category: ChallengeCategory.PROGRAMMING,
  status: SubmissionStatus.CORRECT
};
```

## 🧪 Testing

```typescript
import { CreateUserDto, UserDto } from '@mindblock/shared-dtos';

describe('User DTOs', () => {
  it('should validate create user data', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await transformAndValidate(CreateUserDto, userData);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid email', async () => {
    const userData = {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123'
    };

    const result = await transformAndValidate(CreateUserDto, userData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});
```

## 🔄 Migration Guide

### From Local DTOs

1. **Replace imports**:
   ```typescript
   // Before
   import { UserDto } from '../local/user.dto';
   
   // After
   import { UserDto } from '@mindblock/shared-dtos';
   ```

2. **Update validation**:
   ```typescript
   // Before
   const user = new UserDto();
   Object.assign(user, userData);
   const errors = await validate(user);
   
   // After
   const result = await transformAndValidate(UserDto, userData);
   if (result.isValid) {
     const user = result.data;
   }
   ```

3. **Use utility functions**:
   ```typescript
   // Before
   const { password, ...safeUser } = user;
   
   // After
   const safeUser = omitFields(user, ['password']);
   ```

## 📚 API Reference

### Core DTOs

- `UserDto` - Base user DTO
- `CreateUserDto` - DTO for creating users
- `UpdateUserDto` - DTO for updating users
- `ChallengeDto` - Base challenge DTO
- `CreateChallengeDto` - DTO for creating challenges
- `SubmissionDto` - Base submission DTO
- `LeaderboardEntryDto` - Leaderboard entry DTO

### Utility Functions

- `transformAndValidate()` - Transform and validate data
- `createPartialDto()` - Create partial DTO
- `mergeDtos()` - Merge multiple DTOs
- `extractFields()` - Extract specific fields
- `omitFields()` - Omit specific fields
- `sanitizeDto()` - Remove null/undefined values

### Types

- `ApiResponse<T>` - Standard API response wrapper
- `PaginationParams` - Pagination parameters
- `QueryParams` - Combined query parameters
- `ValidationResult<T>` - Validation result
- `RequestContext` - Request context information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the MindBlock team
- Check the documentation

## 🔄 Versioning

This package follows semantic versioning (SemVer). See CHANGELOG.md for version history. 