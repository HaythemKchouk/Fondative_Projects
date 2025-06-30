/* eslint-disable perfectionist/sort-imports */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { Icon } from '@iconify/react';
import { Scrollbar } from 'src/components/scrollbar';

function fToNow(dateString: string | number | null) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

type NotificationItemProps = {
  id: string;
  type: string;
  title: string;
  isUnRead: boolean;
  description: string;
  avatarUrl: string | null;
  postedAt: string | number | null;
  commitUrl?: string | null;
  projectWebUrl?: string | null;
};

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<NotificationItemProps[]>([]);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalUnRead = notifications.filter((n) => n.isUnRead).length;

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnRead: false })));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchFailedPipelines = async () => {
      try {
        const token = 'glpat-SDBni-qYtBM1xP_6czHo'; // 🔒 Remplace par ton token personnel
        const headers = { Authorization: `Bearer ${token}` };

        // Étape 1 : Récupérer les groupes visibles par l'utilisateur
        const groupsRes = await axios.get<any[]>(
          'https://gitlab.com/api/v4/groups?min_access_level=30&per_page=100',
          { headers }
        );
        const groups = groupsRes.data;

        const allNotifications: NotificationItemProps[] = [];

        // Étape 2 : Pour chaque groupe, récupérer les projets
        for (const group of groups) {
          const projectsRes = await axios.get<any[]>(
            `https://gitlab.com/api/v4/groups/${group.id}/projects?per_page=100`,
            { headers }
          );
          const projects = projectsRes.data;

          // Étape 3 : Pour chaque projet, récupérer les pipelines échoués
          for (const project of projects) {
            try {
              const pipelinesRes = await axios.get<any[]>(
                `https://gitlab.com/api/v4/projects/${project.id}/pipelines?status=failed&per_page=5`,
                { headers }
              );

              const failed = pipelinesRes.data.map((pipeline) => ({
                id: String(pipeline.id),
                type: 'Pipeline failed',
                title: `Pipeline #${pipeline.id}`,
                description: `Status: ${pipeline.status} — Project: ${project.name}`,
                avatarUrl: null,
                postedAt: pipeline.updated_at,
                isUnRead: true,
                commitUrl: `${project.web_url}/-/pipelines/${pipeline.id}`,
                projectWebUrl: project.web_url,
              }));

              allNotifications.push(...failed);
            } catch (err: any) {
              console.error(`Erreur sur le projet ${project.name} : ${err.message}`);
            }
          }
        }

        if (isMounted) {
          setNotifications(allNotifications);
          setError(null);
        }
      } catch (err: any) {
        console.error('Erreur globale :', err.message);
        if (isMounted) setError('Erreur lors de la récupération des notifications');
      }
    };

    fetchFailedPipelines();
    const intervalId = setInterval(fetchFailedPipelines, 30000); // actualisation toutes les 30s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color={openPopover ? 'primary' : 'default'}
          onClick={handleOpenPopover}
          size="large"
        >
          <Badge badgeContent={totalUnRead} color="error">
            <Icon icon="eva:bell-fill" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(openPopover)}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 600, maxHeight: 600 } }}
      >
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Notifications
          </Typography>
          {totalUnRead > 0 && (
            <Button color="inherit" size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {error && (
          <Box sx={{ p: 1, bgcolor: 'error.main', color: 'white' }}>
            {error}
          </Box>
        )}

        <Scrollbar sx={{ height: 500 }}>
          <List disablePadding>
            {notifications.length === 0 ? (
              <Typography sx={{ p: 2 }} align="center" color="text.secondary">
                Aucune notification d’échec pour le moment.
              </Typography>
            ) : (
              notifications.map((n, idx) => (
                <ListItemButton
                  key={`${n.id}-${idx}`}
                  sx={{
                    py: 1.5,
                    px: 2.5,
                    mt: '1px',
                    ...(n.isUnRead && { bgcolor: 'action.selected' }),
                  }}
                  onClick={() => {
                    const url = n.commitUrl ?? n.projectWebUrl;
                    if (url) window.open(url, '_blank');
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={n.avatarUrl || undefined} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        component="span"
                        sx={{ color: n.isUnRead ? 'text.primary' : 'text.secondary' }}
                      >
                        {n.title} - {n.type}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          component="span"
                          sx={{ color: n.isUnRead ? 'text.primary' : 'text.secondary' }}
                          noWrap
                        >
                          {n.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          component="span"
                          sx={{ color: 'text.disabled', display: 'block' }}
                        >
                          {fToNow(n.postedAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItemButton>
              ))
            )}
          </List>
        </Scrollbar>
      </Popover>
    </>
  );
}
