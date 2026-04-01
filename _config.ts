import lume from "lume/mod.ts";
import blog from "blog/mod.ts";

const site = lume({
  location: new URL("https://mejiro877.github.io/lume-blog/"),
});

site.use(blog({
  date: {
    formats: {
      HUMAN_DATE: "yyyy-MM-dd",
    },
  },
}));

// テーマの CSS コンポーネントファイルを出力ディレクトリにコピー
site.copy("_includes/css");

// 外部リンクを新しいタブで開く + コードコピーボタンを追加
site.process([".html"], (pages) => {
  for (const page of pages) {
    const doc = page.document;
    if (!doc) continue;

    // 外部リンクを新しいタブで開く
    doc.querySelectorAll("a[href^='http']").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && !href.startsWith("https://mejiro877.github.io")) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    // コードブロックにコピーボタンを追加
    doc.querySelectorAll("pre").forEach((pre) => {
      const btn = doc.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      pre.prepend(btn);
    });

    // コピーボタンのスクリプトを注入
    const body = doc.querySelector("body");
    if (body && doc.querySelector("pre .copy-btn")) {
      const script = doc.createElement("script");
      script.textContent = `document.addEventListener("click",function(e){var b=e.target;if(!b.classList.contains("copy-btn"))return;var code=b.parentElement.querySelector("code");if(!code)return;navigator.clipboard.writeText(code.textContent).then(function(){b.textContent="Copied!";setTimeout(function(){b.textContent="Copy"},1500)})})`;
      body.append(script);
    }
  }
});

export default site;
