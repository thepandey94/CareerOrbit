import prisma from "../db";

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export interface UpdateProfileParams {
  fullName: string;
  course: string;
  branch: string;
  semester: number;
}

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userId: true,
        fullName: true,
        course: true,
        branch: true,
        semester: true,
        role: true,
        avatarUrl: true,
        userIdChangedAt: true,
        accountStatus: true,
        deletionRequestedAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("User not found.");
    return user;
  }

  static async updateProfile(userId: string, params: UpdateProfileParams) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: params.fullName.trim(),
        course: params.course.trim(),
        branch: params.branch.trim(),
        semester: Number(params.semester),
      },
      select: {
        id: true,
        email: true,
        userId: true,
        fullName: true,
        course: true,
        branch: true,
        semester: true,
      },
    });

    return updated;
  }

  static validateAvatarUpload(mimeType: string, sizeBytes: number) {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(mimeType.toLowerCase())) {
      return {
        isValid: false,
        error: "Only JPEG, PNG, or WebP images are permitted for profile avatars.",
      };
    }

    if (sizeBytes > MAX_AVATAR_SIZE_BYTES) {
      return {
        isValid: false,
        error: "Profile image must be less than 2 MB in size.",
      };
    }

    return { isValid: true };
  }

  static async updateAvatarUrl(userId: string, avatarUrl: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });
  }
}
