import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const exist = await prisma.user.findUnique({ where: { email } });

    if (exist) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    // Default role "USER" depends on how it is seeded
    const roleRecord = await prisma.role.findFirst({ where: { name: "USER" } });
    if (!roleRecord) {
      res.status(500).json({ message: "Roles missing in DB. Did you run the seed?" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        roleId: roleRecord.id,
      },
      include: { role: true },
    });

    const { password: _, ...safeUser } = user;

    res.status(201).json({
      user: {
        ...safeUser,
        role: safeUser.role.name.toLowerCase()
      },
      message: "Register success",
    });
  } catch (error) {
    console.error("[register]", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing fields" });
      return;
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { role: true }
    });

    if (!user || !user.password) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Include the string role name so middleware works properly
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role.name.toLowerCase(),
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;

    res.json({
      user: {
        ...safeUser,
        role: safeUser.role.name.toLowerCase()
      },
      token,
    });
  } catch (error) {
    console.error("[login]", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.json({
      user: {
        ...safeUser,
        role: safeUser.role.name.toLowerCase()
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response): void => {
  // Stateless JWT: nothing to do on the server side except send success.
  res.json({ message: "Logged out successfully" });
};