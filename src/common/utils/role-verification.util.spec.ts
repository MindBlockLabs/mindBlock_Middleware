import { ForbiddenException } from '@nestjs/common';
import {
  checkUserRole,
  requireUserRole,
  hasUserRole,
  UserWithRole,
} from './role-verification.util';

describe('RoleVerificationUtil', () => {
  const adminUser: UserWithRole = { role: 'admin' };
  const userRole: UserWithRole = { role: 'user' };
  const moderatorUser: UserWithRole = { role: 'moderator' };

  describe('checkUserRole', () => {
    describe('strict mode (default)', () => {
      it('should return true when user has allowed role', () => {
        expect(checkUserRole(adminUser, ['admin'])).toBe(true);
        expect(checkUserRole(userRole, ['user', 'admin'])).toBe(true);
      });

      it('should throw ForbiddenException when user role is not allowed', () => {
        expect(() => checkUserRole(userRole, ['admin'])).toThrow(ForbiddenException);
        expect(() => checkUserRole(adminUser, ['user', 'moderator'])).toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException with descriptive message', () => {
        expect(() => checkUserRole(userRole, ['admin'])).toThrow(
          'Access denied. Required roles: [admin]. User role: user'
        );
      });

      it('should work with multiple allowed roles', () => {
        expect(checkUserRole(adminUser, ['admin', 'moderator'])).toBe(true);
        expect(checkUserRole(moderatorUser, ['admin', 'moderator'])).toBe(true);
      });

      it('should throw ForbiddenException for invalid user input', () => {
        expect(() => checkUserRole(null as any, ['admin'])).toThrow(ForbiddenException);
        expect(() => checkUserRole({} as any, ['admin'])).toThrow(ForbiddenException);
        expect(() => checkUserRole({ role: null } as any, ['admin'])).toThrow(ForbiddenException);
      });

      it('should throw ForbiddenException for invalid allowedRoles input', () => {
        expect(() => checkUserRole(adminUser, [])).toThrow(ForbiddenException);
        expect(() => checkUserRole(adminUser, null as any)).toThrow(ForbiddenException);
      });
    });

    describe('non-strict mode', () => {
      it('should return true when user has allowed role', () => {
        expect(checkUserRole(adminUser, ['admin'], { strict: false })).toBe(true);
        expect(checkUserRole(userRole, ['user', 'admin'], { strict: false })).toBe(true);
      });

      it('should return false when user role is not allowed', () => {
        expect(checkUserRole(userRole, ['admin'], { strict: false })).toBe(false);
        expect(checkUserRole(adminUser, ['user', 'moderator'], { strict: false })).toBe(false);
      });

      it('should return false for invalid inputs instead of throwing', () => {
        expect(checkUserRole(null as any, ['admin'], { strict: false })).toBe(false);
        expect(checkUserRole({} as any, ['admin'], { strict: false })).toBe(false);
        expect(checkUserRole(adminUser, [], { strict: false })).toBe(false);
      });
    });
  });

  describe('requireUserRole', () => {
    it('should return true when user has allowed role', () => {
      expect(requireUserRole(adminUser, ['admin'])).toBe(true);
    });

    it('should throw ForbiddenException when user role is not allowed', () => {
      expect(() => requireUserRole(userRole, ['admin'])).toThrow(ForbiddenException);
    });
  });

  describe('hasUserRole', () => {
    it('should return true when user has allowed role', () => {
      expect(hasUserRole(adminUser, ['admin'])).toBe(true);
    });

    it('should return false when user role is not allowed', () => {
      expect(hasUserRole(userRole, ['admin'])).toBe(false);
    });

    it('should return false for invalid inputs', () => {
      expect(hasUserRole(null as any, ['admin'])).toBe(false);
    });
  });
});