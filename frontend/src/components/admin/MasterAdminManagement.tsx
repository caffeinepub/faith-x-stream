import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Crown, Shield, User, UserX, ChevronUp, ChevronDown, Loader2, Users } from 'lucide-react';
import { UserInfo } from '../../backend';
import { Principal } from '@dfinity/principal';

function getRoleBadge(role: string) {
  switch (role) {
    case 'masterAdmin':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
          <Crown className="w-3 h-3" />
          Master Admin
        </Badge>
      );
    case 'admin':
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1">
          <Shield className="w-3 h-3" />
          Admin
        </Badge>
      );
    case 'user':
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
          <User className="w-3 h-3" />
          User
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <User className="w-3 h-3" />
          Guest
        </Badge>
      );
  }
}

export default function MasterAdminManagement() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: users = [], isLoading } = useQuery<UserInfo[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const promoteToAdmin = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      showFeedback('success', 'User promoted to Admin successfully.');
    },
    onError: (err: any) => {
      showFeedback('error', err?.message || 'Failed to promote user.');
    },
  });

  const demoteFromAdmin = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      showFeedback('success', 'Admin demoted to User successfully.');
    },
    onError: (err: any) => {
      showFeedback('error', err?.message || 'Failed to demote admin.');
    },
  });

  const promoteToMasterAdmin = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.promoteToMasterAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      showFeedback('success', 'User promoted to Master Admin successfully.');
    },
    onError: (err: any) => {
      showFeedback('error', err?.message || 'Failed to promote to Master Admin.');
    },
  });

  const demoteFromMasterAdmin = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.demoteFromMasterAdmin(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      showFeedback('success', 'Master Admin demoted successfully.');
    },
    onError: (err: any) => {
      showFeedback('error', err?.message || 'Failed to demote Master Admin.');
    },
  });

  const handleAction = async (action: string, principal: Principal) => {
    const key = `${action}-${principal.toString()}`;
    setActionLoading(key);
    try {
      if (action === 'promoteToAdmin') await promoteToAdmin.mutateAsync(principal);
      else if (action === 'demoteFromAdmin') await demoteFromAdmin.mutateAsync(principal);
      else if (action === 'promoteToMasterAdmin') await promoteToMasterAdmin.mutateAsync(principal);
      else if (action === 'demoteFromMasterAdmin') await demoteFromMasterAdmin.mutateAsync(principal);
    } finally {
      setActionLoading(null);
    }
  };

  const isActionLoading = (action: string, principal: Principal) =>
    actionLoading === `${action}-${principal.toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage user roles and access permissions</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Registered Users ({isLoading ? '...' : users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No registered users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Principal</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const roleStr = typeof user.role === 'object' ? Object.keys(user.role)[0] : String(user.role);
                    const principalObj = user.principal as unknown as Principal;
                    const principalStr = principalObj.toString();

                    return (
                      <TableRow key={principalStr} className="border-border/50 hover:bg-muted/20">
                        <TableCell className="font-medium text-foreground">
                          {user.displayName || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.email || '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {principalStr.slice(0, 12)}...
                        </TableCell>
                        <TableCell>{getRoleBadge(roleStr)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {roleStr === 'user' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                  disabled={isActionLoading('promoteToAdmin', principalObj)}
                                  onClick={() => handleAction('promoteToAdmin', principalObj)}
                                >
                                  {isActionLoading('promoteToAdmin', principalObj) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <ChevronUp className="w-3 h-3 mr-1" />
                                      Make Admin
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {roleStr === 'admin' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                                  disabled={isActionLoading('promoteToMasterAdmin', principalObj)}
                                  onClick={() => handleAction('promoteToMasterAdmin', principalObj)}
                                >
                                  {isActionLoading('promoteToMasterAdmin', principalObj) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Crown className="w-3 h-3 mr-1" />
                                      Make Master
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                                  disabled={isActionLoading('demoteFromAdmin', principalObj)}
                                  onClick={() => handleAction('demoteFromAdmin', principalObj)}
                                >
                                  {isActionLoading('demoteFromAdmin', principalObj) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      Demote
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {roleStr === 'masterAdmin' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    disabled={isActionLoading('demoteFromMasterAdmin', principalObj)}
                                  >
                                    {isActionLoading('demoteFromMasterAdmin', principalObj) ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        Demote Master
                                      </>
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Demote Master Admin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove Master Admin privileges from{' '}
                                      <strong>{user.displayName || principalStr}</strong>. They will retain Admin access.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleAction('demoteFromMasterAdmin', principalObj)}
                                    >
                                      Demote
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {(roleStr === 'guest') && (
                              <span className="text-xs text-muted-foreground italic">No actions</span>
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
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <Crown className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Role Hierarchy</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="text-yellow-400 font-medium">Master Admin</span> — Full platform control, can manage all admins and users</p>
                <p><span className="text-blue-400 font-medium">Admin</span> — Can manage content, ads, channels, brands, and analytics</p>
                <p><span className="text-green-400 font-medium">User</span> — Standard platform access, can watch content and manage profile</p>
                <p><span className="text-muted-foreground font-medium">Guest</span> — Limited access, no profile or premium features</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
