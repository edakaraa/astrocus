import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteUser = vi.fn();
const getUserById = vi.fn();

vi.mock("../lib/supabaseAdmin", () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        deleteUser,
        getUserById,
      },
    },
  },
}));

describe("deleteAuthUserPermanently", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls admin deleteUser with hard delete and verifies removal", async () => {
    deleteUser.mockResolvedValue({ error: null });
    getUserById.mockResolvedValue({ data: { user: null }, error: { message: "User not found" } });

    const { deleteAuthUserPermanently } = await import("./accountDeletion");
    await deleteAuthUserPermanently("user-123");

    expect(deleteUser).toHaveBeenCalledWith("user-123", false);
    expect(getUserById).toHaveBeenCalledWith("user-123");
  });

  it("throws when auth user still exists after delete", async () => {
    deleteUser.mockResolvedValue({ error: null });
    getUserById.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });

    const { deleteAuthUserPermanently } = await import("./accountDeletion");

    await expect(deleteAuthUserPermanently("user-123")).rejects.toThrow(/still exists/i);
  });
});
