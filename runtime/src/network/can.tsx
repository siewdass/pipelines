import * as React from 'react'
import { useAuthentication } from './authentication'

interface CanProps {
	permission: 'read' | 'write';
	resource: string;
	children: React.ReactNode;
}

/**
 * RBAC Guard Component.
 * Renders children only if the logged user has the required permission 
 * for the specified resource.
 * 
 * Usage:
 * <Can permission="read" resource="users">
 *   <UserList />
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ permission, resource, children }) => {
	const { loggedUser } = useAuthentication()
	
	// If no user is logged, assume no access
	if (!loggedUser) return null
	
	const permissions = (loggedUser as any).permissions || {}
	
	// 1. Check for global admin wildcard "*"
	const globalPerms = permissions['*']
	if (globalPerms && globalPerms[permission]) return <>{children}</>
	
	// 2. Check for specific resource permission
	const resPerms = permissions[resource]
	if (resPerms && resPerms[permission]) return <>{children}</>
	
	// If no permission matches, result is private (null)
	return null
}
