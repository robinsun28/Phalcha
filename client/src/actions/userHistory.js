import fetchData from './utils/fetchData';

const url = process.env.REACT_APP_SERVER_URL + '/userhistory';

export const createUserHistory = async (room, currentUser, dispatch) => {

  dispatch({ type: 'START_LOADING' });
  const result = await fetchData(
    { url: `${url}/${room._id}`, method: 'POST', token: currentUser?.token },
    dispatch
  );
  if (result) {
    dispatch({
      type: 'UPDATE_ALERT',
      payload: {
        open: false,
        severity: 'success',
        message: 'The user history has been added',
      },
    });
  }

  dispatch({ type: 'END_LOADING' });
};

export const getUserHistory = async (currentUser, dispatch) => {
    dispatch({ type: 'START_LOADING' });
    
    const result = await fetchData(
        { url, method: 'GET', token: currentUser?.token },
        dispatch
    );
    if (result) {
        dispatch({ type: 'GET_USER_HISTORY', payload: result });
    }
    
    dispatch({ type: 'END_LOADING' });
};