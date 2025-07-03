import {Card, CardTitle, CardHeader, CardContent, CardFooter} from "./ui/card";
import {Badge} from "./ui/badge";

function Blog({blog}: any) {
  return (
    <Card key={blog.id} className="w-full max-w-2xl p-4">
      <CardHeader>
        <CardTitle className="text-3xl bold text-foreground text-center">
          {blog.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {blog.coverImage && (
          <div className="flex justify-center rounded-xl overflow-hidden">
            <img
              className="object-cover"
              src={blog.coverImage}
              alt={blog.title}
            />
          </div>
        )}
        <h2 className="text-xl font-bold">{blog.metaTitle}</h2>
        <p className="text-muted-foreground text-sm line-clamp-4">
          {blog.description}
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          {blog.tags.map((tag: {tagName: string}) => (
            <Badge key={tag.tagName}>{tag.tagName}</Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

export default Blog;
