import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); //code not optimized 

const auth = async (req, res, next) => {
  try {
    if(!req.headers.authorization) {
      throw new Error('You are not authorized!');
    }
    const token = req.headers.authorization.split(' ')[1];
    const googleToken = token.length > 1000;
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
        role: 'basic',
      };
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { id, name, photoURL, role } = decodedToken;
      req.user = { id, name, photoURL, role };
    }
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid token!',
    });
  }
};

export default auth;

//google auth not needed, can be removed