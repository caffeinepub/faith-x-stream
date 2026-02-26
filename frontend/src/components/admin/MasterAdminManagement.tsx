import { useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, User, Loader2, RefreshCw, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import {
  useGetAllUsers,
  usePromoteToAdmin,
  usePromoteToMasterAdmin,
  useDemoteFromAdmin,
  useDemoteFromMasterAdmin,
} from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { UserInfo } from '../../backend';
import type { Principal } from '@icp-sdk/core/principal';

function getRoleBadge(role: UserInfo['role']) {
  switch (role) {
    case 'masterAdmin':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 gap-1">
          <Crown className="h-3 w-3" />
          Master Admin
        </Badge>
      );
    case 'admin':
      return (
        <Badge className="bg-primary/20 text-primary border border-primary/40 gap-1">
          <ShieldCheck className="h-3 w-3" />
          Admin
        </Badge>
      );
    case 'user':
      return (
        <Badge variant="secondary" className="gap-1">
          <User className="h-3 w-3" />
          User
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <User className="h-3 w-3" />
          Guest
        </Badge>
      );
  }
}

export default function MasterAdminManagement() {
  const { identity } = useInternetIdentity();
  const { data: users, isLoading, error, refetch, isFetching } = useGetAllUsers();
  const promoteToAdmin = usePromoteToAdmin();
  const promoteToMasterAdmin = usePromoteToMasterAdmin();
  const demoteFromAdmin = useDemoteFromAdmin();
  const demoteFromMasterAdmin = useDemoteFromMasterAdmin();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleAction = async (
    action: () => Promise<void>,
    successMsg: string
  ) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await action();
      setActionSuccess(successMsg);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      setActionError(msg);
      setTimeout(() => setActionError(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load users. You may not have Master Admin privileges.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-yellow-500/30 bg-gradient-to-br from-black/60 to-yellow-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-yellow-400">Master Admin — User Management</CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Manage user roles across the platform. Promote users to Admin or Master Admin, and demote as needed.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionSuccess && (
            <Alert className="border-green-500/40 bg-green-500/10">
              <AlertDescription className="text-green-400">{actionSuccess}</AlertDescription>
            </Alert>
          )}
          {actionError && (
            <Alert variant="destructive">
              <AlertDescription>{actionError}</AlertDescription>
            </Alert>
          )}

          {!users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No registered users found.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-500/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-yellow-500/20 bg-yellow-950/20">
                    <TableHead className="text-yellow-400/80">Display Name</TableHead>
                    <TableHead className="text-yellow-400/80">Email</TableHead>
                    <TableHead className="text-yellow-400/80">Principal</TableHead>
                    <TableHead className="text-yellow-400/80">Role</TableHead>
                    <TableHead className="text-yellow-400/80 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const principalStr = user.principal.toString();
                    const isCurrentUser = principalStr === currentPrincipal;
                    const isMasterAdmin = user.role === 'masterAdmin';
                    const isAdmin = user.role === 'admin';
                    const isUser = user.role === 'user';

                    return (
                      <TableRow
                        key={principalStr}
                        className="border-yellow-500/10 hover:bg-yellow-950/10"
                      >
                        <TableCell className="font-medium">
                          {user.displayName || '—'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-yellow-400/60">(you)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.email || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono max-w-[120px] truncate">
                          {principalStr}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* Promote to Admin (only for regular users) */}
                            {isUser && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/40 text-primary hover:bg-primary/10 text-xs"
                                disabled={
                                  promoteToAdmin.isPending
                                }
                                onClick={() =>
                                  handleAction(
                                    () => promoteToAdmin.mutateAsync(user.principal as Principal),
                                    `${user.displayName || principalStr} promoted to Admin.`
                                  )
                                }
                              >
                                {promoteToAdmin.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ShieldCheck className="h-3 w-3" />
                                )}
                                <span className="ml-1">Make Admin</span>
                              </Button>
                            )}

                            {/* Promote to Master Admin (for users and admins) */}
                            {(isUser || isAdmin) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                                disabled={promoteToMasterAdmin.isPending}
                                onClick={() =>
                                  handleAction(
                                    () => promoteToMasterAdmin.mutateAsync(user.principal as Principal),
                                    `${user.displayName || principalStr} promoted to Master Admin.`
                                  )
                                }
                              >
                                {promoteToMasterAdmin.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Crown className="h-3 w-3" />
                                )}
                                <span className="ml-1">Make Master Admin</span>
                              </Button>
                            )}

                            {/* Demote Admin to User */}
                            {isAdmin && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                                disabled={demoteFromAdmin.isPending}
                                onClick={() =>
                                  handleAction(
                                    () => demoteFromAdmin.mutateAsync(user.principal as Principal),
                                    `${user.displayName || principalStr} demoted to User.`
                                  )
                                }
                              >
                                {demoteFromAdmin.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ShieldOff className="h-3 w-3" />
                                )}
                                <span className="ml-1">Demote to User</span>
                              </Button>
                            )}

                            {/* Demote Master Admin (cannot demote yourself) */}
                            {isMasterAdmin && !isCurrentUser && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs"
                                disabled={demoteFromMasterAdmin.isPending}
                                onClick={() =>
                                  handleAction(
                                    () => demoteFromMasterAdmin.mutateAsync(user.principal as Principal),
                                    `${user.displayName || principalStr} demoted from Master Admin.`
                                  )
                                }
                              >
                                {demoteFromMasterAdmin.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ShieldOff className="h-3 w-3" />
                                )}
                                <span className="ml-1">Demote Master Admin</span>
                              </Button>
                            )}

                            {/* No actions for current master admin user (yourself) */}
                            {isMasterAdmin && isCurrentUser && (
                              <span className="text-xs text-muted-foreground italic">
                                (your account)
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Total registered users: <span className="text-yellow-400 font-medium">{users?.length ?? 0}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
