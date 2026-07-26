"use client";

import { useMemo, useState } from "react";
import { categories, people, routes, sites, timeline, type Site } from "./data";

const catClass: Record<string, string> = {
  "传统教育基地": "gold",
  "实践教育基地": "teal",
  "文化教育基地": "violet",
  "思想政治教育基地": "cyan",
  "名人故居": "red",
  "组织与机关": "blue",
  "历史事件": "orange",
  "民盟前史": "amber",
  "英烈纪念": "crimson",
  "高校延伸": "indigo",
};

function SiteCard({ site, onOpen }: { site: Site; onOpen: (site: Site) => void }) {
  return (
    <button className="site-card" onClick={() => onOpen(site)}>
      <div className="card-top">
        <span className={`tag ${catClass[site.category]}`}>{site.category}</span>
        <span className="year">{site.year}</span>
      </div>
      <h3>{site.name}</h3>
      <p className="address">{site.district} · {site.address}</p>
      <p className="hook">{site.hook}</p>
      <span className="read">展开讲解卡 <b>↗</b></span>
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [selected, setSelected] = useState<Site | null>(null);
  const [route, setRoute] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [addressMode, setAddressMode] = useState<"now" | "old">("now");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((site) => {
      if (category !== "全部" && site.category !== category) return false;
      if (!q) return true;
      return [site.name, site.address, site.old, site.hook, site.story, site.anchor, ...site.people]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [category, query]);

  const visible = showAll || query || category !== "全部" ? filtered : filtered.slice(0, 12);
  const routeSites = routes[route].ids.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[];
  const districtCounts = [...new Set(sites.map((s) => s.district))]
    .map((district) => ({ district, count: sites.filter((s) => s.district === district).length }))
    .sort((a, b) => b.count - a.count);

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top"><span>盟迹</span><em>讲解员备赛资料库</em></a>
        <div className="nav-links">
          <a href="#stories">故事库</a>
          <a href="#routes">现场线路</a>
          <a href="#timeline">历史主线</a>
          <a href="#people">人物</a>
        </div>
        <a className="nav-cta" href="#stories">开始备赛</a>
      </nav>

      <header className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit orbit-a" aria-hidden="true" />
        <div className="hero-orbit orbit-b" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker"><i /> 第二届民盟传统教育基地讲解员比赛 · 上海</p>
          <h1>上海民盟的历史，<br /><span>可以用地址讲完。</span></h1>
          <p className="hero-lede">从一家饭店的顶楼，到一间205号病房，再到外滩银行大楼的404室。这里不是景点清单，而是讲解员可以直接取用、继续追问的<span>历史故事资料库</span>。</p>
          <div className="hero-actions">
            <a className="primary-btn" href="#stories">从故事开始 <span>↓</span></a>
            <a className="ghost-btn" href="#routes">查看四条线路</a>
          </div>
        </div>
        <div className="hero-data">
          <div className="hero-number"><b>51</b><span>处上海盟史研究点位</span></div>
          <div className="metric-grid">
            <div><b>16</b><span>传统教育基地</span></div>
            <div><b>12</b><span>核心人物</span></div>
            <div><b>18</b><span>历史节点</span></div>
            <div><b>4</b><span>现场线路</span></div>
          </div>
          <p className="scope-note"><strong>口径说明</strong>　“16处”为本库收录的传统教育基地；“51处”为包含故居、机关、事件、前史、英烈与高校延伸在内的完整研究点位。</p>
        </div>
      </header>

      <section className="principle">
        <div className="section-label">HOW TO USE</div>
        <h2>一处点位，不只要“知道”，<br />更要能<span>讲出来。</span></h2>
        <div className="principle-flow">
          <article><b>01</b><h3>先抓一个选择</h3><p>谁在什么压力下，做了什么决定？故事从人的选择开始。</p></article>
          <div className="flow-arrow">→</div>
          <article><b>02</b><h3>再落一个细节</h3><p>一根手杖、205号病房、404办公室，让历史可见可记。</p></article>
          <div className="flow-arrow">→</div>
          <article><b>03</b><h3>最后提出追问</h3><p>这个故事怎样解释民盟的界别、传统与今天的使命？</p></article>
        </div>
      </section>

      <section className="stories" id="stories">
        <div className="section-head">
          <div>
            <div className="section-label">STORY ARCHIVE · 51</div>
            <h2>从故事进入历史</h2>
            <p>每张卡片都给你一句开场、完整故事和讲解锚点。搜索地址、人名或关键词，快速组合自己的讲稿。</p>
          </div>
          <div className="address-toggle" aria-label="地址显示方式">
            <span>门牌</span>
            <button className={addressMode === "now" ? "active" : ""} onClick={() => setAddressMode("now")}>今址</button>
            <button className={addressMode === "old" ? "active" : ""} onClick={() => setAddressMode("old")}>旧址</button>
          </div>
        </div>

        <div className="search-row">
          <label className="search-box">
            <span>⌕</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索点位、人物、地址或一句话…" />
            {query && <button onClick={() => setQuery("")} aria-label="清空搜索">×</button>}
          </label>
          <div className="result-count"><b>{filtered.length}</b> 个结果</div>
        </div>
        <div className="filters">
          {["全部", ...categories].map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => { setCategory(item); setShowAll(true); }}>
              {item}{item !== "全部" && <sup>{sites.filter((s) => s.category === item).length}</sup>}
            </button>
          ))}
        </div>

        <div className="site-grid">
          {visible.map((site) => (
            <SiteCard key={site.id} site={{...site, address: addressMode === "old" && site.old ? site.old : site.address}} onOpen={() => setSelected(site)} />
          ))}
        </div>
        {!filtered.length && <div className="empty-state"><b>没有找到对应点位</b><p>试试人物姓名、区名，或“教育”“英烈”“救国”等关键词。</p></div>}
        {!showAll && !query && category === "全部" && (
          <button className="show-all" onClick={() => setShowAll(true)}>展开全部51处点位 <span>↓</span></button>
        )}
      </section>

      <section className="routes" id="routes">
        <div className="route-intro">
          <div className="section-label light">FIELD ROUTES · 04</div>
          <h2>把故事带回现场</h2>
          <p>四条线路按空间与主题编排。不是赶景点，而是用相邻地址建立一条能讲清楚的历史因果链。</p>
          <div className="route-tabs">
            {routes.map((item, i) => <button key={item.name} className={route === i ? "active" : ""} onClick={() => setRoute(i)}><b>0{i + 1}</b>{item.name}</button>)}
          </div>
          <div className="route-meta"><span>{routes[route].name}</span><b>{routes[route].meta}</b></div>
        </div>
        <div className="route-map">
          <div className="map-grid" aria-hidden="true" />
          <div className="route-line" aria-hidden="true" />
          {routeSites.map((site, i) => (
            <button key={site.id} className="route-stop" style={{ left: `${14 + (i % 4) * 24}%`, top: `${18 + Math.floor(i / 4) * 48 + (i % 2) * 8}%` }} onClick={() => setSelected(site)}>
              <i>{i + 1}</i><span>{site.name}</span><small>{site.district}</small>
            </button>
          ))}
          <p className="map-note">主题线路示意 · 点击站点打开讲解卡 · 实际出行请使用导航软件</p>
        </div>
      </section>

      <section className="districts">
        <div className="section-head compact">
          <div>
            <div className="section-label">CITY INDEX</div>
            <h2>地址变了，是因为城市变了</h2>
            <p>51处点位分布于上海13个区。门牌沿革不是附属信息，它记录组织活动如何借用饭店、医院、学校、里弄与办公楼。</p>
          </div>
        </div>
        <div className="district-bars">
          {districtCounts.map((item, i) => (
            <button key={item.district} onClick={() => { setCategory("全部"); setQuery(item.district); document.getElementById("stories")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span>{String(i + 1).padStart(2,"0")}</span>
              <b>{item.district}</b>
              <i style={{ width: `${Math.max(20, item.count * 9)}%` }} />
              <em>{item.count}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-section" id="timeline">
        <div className="timeline-copy">
          <div className="section-label light">CHRONICLE · 1935—TODAY</div>
          <h2>先看主线，<br />再看门牌。</h2>
          <p>点位不是散落的掌故。它们共同回答：一个以知识分子为主体的政治组织，怎样从抗日救亡走向明确政治选择，并在今天继续履职。</p>
        </div>
        <div className="timeline">
          {timeline.map(([year, title, text], i) => (
            <article key={year}><div className="tl-year"><b>{year}</b><span>0{i + 1}</span></div><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
        </div>
      </section>

      <section className="people-section" id="people">
        <div className="section-head compact">
          <div>
            <div className="section-label">FIGURES · 12</div>
            <h2>记住人，也记住他们的选择</h2>
            <p>比赛不是人物履历背诵。用一句能被记住的话进入人物，再沿相关点位拓展。</p>
          </div>
        </div>
        <div className="people-grid">
          {people.map(([name, years, role, quote], i) => (
            <button key={name} onClick={() => { setQuery(name); setCategory("全部"); setShowAll(true); document.getElementById("stories")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span className="person-no">{String(i + 1).padStart(2, "0")}</span>
              <div className="person-monogram">{name.replace(" ","").slice(-1)}</div>
              <h3>{name}</h3><small>{years}</small><p>{role}</p><blockquote>{quote}</blockquote>
              <em>查看相关点位 ↗</em>
            </button>
          ))}
        </div>
      </section>

      <section className="method">
        <div className="method-title">
          <div className="section-label light">FOR THE CONTEST</div>
          <h2>把资料变成<br />你自己的讲解。</h2>
        </div>
        <div className="method-steps">
          <article><span>第一步</span><h3>选一个冲突</h3><p>不是“某年某人来到这里”，而是“他本来可以离开，为什么留下”。</p></article>
          <article><span>第二步</span><h3>抓一个物件</h3><p>手杖、被单、黑板、冬瓜、长须，都是把人物从展板上请下来的入口。</p></article>
          <article><span>第三步</span><h3>连一条主线</h3><p>把个人选择放回救亡、民主、合作、建设的历史进程中。</p></article>
          <article><span>第四步</span><h3>留一个问题</h3><p>讲解不是给出所有答案，而是让听众愿意继续认识民盟。</p></article>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><b>盟迹</b><span>上海民盟历史点位 · 讲解员备赛资料库</span></div>
        <div className="footer-copy">民盟上海市委宣传部编<br />资料来源：民盟中央与民盟上海市委公开资料、《上海盟讯》、上海统一战线网、各区政府、高校及馆方公开资料。</div>
        <div className="footer-note">史料提示：本库用于学习与讲解准备；挂牌序列、开放时间、人物职务和具体会址在正式使用前仍应以最新官方资料复核。</div>
      </footer>

      {selected && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${selected.name}讲解卡`}>
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
            <div className="drawer-hero">
              <span className={`tag ${catClass[selected.category]}`}>{selected.category}</span>
              <small>{selected.year}</small>
              <h2>{selected.name}</h2>
              <p>{selected.hook}</p>
            </div>
            <div className="drawer-address">
              <div><span>今址</span><b>{selected.district} · {selected.address}</b></div>
              {selected.old && <div><span>旧址</span><b>{selected.old}</b></div>}
            </div>
            <div className="drawer-body">
              <section><label>故事正文</label><p>{selected.story}</p></section>
              <section className="anchor-box"><label>讲解锚点</label><p>{selected.anchor}</p></section>
              {!!selected.people.length && <section><label>相关人物</label><div className="person-tags">{selected.people.map((p) => <button key={p} onClick={() => { setSelected(null); setQuery(p); setCategory("全部"); setShowAll(true); }}>{p}</button>)}</div></section>}
              <section className="prompt-box"><label>继续追问</label><p>这个地点里最重要的“选择”是什么？它怎样连接民盟的历史传统与今天的责任？</p></section>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
