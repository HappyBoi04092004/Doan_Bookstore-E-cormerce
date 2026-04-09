import prisma from "../lib/prisma";
import bcrypt from "bcrypt";

export const userService = {
  // admin
  async getUsers(search: string = "", page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    // allow search in email OR name
    const whereClause = {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Omit passwords
    const safeUsers = users.map(({ password, ...user }) => ({
        ...user,
        role: user.role.name.toLowerCase()
    }));

    return { users: safeUsers, total, page, limit };
  },

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!user) return null;
    const { password, ...safeUser } = user;
    return { ...safeUser, role: safeUser.role.name.toLowerCase() };
  },

  async createUser(data: any) {
    // data.email, password, name, role (id or name)
    const { email, password, name, role, avatar } = data;
    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist) throw new Error("Email already exists");

    let roleRecord;
    if (role) {
      roleRecord = await prisma.role.findFirst({ where: { name: role.toUpperCase() } });
    } else {
      roleRecord = await prisma.role.findFirst({ where: { name: "USER" } });
    }

    if (!roleRecord) throw new Error("Role not found");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        roleId: roleRecord.id,
        avatar: avatar || null
      },
      include: { role: true }
    });

    const { password: _, ...safeUser } = user;
    return { ...safeUser, role: safeUser.role.name.toLowerCase() };
  },

  async updateUser(id: number, data: any) {
    const { email, password, name, role, avatar } = data;
    
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new Error("User not found");

    // Cleanup old avatar if update includes a new one - REMOVED

    if (email && email !== userToUpdate.email) {
      const exist = await prisma.user.findUnique({ where: { email } });
      if (exist) throw new Error("Email already exists");
    }

    const updateData: any = { };
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      const roleRecord = await prisma.role.findFirst({ where: { name: role.toUpperCase() } });
      if (roleRecord) updateData.roleId = roleRecord.id;
    }
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });

    const { password: _, ...safeUser } = user;
    return { ...safeUser, role: safeUser.role.name.toLowerCase() };
  },

  async deleteUser(id: number) {
     // Deletion REMAINS in folder - REMOVED AS PER USER REQUEST
     await prisma.user.delete({ where: { id } });
     return true;
  },

  // user profile self-update
  async updateProfile(id: number, data: any) {
    const { email, password, name, avatar } = data;
    
    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) throw new Error("User not found");

    // Cleanup old avatar if update includes a new one - REMOVED

    if (email && email !== userToUpdate.email) {
      const exist = await prisma.user.findUnique({ where: { email } });
      if (exist) throw new Error("Email already exists");
    }

    const updateData: any = { };
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });

    const { password: _, ...safeUser } = user;
    return { ...safeUser, role: safeUser.role.name.toLowerCase() };
  }
};
