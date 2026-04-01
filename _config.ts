import lume from "lume/mod.ts";
import blog from "blog/mod.ts";

const site = lume({
  location: new URL("https://mejiro877.github.io/lume-blog/"),
});

site.use(blog());

export default site;
