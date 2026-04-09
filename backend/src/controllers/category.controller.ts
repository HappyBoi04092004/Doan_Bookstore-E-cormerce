import { Request, Response } from "express";
import { categoryService } from "../services/category.service";

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const category = await categoryService.getCategoryById(id);
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : undefined;
    const category = await categoryService.createCategory(name, imagePath);
    res.status(201).json({ success: true, data: category, message: "Category created" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { name } = req.body;
    const imagePath = req.file ? `/uploads/categories/${req.file.filename}` : undefined;
    const category = await categoryService.updateCategory(id, name, imagePath);
    res.json({ success: true, data: category, message: "Category updated" });
  } catch (error: any) {
    const status = error.message === "Category not found" ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    await categoryService.deleteCategory(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    const status = error.message === "Category not found" ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};