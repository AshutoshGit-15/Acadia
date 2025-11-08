/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as alerts from "../alerts.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as auth from "../auth.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as deadlines from "../deadlines.js";
import type * as documents from "../documents.js";
import type * as emails from "../emails.js";
import type * as examSchedules from "../examSchedules.js";
import type * as http from "../http.js";
import type * as mcp from "../mcp.js";
import type * as notifications from "../notifications.js";
import type * as quizzes from "../quizzes.js";
import type * as results from "../results.js";
import type * as scholarships from "../scholarships.js";
import type * as seed from "../seed.js";
import type * as syntheticData from "../syntheticData.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  alerts: typeof alerts;
  "auth/emailOtp": typeof auth_emailOtp;
  auth: typeof auth;
  courses: typeof courses;
  crons: typeof crons;
  deadlines: typeof deadlines;
  documents: typeof documents;
  emails: typeof emails;
  examSchedules: typeof examSchedules;
  http: typeof http;
  mcp: typeof mcp;
  notifications: typeof notifications;
  quizzes: typeof quizzes;
  results: typeof results;
  scholarships: typeof scholarships;
  seed: typeof seed;
  syntheticData: typeof syntheticData;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
