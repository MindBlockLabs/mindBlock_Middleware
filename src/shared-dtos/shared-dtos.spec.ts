import { 
  UserDto, 
  CreateUserDto, 
  UpdateUserDto,
  ChallengeDto,
  CreateChallengeDto,
  SubmissionDto,
  CreateSubmissionDto,
  LeaderboardEntryDto,
  CreateLeaderboardEntryDto,
  ChallengeDifficulty,
  ChallengeCategory,
  SubmissionStatus,
  SubmissionType,
  LeaderboardType,
  LeaderboardPeriod
} from './index';

import { 
  transformAndValidate,
  createPartialDto,
  mergeDtos,
  extractFields,
  omitFields,
  sanitizeDto,
  hasRequiredFields,
  getMissingFields
} from './utils/dto.utils';

describe('Shared DTOs', () => {
  describe('User DTOs', () => {
    describe('CreateUserDto', () => {
      it('should validate valid user data', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test bio'
        };

        const result = await transformAndValidate(CreateUserDto, userData);
        expect(result.isValid).toBe(true);
        expect(result.data).toBeInstanceOf(CreateUserDto);
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
        expect(result.errors[0].field).toBe('email');
      });

      it('should reject short password', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          password: '123'
        };

        const result = await transformAndValidate(CreateUserDto, userData);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toBe('password');
      });

      it('should accept optional fields', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        };

        const result = await transformAndValidate(CreateUserDto, userData);
        expect(result.isValid).toBe(true);
        expect(result.data?.firstName).toBeUndefined();
        expect(result.data?.lastName).toBeUndefined();
        expect(result.data?.bio).toBeUndefined();
      });
    });

    describe('UpdateUserDto', () => {
      it('should validate partial updates', async () => {
        const updateData = {
          firstName: 'Johnny',
          bio: 'Updated bio'
        };

        const result = await transformAndValidate(UpdateUserDto, updateData);
        expect(result.isValid).toBe(true);
        expect(result.data?.firstName).toBe('Johnny');
        expect(result.data?.bio).toBe('Updated bio');
      });

      it('should reject invalid email in updates', async () => {
        const updateData = {
          email: 'invalid-email'
        };

        const result = await transformAndValidate(UpdateUserDto, updateData);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('email');
      });
    });
  });

  describe('Challenge DTOs', () => {
    describe('CreateChallengeDto', () => {
      it('should validate valid challenge data', async () => {
        const challengeData = {
          title: 'Test Challenge',
          description: 'This is a test challenge description',
          difficulty: ChallengeDifficulty.MEDIUM,
          category: ChallengeCategory.LOGIC,
          points: 100,
          timeLimit: 300,
          hint: 'Think about it',
          tags: ['test', 'logic']
        };

        const result = await transformAndValidate(CreateChallengeDto, challengeData);
        expect(result.isValid).toBe(true);
        expect(result.data?.difficulty).toBe(ChallengeDifficulty.MEDIUM);
        expect(result.data?.category).toBe(ChallengeCategory.LOGIC);
      });

      it('should reject invalid difficulty', async () => {
        const challengeData = {
          title: 'Test Challenge',
          description: 'This is a test challenge description',
          difficulty: 'invalid',
          category: ChallengeCategory.LOGIC,
          points: 100,
          timeLimit: 300
        };

        const result = await transformAndValidate(CreateChallengeDto, challengeData);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('difficulty');
      });

      it('should reject negative points', async () => {
        const challengeData = {
          title: 'Test Challenge',
          description: 'This is a test challenge description',
          difficulty: ChallengeDifficulty.EASY,
          category: ChallengeCategory.PUZZLE,
          points: -10,
          timeLimit: 300
        };

        const result = await transformAndValidate(CreateChallengeDto, challengeData);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('points');
      });
    });
  });

  describe('Submission DTOs', () => {
    describe('CreateSubmissionDto', () => {
      it('should validate valid submission data', async () => {
        const submissionData = {
          sessionId: 'session-123',
          challengeId: 'challenge-456',
          userId: 1,
          answer: 'correct_answer',
          type: SubmissionType.PUZZLE,
          timeSpent: 120,
          metadata: ['attempt1', 'attempt2']
        };

        const result = await transformAndValidate(CreateSubmissionDto, submissionData);
        expect(result.isValid).toBe(true);
        expect(result.data?.type).toBe(SubmissionType.PUZZLE);
      });

      it('should reject invalid submission type', async () => {
        const submissionData = {
          sessionId: 'session-123',
          challengeId: 'challenge-456',
          userId: 1,
          answer: 'correct_answer',
          type: 'invalid_type'
        };

        const result = await transformAndValidate(CreateSubmissionDto, submissionData);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('type');
      });
    });
  });

  describe('Leaderboard DTOs', () => {
    describe('CreateLeaderboardEntryDto', () => {
      it('should validate valid leaderboard entry', async () => {
        const entryData = {
          userId: 1,
          username: 'testuser',
          totalScore: 1000,
          totalChallenges: 10,
          completedChallenges: 8,
          successRate: 80,
          avatar: 'avatar.jpg',
          country: 'US'
        };

        const result = await transformAndValidate(CreateLeaderboardEntryDto, entryData);
        expect(result.isValid).toBe(true);
        expect(result.data?.successRate).toBe(80);
      });

      it('should reject success rate over 100', async () => {
        const entryData = {
          userId: 1,
          username: 'testuser',
          totalScore: 1000,
          totalChallenges: 10,
          completedChallenges: 8,
          successRate: 150
        };

        const result = await transformAndValidate(CreateLeaderboardEntryDto, entryData);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('successRate');
      });
    });
  });

  describe('DTO Utilities', () => {
    describe('transformAndValidate', () => {
      it('should handle null input', async () => {
        const result = await transformAndValidate(CreateUserDto, null);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('unknown');
      });

      it('should handle undefined input', async () => {
        const result = await transformAndValidate(CreateUserDto, undefined);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].field).toBe('unknown');
      });
    });

    describe('createPartialDto', () => {
      it('should create partial DTO', () => {
        const partialData = { username: 'testuser' };
        const result = createPartialDto(UserDto, partialData);
        expect(result.username).toBe('testuser');
        expect(result.email).toBeUndefined();
      });
    });

    describe('mergeDtos', () => {
      it('should merge multiple DTOs', () => {
        const base = { username: 'testuser', email: 'test@example.com' };
        const updates = { firstName: 'John', lastName: 'Doe' };
        
        const result = mergeDtos(UserDto, base, updates);
        expect(result.username).toBe('testuser');
        expect(result.email).toBe('test@example.com');
        expect(result.firstName).toBe('John');
        expect(result.lastName).toBe('Doe');
      });
    });

    describe('extractFields', () => {
      it('should extract specific fields', () => {
        const user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        };

        const result = extractFields(user, ['username', 'email']);
        expect(result.username).toBe('testuser');
        expect(result.email).toBe('test@example.com');
        expect((result as any).password).toBeUndefined();
      });
    });

    describe('omitFields', () => {
      it('should omit specific fields', () => {
        const user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        };

        const result = omitFields(user, ['password', 'id']);
        expect(result.username).toBe('testuser');
        expect(result.email).toBe('test@example.com');
        expect((result as any).password).toBeUndefined();
        expect((result as any).id).toBeUndefined();
      });
    });

    describe('sanitizeDto', () => {
      it('should remove null and undefined values', () => {
        const user = {
          username: 'testuser',
          email: 'test@example.com',
          firstName: null,
          lastName: undefined,
          bio: ''
        };

        const result = sanitizeDto(user);
        expect(result.username).toBe('testuser');
        expect(result.email).toBe('test@example.com');
        expect(result.bio).toBe('');
        expect((result as any).firstName).toBeUndefined();
        expect((result as any).lastName).toBeUndefined();
      });
    });

    describe('hasRequiredFields', () => {
      it('should check for required fields', () => {
        const user = {
          username: 'testuser',
          email: 'test@example.com'
        };

        const hasRequired = hasRequiredFields(user, ['username', 'email']);
        expect(hasRequired).toBe(true);

        const missingRequired = hasRequiredFields(user, ['username', 'email', 'password']);
        expect(missingRequired).toBe(false);
      });
    });

    describe('getMissingFields', () => {
      it('should get missing required fields', () => {
        const user = {
          username: 'testuser',
          email: 'test@example.com'
        };

        const missing = getMissingFields(user, ['username', 'email', 'password']);
        expect(missing).toEqual(['password']);
      });
    });
  });

  describe('Enums', () => {
    it('should have correct challenge difficulty values', () => {
      expect(ChallengeDifficulty.EASY).toBe('easy');
      expect(ChallengeDifficulty.MEDIUM).toBe('medium');
      expect(ChallengeDifficulty.HARD).toBe('hard');
      expect(ChallengeDifficulty.EXPERT).toBe('expert');
    });

    it('should have correct challenge category values', () => {
      expect(ChallengeCategory.PUZZLE).toBe('puzzle');
      expect(ChallengeCategory.LOGIC).toBe('logic');
      expect(ChallengeCategory.MATH).toBe('math');
    });

    it('should have correct submission status values', () => {
      expect(SubmissionStatus.PENDING).toBe('pending');
      expect(SubmissionStatus.CORRECT).toBe('correct');
      expect(SubmissionStatus.INCORRECT).toBe('incorrect');
    });

    it('should have correct submission type values', () => {
      expect(SubmissionType.PUZZLE).toBe('puzzle');
      expect(SubmissionType.CHALLENGE).toBe('challenge');
      expect(SubmissionType.QUIZ).toBe('quiz');
    });
  });
}); 