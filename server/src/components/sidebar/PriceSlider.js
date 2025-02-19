import { Box, Slider, Typography } from '@mui/material';
import React from 'react';
import { useValue } from '../../context/ContextProvider';

const marks = [
  { value: 0, label: 'Rs 0' },
  { value: 100, label: 'Rs 100' },
  { value: 200, label: 'Rs 200' },
];

const PriceSlider = () => {
  const {
    state: { priceFilter },
    dispatch,
  } = useValue();
  return (
    <Box sx={{ mt: 5 }}>
      <Typography>Max Price: {'Rs ' + priceFilter}</Typography>
      <Slider
        min={0}
        max={200}
        defaultValue={50}
        valueLabelDisplay="auto"
        marks={marks}
        value={priceFilter}
        onChange={(e, price) =>
          dispatch({ type: 'FILTER_PRICE', payload: price })
        }
      />
    </Box>
  );
};

export default PriceSlider;