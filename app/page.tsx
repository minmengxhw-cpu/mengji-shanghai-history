"use client";

import { useMemo, useState } from "react";
import { categories, people, routes, sites, timeline, type Site } from "./data";

const catClass: Record<string, string> = {
  "传统教育基地": "gold", "实践教育基地": "teal", "文化教育基地": "violet",
  "思想政治教育基地": "cyan", "名人故居": "red", "组织与机关": "blue",
  "历史事件": "orange", "民盟前史": "amber", "英烈纪念": "crimson", "高校延伸": "indigo",
};

const evidenceClass: Record<string, string> = {
  "官方资料可核": "verified", "多源互证": "crosschecked", "线索待核": "pending",
};

function SiteCard({ site, onOpen }: { site: Site; onOpen: (site: Site) => void }) {
  return (
    <button className="site-card" onClick={() => onOpen(site)}>
      <div className="card-top">
        <span className={`tag ${catClass[site.category]}`}>{site.category}</span>
        <span className={`evidence ${evidenceClass[site.evidence || "多源互证"]}`}>{site.evidence}</span>
      </div>
      <h3>{site.name}</h3>
      <p className="address">{site.district} · {site.address}</p>
      <p className="hook">{site.hook}</p>
      <span className="read">{site.chapters?.length || 2}节故事 · {site.sources?.length || 0}项来源 <b>↗</b></span>
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

  const bases = sites.filter((site) => site.category === "传统教育基地");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((site) => {
      if (category !== "全部" && site.category !== category) return false;
      if (!q) return true;
      return [
        site.name, site.address, site.old, site.hook, site.story, site.anchor,
        ...(site.people || []), ...(site.facts || []),
        ...(site.chapters || []).flatMap((chapter) => [chapter.title, chapter.text]),
      ].filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [category, query]);

  const visible = showAll || query || category !== "全部" ? filtered : filtered.slice(0, 12);
  const routeSites = routes[route].ids.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[];
  const districtCounts = [...new Set(sites.map((s) => s.district))]
    .map((district) => ({ district, count: sites.filter((s) => s.district === district).length }))
    .sort((a, b) => b.count - a.count);
  const totalSources = new Set(sites.flatMap((site) => site.sources?.map((source) => source.url) || [])).size;

  const openCategory = (value: string) => {
    setCategory(value);
    setShowAll(true);
    document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#top"><span>盟迹</span><em>上海民盟历史知识库</em></a>
        <div className="nav-links">
          <a href="#bases">16处基地</a><a href="#archive">51处点位</a>
          <a href="#timeline">历史主线</a><a href="#people">人物</a><a href="#sources">研究说明</a>
        </div>
        <a className="nav-cta" href="#archive">检索史料</a>
      </nav>

      <header className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit orbit-a" aria-hidden="true" />
        <div className="hero-orbit orbit-b" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker"><i /> 民盟上海市委宣传部 · 上海盟史资料工程</p>
          <h1><span>51处历史现场，</span><br />16处传统教育阵地。</h1>
          <p className="hero-lede">这里记录的不是一串景点，而是每一处地址里真实发生过的事：谁来到这里、面对什么压力、作出怎样的选择，又怎样改变了上海民盟的历史。</p>
          <div className="hero-actions">
            <a className="primary-btn" href="#bases">先看16处基地 <span>↓</span></a>
            <a className="ghost-btn" href="#archive">检索51处点位</a>
          </div>
        </div>
        <div className="hero-data">
          <div className="hero-number"><b>51</b><span>处可检索的上海盟史点位</span></div>
          <div className="metric-grid">
            <div><b>16</b><span>传统教育阵地</span></div>
            <div><b>12</b><span>核心人物索引</span></div>
            <div><b>18</b><span>历史节点</span></div>
            <div><b>{totalSources}</b><span>类公开来源入口</span></div>
          </div>
          <p className="scope-note"><strong>资料口径</strong>　51处涵盖基地、故居、机关、事件、前史、英烈与高校延伸。第16处按项目台账收录，挂牌序列待2026年官方原文归档后最终确认，页面已单独标识。</p>
        </div>
      </header>

      <section className="base-archive" id="bases">
        <div className="section-head">
          <div>
            <div className="section-label">TRADITIONAL EDUCATION SITES · 16</div>
            <h2>先从16处基地，<br />进入上海民盟史。</h2>
            <p>每处基地都不是一块孤立的牌子。这里把挂牌沿革、人物选择、关键事件、现场细节和公开来源合在一起，形成可继续扩展的专题档案。</p>
          </div>
          <div className="evidence-key">
            <span><i className="verified" />官方资料可核</span>
            <span><i className="crosschecked" />多源互证</span>
            <span><i className="pending" />线索待核</span>
          </div>
        </div>
        <div className="base-list">
          {bases.map((site, index) => (
            <button key={site.id} onClick={() => setSelected(site)}>
              <span className="base-no">{String(index + 1).padStart(2, "0")}</span>
              <div><small>{site.year}</small><h3>{site.name}</h3><p>{site.hook}</p></div>
              <em className={evidenceClass[site.evidence || "多源互证"]}>{site.evidence}</em>
              <b>打开专题档案 ↗</b>
            </button>
          ))}
        </div>
      </section>

      <section className="featured-stories">
        <div className="section-label light">STORIES AT THE ADDRESS</div>
        <h2>一个门牌，为什么值得记住？</h2>
        <div className="feature-grid">
          {["nanhai", "hongqiao", "zhougongguan", "pudong-school"].map((id, i) => {
            const site = sites.find((item) => item.id === id)!;
            return (
              <button key={id} onClick={() => setSelected(site)}>
                <span>0{i + 1}</span><small>{site.address}</small>
                <h3>{site.hook}</h3><p>{site.chapters?.[0]?.text}</p><em>阅读完整故事 ↗</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="stories" id="archive">
        <div className="section-head">
          <div>
            <div className="section-label">HISTORY ARCHIVE · 51</div>
            <h2>五十一处历史现场</h2>
            <p>搜索地址、人名、事件或一句原话。每项档案包含故事章节、关键事实、相关人物、研究提示和可追溯的公开来源。</p>
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
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索点位、人物、地址、事件或引文…" />
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
            <SiteCard key={site.id} site={{ ...site, address: addressMode === "old" && site.old ? site.old : site.address }} onOpen={() => setSelected(site)} />
          ))}
        </div>
        {!filtered.length && <div className="empty-state"><b>没有找到对应点位</b><p>试试人物姓名、区名，或“教育”“英烈”“救国”等关键词。</p></div>}
        {!showAll && !query && category === "全部" && <button className="show-all" onClick={() => setShowAll(true)}>展开全部51处点位 <span>↓</span></button>}
      </section>

      <section className="timeline-section" id="timeline">
        <div className="timeline-copy">
          <div className="section-label light">CHRONICLE · 1935—TODAY</div>
          <h2>点位不是掌故，<br />它们共同构成历史。</h2>
          <p>从抗日救亡组织汇流，到民盟上海地方组织成立、明确政治选择、迎接上海解放，再到新中国成立后的制度化履职。</p>
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
            <h2>人物不是履历，<br />而是一连串选择。</h2>
            <p>点击人物，检索他或她在上海留下的全部相关地址，再沿点位阅读其组织、职业和公共生活。</p>
          </div>
        </div>
        <div className="people-grid">
          {people.map(([name, years, role, quote], i) => (
            <button key={name} onClick={() => { setQuery(name); setCategory("全部"); setShowAll(true); document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span className="person-no">{String(i + 1).padStart(2, "0")}</span>
              <div className="person-monogram">{name.replace(" ", "").slice(-1)}</div>
              <h3>{name}</h3><small>{years}</small><p>{role}</p><blockquote>{quote}</blockquote><em>查看相关点位 ↗</em>
            </button>
          ))}
        </div>
      </section>

      <section className="routes" id="routes">
        <div className="route-intro">
          <div className="section-label light">FIELD RESEARCH ROUTES · 04</div>
          <h2>把档案带回现场</h2>
          <p>线路是研究索引，不是打卡清单。相邻地址被组织成一条历史因果链，便于实地复核建筑、门牌和空间关系。</p>
          <div className="route-tabs">
            {routes.map((item, i) => <button key={item.name} className={route === i ? "active" : ""} onClick={() => setRoute(i)}><b>0{i + 1}</b>{item.name}</button>)}
          </div>
          <div className="route-meta"><span>{routes[route].name}</span><b>{routes[route].meta}</b></div>
        </div>
        <div className="route-map">
          <div className="map-grid" aria-hidden="true" /><div className="route-line" aria-hidden="true" />
          {routeSites.map((site, i) => (
            <button key={site.id} className="route-stop" style={{ left: `${14 + (i % 4) * 24}%`, top: `${18 + Math.floor(i / 4) * 48 + (i % 2) * 8}%` }} onClick={() => setSelected(site)}>
              <i>{i + 1}</i><span>{site.name}</span><small>{site.district}</small>
            </button>
          ))}
          <p className="map-note">主题线路示意 · 点击站点打开专题档案 · 实际出行请使用导航软件</p>
        </div>
      </section>

      <section className="districts">
        <div className="section-head compact"><div><div className="section-label">CITY INDEX</div><h2>地址变了，是因为城市变了</h2><p>门牌沿革记录组织活动如何借用饭店、医院、学校、里弄与办公楼。点击区名可直接筛选。</p></div></div>
        <div className="district-bars">
          {districtCounts.map((item, i) => (
            <button key={item.district} onClick={() => { setCategory("全部"); setQuery(item.district); setShowAll(true); document.getElementById("archive")?.scrollIntoView({ behavior: "smooth" }); }}>
              <span>{String(i + 1).padStart(2, "0")}</span><b>{item.district}</b><i style={{ width: `${Math.max(20, item.count * 9)}%` }} /><em>{item.count}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="research-note" id="sources">
        <div>
          <div className="section-label">RESEARCH METHOD</div>
          <h2>真实，比“讲得像故事”更重要。</h2>
        </div>
        <div className="research-columns">
          <article><b>01</b><h3>来源分层</h3><p>优先采用民盟中央、民盟上海市委及场馆、高校、政府公开资料；专题文章用于补充现场细节，并在档案内给出来源入口。</p></article>
          <article><b>02</b><h3>事实与线索分开</h3><p>挂牌序列、具体会址、地址推定等尚未获得完整官方原文的内容，不以确定语气写入，统一标为“线索待核”。</p></article>
          <article><b>03</b><h3>知识库持续生长</h3><p>当前版本先建立51处点位的档案骨架，并重点扩展16处基地。后续可继续补入原始文献、口述史、老照片说明和逐条引用。</p></article>
        </div>
        <button className="research-action" onClick={() => openCategory("传统教育基地")}>查看全部16处基地档案 ↗</button>
      </section>

      <section className="method">
        <div className="method-title"><div className="section-label light">EXPLANATION REFERENCE</div><h2>需要讲解时，<br />再使用这一层。</h2></div>
        <div className="method-steps">
          <article><span>第一步</span><h3>先核事实</h3><p>确定时间、地点、人物和来源，不把传闻当史实。</p></article>
          <article><span>第二步</span><h3>再抓选择</h3><p>谁在什么压力下作出什么决定，构成故事的核心。</p></article>
          <article><span>第三步</span><h3>落到细节</h3><p>手杖、病房、清单、黑板，让历史可见、可记。</p></article>
          <article><span>第四步</span><h3>回到主线</h3><p>个人故事最终要回到救亡、民主、合作与建设。</p></article>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><b>盟迹</b><span>上海民盟历史知识库</span></div>
        <div className="footer-copy">民盟上海市委宣传部编<br />资料来源：民盟中央、民盟上海市委、《上海盟讯》、上海统一战线网、各区政府、高校及馆方公开资料。</div>
        <div className="footer-note">研究提示：开放时间、挂牌序列、人物职务与具体会址会随新资料更新；档案内的核验状态和来源入口是正式引用前的第一道检查。</div>
      </footer>

      {selected && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <aside className="drawer" role="dialog" aria-modal="true" aria-label={`${selected.name}专题档案`}>
            <button className="drawer-close" onClick={() => setSelected(null)} aria-label="关闭">×</button>
            <div className="drawer-hero">
              <div className="drawer-badges"><span className={`tag ${catClass[selected.category]}`}>{selected.category}</span><span className={`evidence ${evidenceClass[selected.evidence || "多源互证"]}`}>{selected.evidence}</span></div>
              <small>{selected.year}</small><h2>{selected.name}</h2><p>{selected.hook}</p>
            </div>
            <div className="drawer-address">
              <div><span>今址</span><b>{selected.district} · {selected.address}</b></div>
              {selected.old && <div><span>旧址</span><b>{selected.old}</b></div>}
            </div>
            <div className="drawer-body">
              {selected.statusNote && <section className="status-note"><label>口径说明</label><p>{selected.statusNote}</p></section>}
              {!!selected.facts?.length && <section><label>关键事实</label><div className="fact-grid">{selected.facts.map((fact) => <span key={fact}>{fact}</span>)}</div></section>}
              <section className="story-chapters">
                <label>完整故事</label>
                {selected.chapters?.map((chapter, index) => <article key={chapter.title}><small>{String(index + 1).padStart(2, "0")}</small><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div></article>)}
              </section>
              {!!selected.people.length && <section><label>相关人物</label><div className="person-tags">{selected.people.map((p) => <button key={p} onClick={() => { setSelected(null); setQuery(p); setCategory("全部"); setShowAll(true); }}>{p}</button>)}</div></section>}
              <section className="anchor-box"><label>研究与讲解提示</label><p>{selected.anchor}</p></section>
              <section className="source-list"><label>公开来源</label>
                {selected.sources?.map((source, index) => <a href={source.url} target="_blank" rel="noreferrer" key={`${source.url}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><div><b>{source.title}</b><small>{source.publisher}</small></div><em>↗</em></a>)}
              </section>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
