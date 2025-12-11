import type { Account as DrizzleAccount, AccountInsert } from "@/lib/db/schema";
import { Location, AccountLocation } from "./location.types";

export type Account = DrizzleAccount;
export type AccountCreate = Omit<AccountInsert, "id" | "connectedAt" | "lastSynced">;
export type AccountUpdate = Partial<Pick<AccountInsert, "googleRefreshToken" | "lastSynced" | "googleAccountName">>;

export interface AccountWithLocations extends Account {
  accountLocations: Array<
    AccountLocation & {
      location: Location;
    }
  >;
}
