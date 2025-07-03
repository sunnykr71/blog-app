import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const blogApi = createApi({
  reducerPath: "blogs",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3002/api/v1",
  }),
  endpoints: (builder) => ({
    getBlogs: builder.query({
      query: () => "/blogs",
    }),

    createBlog: builder.mutation({
      query: (data) => ({
        url: "/blogs",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {useGetBlogsQuery, useCreateBlogMutation} = blogApi;
