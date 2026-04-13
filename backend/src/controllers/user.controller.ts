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
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const data = await userService.getUserById(id);
    if (!data) {
       res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
       return;
    }
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : undefined;
    const data = await userService.createUser({ ...req.body, avatar });
    res.status(201).json({ success: true, data, message: "Tạo người dùng thành công" });
  } catch (error: any) {
    if (error.message === "Email đã tồn tại" || error.message === "Không tìm thấy vai trò") {
      const msg = error.message;
      res.status(400).json({ success: false, message: msg });
      return;
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : undefined;
    const data = await userService.updateUser(id, { ...req.body, avatar });
    res.json({ success: true, data, message: "Cập nhật người dùng thành công" });
  } catch (error: any) {
    if (error.message === "User not found") {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    if (error.message === "Email already exists") {
      res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return;
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
   try {
     const id = parseInt(req.params.id as string);
     await userService.deleteUser(id);
     res.json({ success: true, message: "Xóa người dùng thành công" });
   } catch (error: any) {
     console.error("[deleteUser]", error);
     res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
   }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
       res.status(401).json({ success: false, message: "Chưa đăng nhập" });
       return;
    }
    // User can only update email, password, and name, and avatar
    const { email, password, name } = req.body;
    const avatar = req.file ? `/uploads/avatar/${req.file.filename}` : undefined;
    const data = await userService.updateProfile(req.user.id, { email, password, name, avatar });
    res.json({ success: true, data, message: "Cập nhật hồ sơ thành công" });
  } catch (error: any) {
    if (error.message === "Không tìm thấy người dùng") {
      res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });
      return;
    }
    if (error.message === "Email đã tồn tại") {
      res.status(400).json({ success: false, message: "Email đã tồn tại" });
      return;
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};
