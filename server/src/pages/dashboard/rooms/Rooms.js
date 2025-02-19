import {
  Avatar,
  Card,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Rating,
  Tooltip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useValue } from '../../../context/ContextProvider';
import { StarBorder } from '@mui/icons-material';
import RoomsActions from './RoomsActions';
import { getDashboardRooms } from '../../../actions/room';

const Rooms = () => {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();

  const [rooms, setRooms] = useState([]);

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      const fetchedRooms = await getDashboardRooms(dispatch, currentUser);
      setRooms(fetchedRooms); // Store in local state
    };
    fetchRooms();
  }, [dispatch, currentUser]);

  return (
    <Container>
      <ImageList
        gap={12}
        sx={{
          mb: 8,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important',
        }}
      >
        {rooms.map((room) => (
          <Card key={room._id} sx={{ maxHeight: 400 }}>
            <ImageListItem sx={{ height: '100% !important', position: 'relative' }}>
              <ImageListItemBar
                sx={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
                title={room.price === 0 ? 'Free Stay' : '$' + room.price}
                actionIcon={
                  <Tooltip title={room.uName} sx={{ mr: '5px' }}>
                    <Avatar src={room.uPhoto} />
                  </Tooltip>
                }
                position="top"
              />
              <img
                src={room.images[0]}
                alt={room.title}
                loading="lazy"
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch({ type: 'UPDATE_ROOM', payload: room })}
              />
              <ImageListItemBar
                sx={{ mb: 4 }}
                title={room.title}
                actionIcon={
                  <Rating
                    sx={{ color: 'rgba(255,255,255, 0.8)', mr: '5px' }}
                    name="room-rating"
                    defaultValue={3.5}
                    precision={0.5}
                    emptyIcon={<StarBorder sx={{ color: 'rgba(255,255,255, 0.8)' }} />}
                  />
                }
              />
              {currentUser.role.toLowerCase() === 'admin' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <RoomsActions params={{ row: room }} />
                </div>
              )}
            </ImageListItem>
          </Card>
        ))}
      </ImageList>
    </Container>
  );
};

export default Rooms;