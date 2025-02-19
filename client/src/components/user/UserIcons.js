import { Mail, Notifications } from '@mui/icons-material';
import { Avatar, Badge, Box, IconButton, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import UserMenu from './UserMenu';
import { useNavigate } from 'react-router-dom';

const UserIcons = () => {
  const {
    state: { currentUser },
  } = useValue();

  const [anchorUserMenu, setAnchorUserMenu] = useState(null);
  const navigate = useNavigate();

  return (
    <Box>
      <IconButton size="large" color="inherit">
        <Badge color="error" badgeContent={null} onClick={() => navigate('/dashboard/messages')}>
          <Mail />
        </Badge>
      </IconButton>
      <IconButton size="large" color="inherit">
        <Badge color="error" badgeContent={null} onClick={() => navigate('/dashboard/requests')}>
          <Notifications />
        </Badge>
      </IconButton>
      <Tooltip title="Open User Settings">
        <IconButton onClick={(e) => setAnchorUserMenu(e.currentTarget)}>
          <Avatar src={currentUser?.photoURL} alt={currentUser?.name}>
            {currentUser?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <UserMenu {...{ anchorUserMenu, setAnchorUserMenu }} />
    </Box>
  );
};

export default UserIcons;