import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "name", "email"],
    });
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    res.status(400).json({
      message: "Password and Confirm Password does not match",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    await Users.create({
      name,
      email,
      password: hashedPassword,
    });
    res.json({
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findAll({
      where: {
        email: email,
      },
    });
    const match = await bcrypt.compare(password, user[0].password);
    if (!match) {
      res.status(400).json({ message: "Invalid Password" });
    }
    const userID = user[0].id;
    const userName = user[0].name;
    const userEmail = user[0].email;
    const accessToken = jwt.sign(
      { userID, userName, userEmail },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      { userID, userName, userEmail },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    await Users.update(
      {
        refresh_Token: refreshToken,
      },
      {
        where: {
          id: userID,
        },
      }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(200).json({ accessToken: accessToken });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: {
      refresh_Token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userID = user[0].id;
  await Users.update(
    {
      refresh_Token: null,
    },
    {
      where: {
        id: userID,
      },
    }
  );
  res.clearCookie("refreshToken");
  res.sendStatus(200);
};
