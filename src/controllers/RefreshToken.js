import Users from "../models/UserModel.js";
import jwt from "jsonwebtoken";

export const RefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const user = await Users.findOne({
      where: {
        refresh_Token: refreshToken,
      },
    });

    if (!user) return res.sendStatus(403);
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userID = user.id;
        const userName = user.name;
        const userEmail = user.email;
        const accessToken = jwt.sign(
          { userID, userName, userEmail },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "20s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.log(error);
  }
};
