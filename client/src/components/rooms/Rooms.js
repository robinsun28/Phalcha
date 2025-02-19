import React, { useState } from 'react';
import {
  Avatar,
  Card,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Rating,
  Tooltip,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useValue } from '../../context/ContextProvider';
import { StarBorder } from '@mui/icons-material';
import { getRooms, getCosineSimilarities } from '../../actions/room';

const Rooms = () => {
  const {
    state: { filteredRooms, currentUser },
    dispatch,
  } = useValue();

  const [sortOption, setSortOption] = useState('explore');
  const [cosineOption, setCosineOption] = useState('');
  const [cosineOptions, setCosineOptions] = useState([]); // Store similarity dropdown values

  // Fetch rooms based on the selected sort and cosine similarity
  const fetchRooms = async (sort, cosine) => {
    console.log(`Fetching rooms with: Sort = ${sort}, Cosine = ${cosine}`);
    await getRooms(dispatch, currentUser, sort, cosine);
  };

  // Handle sorting change
  const handleSortChange = async (event) => {
    const value = event.target.value;
    setSortOption(value);
    setCosineOption(''); // Reset cosine selection when sorting changes

    if (value === 'recommend') {
      try {
        const similarities = await getCosineSimilarities(currentUser);
        setCosineOptions(similarities);
      } catch (error) {
        console.error('Error fetching cosine similarities:', error);
        setCosineOptions([]);
      }
    } else {
      setCosineOptions([]);
    }

    // Fetch rooms
    fetchRooms(value, '');
  };

  // Handle cosine similarity selection
  const handleCosineChange = async (event) => {
    const value = event.target.value;
    setCosineOption(value);

    // Fetch rooms with selected similarity
    fetchRooms(sortOption, value);
  };

  return (
    <Container>
      {/* Sorting and Similarity Dropdowns */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        {/* Sorting Dropdown */}
        <Select value={sortOption} onChange={handleSortChange} sx={{ minWidth: 150 }}>
          <MenuItem value="recommend">Recommended</MenuItem>
          <MenuItem value="history">History</MenuItem>
          <MenuItem value="explore">Explore</MenuItem>
        </Select>

        {/* Cosine Similarity Dropdown (Only visible if 'recommend' is selected) */}
        {sortOption === 'recommend' && cosineOptions.length > 0 && (
          <Select
            value={cosineOption}
            onChange={handleCosineChange}
            displayEmpty
            sx={{ minWidth: 180 }}
            renderValue={(selected) => {
              const selectedOption = cosineOptions.find((option) => option.userId === selected);
              return selectedOption ? `${selectedOption.name} (${selectedOption.similarity})` : 'Cosine Similarities';
            }}
          >
            {cosineOptions.map((option, index) => (
              <MenuItem key={option.name} value={option.userId}>
                {`${option.name} (${option.similarity})`}
              </MenuItem>
            ))}
          </Select>
        )}
      </Box>

      {/* Room List */}
      <ImageList
        gap={12}
        sx={{
          mb: 8,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important',
        }}
      >
        {filteredRooms.map((room) => (
          <Card key={room._id}>
            <ImageListItem sx={{ height: '100% !important' }}>
              <ImageListItemBar
                sx={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7)0%, rgba(0,0,0,0.3)70%, rgba(0,0,0,0)100%)',
                }}
                title={room.price === 0 ? 'Free Stay' : `$${room.price}`}
                actionIcon={
                  <Tooltip title={room.uName} sx={{ mr: '5px' }}>
                    <Avatar src={room.uPhoto} />
                  </Tooltip>
                }
                position="top"
              />
              <img
                src={room.images?.[0] || 'default-image.jpg'}
                alt={room.title || 'Room Image'}
                loading="lazy"
                style={{ cursor: 'pointer' }}
                onClick={() => dispatch({ type: 'UPDATE_ROOM', payload: room })}
              />
              <ImageListItemBar
                title={room.title}
                actionIcon={
                  <Rating
                    sx={{ color: 'rgba(255,255,255, 0.8)', mr: '5px' }}
                    name="room-rating"
                    defaultValue={room.rating}
                    precision={0.5}
                    emptyIcon={<StarBorder sx={{ color: 'rgba(255,255,255, 0.8)' }} />}
                  />
                }
              />
            </ImageListItem>
          </Card>
        ))}
      </ImageList>
    </Container>
  );
};

export default Rooms;