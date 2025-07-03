import {useGetBlogsQuery} from "@/app/services/blog-service";
import Loading from "./loading";
import Blog from "./blog";

function AllBlogs() {
  const {data, isLoading, isError} = useGetBlogsQuery({});

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-red-500 text-2xl">Error</div>;

  return (
    <div className="w-full min-h-screen flex items-start gap-8 p-8">
      {data.data.blogs.map((blog: any) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  );
}

export default AllBlogs;
