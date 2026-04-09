import prisma from "../lib/prisma";

export const bookService = {
  // admin
  async getAdminBooks(search: string = "", page: number = 1, limit: number = 10, category?: string) {
    const skip = (page - 1) * limit;
    
    // search in title, optionally filter by category
    const whereClause: any = {
      title: { contains: search }
    };
    
    if (category) {
       whereClause.category = { name: { contains: category } };
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { category: true, author: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.book.count({ where: whereClause })
    ]);

    // Format books
    const safeBooks = books.map(book => ({
       ...book,
       category: book.category.name,
       author: book.author.name,
    }));

    return { books: safeBooks, total, page, limit };
  },

  async createBook(data: any) {
    const { title, author, price, stock, category, description, image } = data;
    
    if (!title || !author) throw new Error("Title and Author are required");
    if (price <= 0) throw new Error("Price must be > 0");
    if (stock < 0) throw new Error("Stock cannot be negative");
    if (!category) throw new Error("Category is required");

    let catRecord = await prisma.category.findFirst({ where: { name: category } });
    if (!catRecord) {
       catRecord = await prisma.category.create({ data: { name: category } });
    }

    let authorRecord = await prisma.author.findFirst({ where: { name: author } });
    if (!authorRecord) {
       authorRecord = await prisma.author.create({ data: { name: author } });
    }

    const book = await prisma.book.create({
      data: {
        title,
        authorId: authorRecord.id,
        price: parseInt(price),
        stock: parseInt(stock),
        categoryId: catRecord.id,
        description,
        image,
      },
      include: { category: true, author: true }
    });

    return { ...book, category: book.category.name, author: book.author.name };
  },

  async updateBook(id: number, data: any) {
    const { title, author, price, stock, category, description, image } = data;
    
    if (price && price <= 0) throw new Error("Price must be > 0");
    if (stock && stock < 0) throw new Error("Stock cannot be negative");

    const bookToUpdate = await prisma.book.findUnique({ where: { id } });
    if (!bookToUpdate) throw new Error("Book not found");

    // Handle old file deletion if new image is uploaded - REMOVED AS PER USER REQUEST

    let categoryId = bookToUpdate.categoryId;
    if (category) {
      let catRecord = await prisma.category.findFirst({ where: { name: category } });
      if (!catRecord) {
         catRecord = await prisma.category.create({ data: { name: category } });
      }
      categoryId = catRecord.id;
    }

    let authorId = bookToUpdate.authorId;
    if (author !== undefined) {
      let authorRecord = await prisma.author.findFirst({ where: { name: author } });
      if (!authorRecord) {
         authorRecord = await prisma.author.create({ data: { name: author } });
      }
      authorId = authorRecord.id;
    }

    const updateData: any = { categoryId, authorId };
    if (title) updateData.title = title;
    if (price !== undefined) updateData.price = parseInt(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const book = await prisma.book.update({
      where: { id },
      data: updateData,
      include: { category: true, author: true }
    });
    
    return { ...book, category: book.category.name, author: book.author.name };
  },

  async deleteBook(id: number) {
     const book = await prisma.book.findUnique({ where: { id } });
     // Deletion REMAINS in folder - REMOVED AS PER USER REQUEST
     await prisma.book.delete({ where: { id } });
     return true;
  },

};
