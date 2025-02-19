import { Box, IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, Preview } from '@mui/icons-material';
import { useValue } from '../../../context/ContextProvider';
import { clearRoom, deleteRoom, getRooms } from '../../../actions/room';
import { useNavigate } from 'react-router-dom';

const RoomsActions = ({ params }) => {
  const { _id, lng, lat, price, title, description, images, uid } = params.row;
  const {
    dispatch,
    state: { currentUser, updatedRoom, addedImages, images: newImages },
  } = useValue();

  const navigate = useNavigate();

  const handleEdit = () => {
    if (updatedRoom) {
      clearRoom(dispatch, currentUser, addedImages, updatedRoom);
    } else {
      clearRoom(dispatch, currentUser, newImages);
    }
    dispatch({ type: 'UPDATE_LOCATION', payload: { lng, lat } });
    dispatch({
      type: 'UPDATE_DETAILS',
      payload: { price, title, description },
    });
    dispatch({ type: 'UPDATE_IMAGES', payload: images });
    dispatch({ type: 'UPDATE_UPDATED_ROOM', payload: { _id, uid } });
    dispatch({ type: 'UPDATE_SECTION', payload: 2 });
    navigate('/');
  };

  const handleDelete = async () => {
    try {
      // Delete the room
      await deleteRoom(params.row, currentUser, dispatch);

      // Fetch rooms again to update the list
      await getRooms(dispatch, currentUser);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  return (
    <Box>
      <Tooltip title="View room details">
        <IconButton
          onClick={() => dispatch({ type: 'UPDATE_ROOM', payload: params.row })}
        >
          <Preview sx={{ color: 'rgba(255,255,255, 0.8)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit this room">
        <IconButton onClick={handleEdit}>
          <Edit sx={{ color: 'rgba(255,255,255, 0.8)' }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete this room">
        <IconButton onClick={handleDelete}>
          <Delete sx={{ color: 'rgba(255,255,255, 0.8)' }}/>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default RoomsActions;
