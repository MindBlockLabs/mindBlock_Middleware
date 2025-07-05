import { ForbiddenException } from '@nestjs/common';

export interface UserWithRole {
  role: string;
}

export interface RoleVerificationOptions {
  strict?: boolean;
}

/**
 * Verifies if a user has permission to perform an action based on their role
 * @param user - User object containing role information
 * @param allowedRoles - Array of roles that are allowed to perform the action
 * @param options - Configuration options for the verification
 * @returns boolean if strict=false, otherwise throws exception or returns true
 * @throws ForbiddenException if user role is not in allowedRoles and strict=true
 */
export function checkUserRole(
  user: UserWithRole,
  allowedRoles: string[],
  options: RoleVerificationOptions = { strict: true }
): boolean {
  // Validate inputs
  if (!user || typeof user.role !== 'string') {
    if (options.strict === false) {
      return false;
    }
    throw new ForbiddenException('Invalid user or missing role information');
  }

  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    if (options.strict === false) {
      return false;
    }
    throw new ForbiddenException('No allowed roles specified');
  }

  // Check if user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user.role);

  if (!hasPermission && options.strict !== false) {
    throw new ForbiddenException(
      `Access denied. Required roles: [${allowedRoles.join(', ')}]. User role: ${user.role}`
    );
  }

  return hasPermission;
}

/**
 * Convenience function for strict role checking (throws exception on failure)
 */
export function requireUserRole(
  user: UserWithRole,
  allowedRoles: string[]
): boolean {
  return checkUserRole(user, allowedRoles, { strict: true });
}

/**
 * Convenience function for non-strict role checking (returns boolean)
 */
export function hasUserRole(
  user: UserWithRole,
  allowedRoles: string[]
): boolean {
  return checkUserRole(user, allowedRoles, { strict: false });
}