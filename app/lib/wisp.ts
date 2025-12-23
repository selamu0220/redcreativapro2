import {
  buildWispClient,
  GetPostsResult,
  GetPostResult,
} from "@wisp-cms/client";

export const wisp = buildWispClient({
  blogId: "f9ac8e7e-2732-4249-862d-41964799d89e",
});

export type { GetPostsResult, GetPostResult };
