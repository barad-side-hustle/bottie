"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { AccountsController, type AccountWithLocations } from "@/lib/controllers";
import type { AccountFilters, AccountLocationFilters } from "@/lib/types";

export async function getAccountsWithLocations(
  accountFilters: AccountFilters = {},
  locationFilters: AccountLocationFilters = {}
): Promise<AccountWithLocations[]> {
  const { userId } = await getAuthenticatedUserId();

  const controller = new AccountsController(userId);
  return controller.getAccountsWithLocations(accountFilters, locationFilters);
}
