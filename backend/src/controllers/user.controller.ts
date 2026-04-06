import { Request, Response } from "express";
import { userService } from "../services/user.service";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string || "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await userService.getUsers(search, page, limit);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("[getUsers]", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await userService.getUserById(id);
    if (!data) {
       res.status(404).json({ success: false, message: "User not found" });
       return;
    }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await userService.createUser(req.body);
    res.status(201).json({ success: true, data, message: "User created" });
  } catch (error: any) {
    if (error.message === "Email already exists" || error.message === "Role not found") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await userService.updateUser(id, req.body);
    res.json({ success: true, data, message: "User updated" });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message === "Email already exists") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = parseInt(req.params.id as string);
     await userService.deleteUser(id);
     res.json({ success: true, message: "User deleted" });
   } catch (error: any) {
     console.error("[deleteUser]", error);
     res.status(500).json({ success: false, message: "Internal server error" });
   }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "Not authenticated" });
       return;
    }
    // User can only update email, password, and name
    const { email, password, name } = req.body;
    const data = await userService.updateProfile(req.user.id, { email, password, name });
    res.json({ success: true, data, message: "Profile updated successfully" });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ success: false, message: error.message });
      return;
    }
    if (error.message === "Email already exists") {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
