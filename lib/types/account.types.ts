import type { GoogleAccount as DrizzleAccount, GoogleAccountInsert } from "@/lib/db/schema";
import { Location, AccountLocation } from "./location.types";

export type Account = DrizzleAccount;
export type AccountCreate = Omit<GoogleAccountInsert, "id" | "connectedAt" | "lastSynced">;
export type AccountUpdate = Partial<
  Pick<GoogleAccountInsert, "googleRefreshToken" | "lastSynced" | "googleAccountName">
>;

export interface AccountWithLocations extends Account {
  accountLocations: Array<
    AccountLocation & {
      location: Location;
    }
  >;
}
