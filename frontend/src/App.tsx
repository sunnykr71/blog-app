import {Route, Routes} from "react-router-dom";
import Home from "./pages/home";
import CreateBlog from "./pages/create-blog";
import BlogFormExample from "./pages/testing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-blog" element={<CreateBlog />} />
      <Route path="/blog-form" element={<BlogFormExample />} />
    </Routes>
  );
}

export default App;
