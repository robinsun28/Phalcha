const tryCatch = (controller) => {
  return async (req, res) => {
    try {
      await controller(req, res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Server down, Please try again later!',
      });
    }
  };
};

export default tryCatch;

//esma tei if error occurs, it will be caught and send a response with status 500.....if no error occurs, it will execute the controller function