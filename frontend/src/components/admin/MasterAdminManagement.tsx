import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetAllUsers,
  usePromoteToAdmin,
  usePromoteToMasterAdmin,
  useDemoteFromAdmin,
  useDemoteFromMasterAdmin,
} from '../../hooks/useQueries';
import { UserInfo, UserRole__1 } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, ShieldCheck, User, Loader2, RefreshCw } from 'lucide-react';

type ActionType = 'promoteToAdmin' | 'promoteToMasterAdmin' | 'demoteFromAdmin' | 'demoteFromMasterAdmin';

interface PendingAction {
  type: ActionType;
  user: UserInfo;
}

function getRoleBadgeVariant(role: UserRole__1): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'masterAdmin': return 'destructive';
    case 'admin': return 'default';
    case 'user': return 'secondary';
    default: return 'outline';
  }
}

function getRoleLabel(role: UserRole__1): string {
  switch (role) {
    case 'masterAdmin': return 'Master Admin';
    case 'admin': return 'Admin';
    case 'user': return 'User';
    case 'guest': return 'Guest';
    default: return 'Unknown';
  }
}

function getActionLabel(type: ActionType): string {
  switch (type) {
    case 'promoteToAdmin': return 'Promote to Admin';
    case 'promoteToMasterAdmin': return 'Promote to Master Admin';
    case 'demoteFromAdmin': return 'Demote to User';
    case 'demoteFromMasterAdmin': return 'Demote to Admin';
  }
}

function getActionDescription(type: ActionType, displayName: string): string {
  switch (type) {
    case 'promoteToAdmin':
      return `This will grant ${displayName} admin access to the admin panel and all content management features.`;
    case 'promoteToMasterAdmin':
      return `This will grant ${displayName} Master Admin status with full system access including user management.`;
    case 'demoteFromAdmin':
      return `This will remove ${displayName}'s admin access. They will become a regular user.`;
    case 'demoteFromMasterAdmin':
      return `This will remove ${displayName}'s Master Admin status. They will remain an admin.`;
  }
}

export default function MasterAdminManagement() {
  const { role: currentUserRole } = useAuth();
  const { data: users, isLoading, refetch, isRefetching } = useGetAllUsers();
  const promoteToAdmin = usePromoteToAdmin();
  const promoteToMasterAdmin = usePromoteToMasterAdmin();
  const demoteFromAdmin = useDemoteFromAdmin();
  const demoteFromMasterAdmin = useDemoteFromMasterAdmin();

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  if (currentUserRole !== 'masterAdmin') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Only Master Admins can access this section.</p>
        </div>
      </div>
    );
  }

  const handleAction = async () => {
    if (!pendingAction) return;
    const principal = Principal.fromText(pendingAction.user.principal.toString());

    try {
      switch (pendingAction.type) {
        case 'promoteToAdmin':
          await promoteToAdmin.mutateAsync(principal);
          break;
        case 'promoteToMasterAdmin':
          await promoteToMasterAdmin.mutateAsync(principal);
          break;
        case 'demoteFromAdmin':
          await demoteFromAdmin.mutateAsync(principal);
          break;
        case 'demoteFromMasterAdmin':
          await demoteFromMasterAdmin.mutateAsync(principal);
          break;
      }
    } catch (err) {
      console.error('Role action failed:', err);
    } finally {
      setPendingAction(null);
    }
  };

  const isActionLoading =
    promoteToAdmin.isPending ||
    promoteToMasterAdmin.isPending ||
    demoteFromAdmin.isPending ||
    demoteFromMasterAdmin.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            User Role Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles and permissions across the platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !users || users.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No registered users found.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.principal.toString()} className="hover:bg-muted/20">
                  <TableCell className="font-medium">
                    {user.displayName || '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.email || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
                    {user.principal.toString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role === 'user' || user.role === 'guest' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPendingAction({ type: 'promoteToAdmin', user })}
                          disabled={isActionLoading}
                        >
                          Promote to Admin
                        </Button>
                      ) : null}
                      {user.role === 'admin' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPendingAction({ type: 'promoteToMasterAdmin', user })}
                            disabled={isActionLoading}
                          >
                            Promote to Master Admin
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingAction({ type: 'demoteFromAdmin', user })}
                            disabled={isActionLoading}
                          >
                            Demote
                          </Button>
                        </>
                      ) : null}
                      {user.role === 'masterAdmin' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setPendingAction({ type: 'demoteFromMasterAdmin', user })}
                          disabled={isActionLoading}
                        >
                          Demote to Admin
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? getActionLabel(pendingAction.type) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? getActionDescription(pendingAction.type, pendingAction.user.displayName || 'this user')
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isActionLoading}
              className={
                pendingAction?.type === 'demoteFromAdmin' || pendingAction?.type === 'demoteFromMasterAdmin'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
