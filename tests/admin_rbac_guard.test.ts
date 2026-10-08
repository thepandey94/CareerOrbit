import { describe, it, expect } from "vitest";
import { AdminService } from "../src/lib/services/admin-service";
import { Role } from "@prisma/client";

describe("Admin Authorization: RBAC & Initial Provisioning Guard", () => {
  it("should permit action when role is ADMIN", () => {
    expect(() => {
      AdminService.requireAdmin(Role.ADMIN);
    }).not.toThrow();
  });

  it("should throw HTTP 403 error when role is STUDENT or undefined", () => {
    expect(() => {
      AdminService.requireAdmin(Role.STUDENT);
    }).toThrowError(/Access denied/);

    expect(() => {
      AdminService.requireAdmin(undefined);
    }).toThrowError(/Access denied/);
  });
});
