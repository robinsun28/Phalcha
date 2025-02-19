import deleteImages from './utils/deleteImages';
import fetchData from './utils/fetchData';

const url = process.env.REACT_APP_SERVER_URL + '/room';

export const createRoom = async (room, currentUser, dispatch) => {
  dispatch({ type: 'START_LOADING' });

  const result = await fetchData(
    { url, body: room, token: currentUser?.token },
    dispatch
  );
  if (result) {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'success',
        message: 'The room has been added',
      },
    });
    clearRoom(dispatch, currentUser);
    dispatch({ type: 'UPDATE_SECTION', payload: 0 });
    dispatch({ type: 'UPDATE_ROOM', payload: result });
  }

  dispatch({ type: 'END_LOADING' });
};

export const getDashboardRooms = async(dispatch, currentUser) => {
  const result = await fetchData({ url: url, method: 'GET', token: currentUser?.token }, dispatch);
  if(result) {
    return result;
  }
  return [];
} 

export const getRooms = async (dispatch, currentUser, option = '', cosine = '') => {
  dispatch({ type: 'START_LOADING' });

  let roomUrl = url;
  //for normal stuff
  if(currentUser?.token && option) {
    //for history 
    roomUrl = `${url}?option=${option}&userId=${cosine}`;
  }
  // constant result aune bela = await fetchData({ url, method: 'GET' }, dispatch);

  const result = await fetchData({ url: roomUrl, method: 'GET', token: currentUser?.token }, dispatch);

  if (result) {
    dispatch({ type: 'UPDATE_ROOMS', payload: result });
  }
  dispatch({ type: 'END_LOADING' });
};

export const getCosineSimilarities = async (currentUser) => {
  
  let similarityUrl = `${url}/similarities`;
  
  const result = await fetchData({ url: similarityUrl, method: 'GET', token: currentUser?.token });

  return result;
  
};


export const deleteRoom = async (room, currentUser, dispatch) => {
  dispatch({ type: 'START_LOADING' });

  const result = await fetchData(
    { url: `${url}/${room._id}`, method: 'DELETE', token: currentUser?.token },
    dispatch
  );
  if (result) {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'success',
        message: 'The room has been deleted',
      },
    });

    dispatch({ type: 'DELETE_ROOM', payload: result._id });
    deleteImages(room.images, room.uid);
  }

  dispatch({ type: 'END_LOADING' });
};

export const updateRoom = async (
  room,
  currentUser,
  dispatch,
  updatedRoom,
  deletedImages
) => {
  dispatch({ type: 'START_LOADING' });

  const result = await fetchData(
    {
      url: `${url}/${updatedRoom._id}`,
      method: 'PATCH',
      body: room,
      token: currentUser?.token,
    },
    dispatch
  );
  if (result) {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: true,
        severity: 'success',
        message: 'The room has been updated',
      },
    });

    clearRoom(dispatch, currentUser, deletedImages, updatedRoom);
    dispatch({ type: 'UPDATE_SECTION', payload: 0 });
    dispatch({ type: 'UPDATE_ROOM', payload: result });
  }

  dispatch({ type: 'END_LOADING' });
};

export const clearRoom = (
  dispatch,
  currentUser,
  images = [],
  updatedRoom = null
) => {
  dispatch({ type: 'RESET_ROOM' });
  localStorage.removeItem(currentUser.id);
  if (updatedRoom) {
    deleteImages(images, updatedRoom.uid);
  } else {
    deleteImages(images, currentUser.id);
  }
};

export const storeRoom = (
  location,
  details,
  images,
  updatedRoom,
  deletedImages,
  addedImages,
  userId
) => {
  if (
    location.lng ||
    location.lat ||
    details.price ||
    details.title ||
    details.description ||
    images.length
  ) {
    localStorage.setItem(
      userId,
      JSON.stringify({
        location,
        details,
        images,
        updatedRoom,
        deletedImages,
        addedImages,
      })
    );
    return true;
  } else {
    return false;
  }
};