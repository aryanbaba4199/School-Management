import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/*------------- ACL Types -------------*/

export type RoleName = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface ACLContextProps {
  userRole: RoleName | null;
  accessList: string[];
  hasAccess: (allowedRoles?: RoleName[], requiredAccess?: string[]) => boolean;
}

const ACLContext = createContext<ACLContextProps | undefined>(undefined);

/*------------- ACL Provider Component -------------*/

interface ACLProviderProps {
  children: ReactNode;
  userRole: RoleName | null;
  accessList: string[];
}

export function ACLProvider({ children, userRole, accessList }: ACLProviderProps) {
  const hasAccess = (allowedRoles?: RoleName[], requiredAccess?: string[]): boolean => {
    // SUPER_ADMIN has global override access to everything
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    // Check role boundaries
    if (allowedRoles && allowedRoles.length > 0) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return false;
      }
    }

    // Check specific subscription feature access scopes
    if (requiredAccess && requiredAccess.length > 0) {
      // Check if accessList has 'ALL' (global tenant admin permission)
      if (accessList.includes('ALL')) {
        return true;
      }
      // Check if all required permissions are met
      return requiredAccess.every((scope) => accessList.includes(scope));
    }

    return true;
  };

  const contextValue = useMemo(() => ({
    userRole,
    accessList,
    hasAccess,
  }), [userRole, accessList]);

  return (
    <ACLContext.Provider value={contextValue}>
      {children}
    </ACLContext.Provider>
  );
}

/*------------- Custom useACL Hook -------------*/

export function useACL(): ACLContextProps {
  const context = useContext(ACLContext);
  if (!context) {
    throw new Error('useACL must be used within an ACLProvider');
  }
  return context;
}
