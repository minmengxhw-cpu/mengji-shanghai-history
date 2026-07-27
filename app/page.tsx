"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { categories, people, routes, sites, timeline, type Site } from "./data";

const catClass: Record<string, string> = {
  "传统教育基地": "gold", "实践教育基地": "teal", "文化教育基地": "violet",
  "思想政治教育基地": "cyan", "名人故居": "red", "组织与机关": "blue",
  "历史事件": "orange", "民盟前史": "amber", "英烈纪念": "crimson", "教育与校园": "indigo",
};

const matchesCategory = (site: Site, item: string) =>
  site.category === item || site.secondaryCategories?.includes(item as Site["category"]);

const assetSrc = (path: string) => path.startsWith("/") ? `.${path}` : path;

const searchIndex = new Map(
  sites.map((site) => [
    site.id,
    {
      fields: [
        site.name, site.address, site.old, site.hook, site.story, site.anchor, site.district,
        ...site.people, ...(site.facts || []),
        ...(site.chapters || []).flatMap((chapter) => [chapter.title, chapter.text]),
        ...(site.architecture || []).flatMap((note) => [note.title, note.text]),
      ].filter(Boolean).map((value) => String(value).toLowerCase()),
      name: site.name.toLowerCase(),
      address: site.address.toLowerCase(),
      people: site.people.map((name) => name.toLowerCase()),
    },
  ]),
);

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
      <span className="read">{site.chapters?.length || 2}节故事 <b>↗</b></span>
    </button>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [district, setDistrict] = useState("全部");
  const [selected, setSelected] = useState<Site | null>(null);
  const [route, setRoute] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [addressMode, setAddressMode] = useState<"now" | "old">("now");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  const bases = sites.filter((site) => site.category === "传统教育基地");
  const totalSites = sites.length;
  const isDrawerOpen = Boolean(selected);
  const totalPeople = new Set(sites.flatMap((site) => site.people).filter((name) => name && !name.includes("机关"))).size;
  const openSite = useCallback((site: Site) => {
    setSelected(site);
    const url = new URL(window.location.href);
    url.searchParams.set("site", site.id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  const closeSite = useCallback(() => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("site");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, []);
  const goToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    // Avoid native hash navigation on this long, dynamically rendered page.
    document.body.classList.remove("drawer-open");
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      document.body.classList.remove("drawer-open");
      return;
    }
    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    body.classList.add("drawer-open");
    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 40);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSite();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      body.classList.remove("drawer-open");
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSite, isDrawerOpen]);

  useEffect(() => {
    if (selected && drawerRef.current) drawerRef.current.scrollTop = 0;
  }, [selected]);

  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get("site");
    if (id) setSelected(sites.find((item) => item.id === id) || null);
  }, []);

  const scrollDrawerTo = useCallback((id: string) => {
    const drawer = drawerRef.current;
    const target = drawer?.querySelector<HTMLElement>(`#${id}`);
    if (!drawer || !target) return;
    drawer.scrollTo({ top: Math.max(0, target.offsetTop - 58), behavior: "auto" });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const scoped = sites.filter((site) =>
      (category === "全部" || matchesCategory(site, category)) &&
      (district === "全部" || site.district === district));
    if (!q) return scoped;
    return scoped
      .map((site) => {
        const index = searchIndex.get(site.id);
        if (!index || !index.fields.some((field) => field.includes(q))) return null;
        const score =
          (index.name.includes(q) ? 100 : 0) +
          (index.address.includes(q) ? 60 : 0) +
          (index.people.some((name) => name.includes(q)) ? 40 : 0) +
          index.fields.filter((field) => field.includes(q)).length;
        return { site, score };
      })
      .filter((item): item is { site: Site; score: number } => Boolean(item))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.site);
  }, [category, district, query]);

  const isFiltering = Boolean(query) || category !== "全部" || district !== "全部";
  const visible = showAll || isFiltering ? filtered : filtered.slice(0, 12);
  const routeSites = routes[route].ids.map((id) => sites.find((site) => site.id === id)).filter(Boolean) as Site[];
  const districtCounts = [...new Set(sites.map((s) => s.district))]
    .map((name) => ({ district: name, count: sites.filter((s) => s.district === name).length }))
    .sort((a, b) => b.count - a.count);
  const maxDistrictCount = districtCounts[0]?.count || 1;
  return (
    <main>
      <nav className="nav">
        <button className="brand" type="button" onClick={() => goToSection("top")}><span>盟迹</span><em>上海民盟历史知识库</em></button>
        <div className="nav-links">
          <button type="button" onClick={() => goToSection("bases")}>{bases.length}处基地</button>
          <button type="button" onClick={() => goToSection("archive")}>{totalSites}处点位</button>
          <button type="button" onClick={() => goToSection("timeline")}>历史主线</button>
          <button type="button" onClick={() => goToSection("people")}>人物</button>
          <button type="button" onClick={() => goToSection("routes")}>现场线路</button>
        </div>
        <button className="nav-cta" type="button" onClick={() => goToSection("archive")}>检索史料</button>
      </nav>

      <header className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit orbit-a" aria-hidden="true" />
        <div className="hero-orbit orbit-b" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker"><i /> 民盟上海市委宣传部 · 上海盟史资料工程</p>
          <h1><span>{totalSites}处历史现场，</span><br />{bases.length}处传统教育档案。</h1>
          <p className="hero-lede">民盟是从爱国两个字上长出来的。</p>
          <div className="hero-actions">
            <button className="primary-btn" type="button" onClick={() => goToSection("bases")}>先看{bases.length}处基地 <span>↓</span></button>
            <button className="ghost-btn" type="button" onClick={() => goToSection("archive")}>检索{totalSites}处点位</button>
          </div>
        </div>
        <div className="hero-data">
          <div className="hero-number"><b>{totalSites}</b><span>处可检索的<br /><em>上海盟史点位</em></span></div>
          <div className="metric-grid">
            <div><b>{bases.length}</b><span>传统教育基地</span></div>
            <div><b>{totalPeople}</b><span>位相关人物索引</span></div>
            <div><b>{timeline.length}</b><span>历史节点</span></div>
            <div><b>{routes.length}</b><span>条现场主题线路</span></div>
          </div>
          <p className="scope-note"><strong>从地址进入历史</strong>　{totalSites}处涵盖传统教育基地、人物纪念与旧居、机关沿革、事件现场、民盟前史、英烈纪念与教育校园。</p>
        </div>
      </header>

      <section className="base-archive" id="bases">
        <div className="section-head">
          <div>
            <div className="section-label">TRADITIONAL EDUCATION SITES · {bases.length}</div>
            <h2>从{bases.length}处传统教育基地，<br />进入上海民盟史。</h2>
            <p>这些基地记录着上海民盟一路走来的重要时刻。人物、事件和现场细节被整理在同一处，方便讲解员查阅，也方便沿着一个地址继续了解它背后的历史。</p>
          </div>
        </div>
        <div className="base-list">
          {bases.map((site, index) => (
            <article
              className="base-entry"
              key={site.id}
              onClick={() => openSite(site)}
            >
              <span className="base-no">{String(index + 1).padStart(2, "0")}</span>
              <div className="base-copy"><small>{site.year}</small><h3>{site.name}</h3><p>{site.hook}</p></div>
              {/* GitHub Pages uses verified local archival images without an image proxy. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {site.image && <img src={assetSrc(site.image)} alt={site.imageAlt || site.name} loading="lazy" decoding="async" width="640" height="480" />}
              <button
                className="base-open"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  openSite(site);
                }}
              >
                打开完整故事 ↗
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="stories" id="archive">
        <div className="section-head">
          <div>
            <div className="section-label">HISTORY ARCHIVE · {totalSites}</div>
            <h2>{totalSites}处历史现场</h2>
            <p>搜索地址、人名、事件或一句原话。每项档案包含故事章节、关键事实、相关人物和与其他点位之间的联系。</p>
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
          {district !== "全部" && (
            <button className="chip-district" onClick={() => setDistrict("全部")}>
              {district}<span aria-hidden="true"> ×</span>
              <span className="sr-only">（清除区域筛选）</span>
            </button>
          )}
          {["全部", ...categories].map((item) => (
            <button key={item} className={category === item ? "active" : ""} onClick={() => { setCategory(item); setShowAll(true); }}>
              {item}{item !== "全部" && <sup>{sites.filter((s) => matchesCategory(s, item)).length}</sup>}
            </button>
          ))}
        </div>
        <div className="site-grid">
          {visible.map((site) => (
            <SiteCard key={site.id} site={{ ...site, address: addressMode === "old" && site.old ? site.old : site.address }} onOpen={() => openSite(site)} />
          ))}
        </div>
        {!filtered.length && <div className="empty-state"><b>没有找到对应点位</b><p>试试人物姓名、区名，或“教育”“英烈”“救国”等关键词。</p></div>}
        {!showAll && !isFiltering && <button className="show-all" onClick={() => setShowAll(true)}>展开全部{totalSites}处点位 <span>↓</span></button>}
      </section>

      <section className="timeline-section" id="timeline">
        <div className="timeline-copy">
          <div className="section-label light">CHRONICLE · 1935—TODAY</div>
          <h2>点位不是掌故，<br />它们共同构成历史。</h2>
          <p>从抗日救亡组织汇流，到民盟上海地方组织成立、明确政治选择、迎接上海解放，再到新中国成立后的制度化履职。</p>
        </div>
        <div className="timeline">
          {timeline.map(([year, title, text], i) => (
            <article key={year}><div className="tl-year"><b>{year}</b><span>{String(i + 1).padStart(2, "0")}</span></div><div><h3>{title}</h3><p>{text}</p></div></article>
          ))}
        </div>
      </section>

      <section className="people-section" id="people">
        <div className="section-head compact">
          <div>
            <div className="section-label">FIGURES · {people.length}</div>
            <h2>人物不是履历，<br />而是一连串选择。</h2>
            <p>点击人物，检索他或她在上海留下的全部相关地址，再沿点位阅读其组织、职业和公共生活。</p>
          </div>
        </div>
        <div className="people-grid">
          {people.map(([name, years, role, quote], i) => (
            <button key={name} onClick={() => { setQuery(name); setCategory("全部"); setDistrict("全部"); setShowAll(true); goToSection("archive"); }}>
              <span className="person-no">{String(i + 1).padStart(2, "0")}</span>
              <div className="person-monogram">{name.replace(/\s/g, "").slice(0, 1)}</div>
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
            {routes.map((item, i) => <button key={item.name} className={route === i ? "active" : ""} onClick={() => setRoute(i)}><b>{String(i + 1).padStart(2, "0")}</b>{item.name}</button>)}
          </div>
          <div className="route-meta"><span>{routes[route].name}</span><b>{routes[route].meta}</b></div>
        </div>
        <div className="route-map">
          <div className="map-grid" aria-hidden="true" /><div className="route-line" aria-hidden="true" />
          {routeSites.map((site, i) => (
            <button key={site.id} className="route-stop" style={{
              "--x": `${14 + (i % 4) * 24}%`,
              "--y": `${18 + Math.floor(i / 4) * 48 + (i % 2) * 8}%`,
              "--x-sm": `${6 + (i % 2) * 48}%`,
              "--y-sm": `${6 + Math.floor(i / 2) * 22}%`,
            } as CSSProperties} onClick={() => openSite(site)}>
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
            <button key={item.district} onClick={() => { setCategory("全部"); setQuery(""); setDistrict(item.district); setShowAll(true); goToSection("archive"); }}>
              <span>{String(i + 1).padStart(2, "0")}</span><b>{item.district}</b><i style={{ width: `${Math.max(6, (item.count / maxDistrictCount) * 100)}%` }} /><em>{item.count}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="method">
        <div className="method-title"><div className="section-label light">KNOWLEDGE CONNECTION</div><h2>一处地址，<br />可以通向整部盟史。</h2></div>
        <div className="method-steps">
          <article><span>人物</span><h3>同一个人留下多处地址</h3><p>黄炎培连接川沙故居、浦东中学、中华职业教育社和民盟创建。</p></article>
          <article><span>事件</span><h3>同一事件穿过整座城市</h3><p>李闻惨案从昆明传到周公馆、天蟾舞台、静安寺与上海报刊。</p></article>
          <article><span>组织</span><h3>机关沿革就是组织成长</h3><p>从饭店顶楼到民主党派大厦，门牌记录公开程度与履职方式的变化。</p></article>
          <article><span>精神</span><h3>细节让选择变得可见</h3><p>205号病房、财产清单、讲台与剃去的长须，把历史还给具体的人。</p></article>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><b>盟迹</b><span>上海民盟历史知识库</span></div>
        <div className="footer-copy">民盟上海市委宣传部编<br />上海民盟历史点位、人物与故事资料库</div>
        <div className="footer-note">从一处地址进入一个人物，再从一个人物进入一段历史。知识库将持续补充史料、照片、口述与现场细节。</div>
      </footer>

      {selected && (
        <div className="drawer-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && closeSite()}>
          <aside ref={drawerRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <button ref={closeButtonRef} className="drawer-close" onClick={closeSite} aria-label="关闭">×</button>
            <div className="drawer-hero">
              <div className="drawer-badges"><span className={`tag ${catClass[selected.category]}`}>{selected.category}</span></div>
              <small>{selected.year}</small><h2 id="drawer-title">{selected.name}</h2><p>{selected.hook}</p>
            </div>
            <div className="drawer-address">
              <div><span>今址</span><b>{selected.district} · {selected.address}</b></div>
              {selected.old && <div><span>旧址</span><b>{selected.old}</b></div>}
            </div>
            <nav className="drawer-index" aria-label="档案章节">
              <button type="button" onClick={() => scrollDrawerTo("drawer-story")}>完整故事</button>
              {!!selected.architecture?.length && <button type="button" onClick={() => scrollDrawerTo("drawer-space")}>建筑空间</button>}
              {!!selected.people.length && <button type="button" onClick={() => scrollDrawerTo("drawer-people")}>相关人物</button>}
              <span>{selected.chapters?.reduce((sum, item) => sum + item.text.length, 0) || 0}字故事正文</span>
            </nav>
            <div className="drawer-body">
              <section className="archive-abstract">
                <label>档案摘要</label>
                <p>{selected.story}</p>
              </section>
              {!!selected.facts?.length && <section><label>关键事实</label><div className="fact-grid">{selected.facts.map((fact) => <span key={fact}>{fact}</span>)}</div></section>}
              {!!selected.architecture?.length && <section className="architecture-notes" id="drawer-space">
                <label>建筑与空间</label>
                {selected.architecture.map((note) => <article key={note.title}><h3>{note.title}</h3><p>{note.text}</p></article>)}
              </section>}
              <section className="story-chapters" id="drawer-story">
                <label>完整故事</label>
                {selected.chapters?.map((chapter, index) => <article key={chapter.title}><small>{String(index + 1).padStart(2, "0")}</small><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div></article>)}
              </section>
              {!!selected.people.length && <section id="drawer-people"><label>相关人物</label><div className="person-tags">{selected.people.map((p) => <button key={p} onClick={() => { closeSite(); setQuery(p); setCategory("全部"); setDistrict("全部"); setShowAll(true); }}>{p}</button>)}</div></section>}
              <section className="related-sites">
                <label>继续沿人物与事件阅读</label>
                <div>
                  {sites
                    .filter((item) => item.id !== selected.id && (item.people.some((person) => selected.people.includes(person)) || item.category === selected.category))
                    .slice(0, 3)
                    .map((item) => <button key={item.id} onClick={() => openSite(item)}><span>{item.category}</span><b>{item.name}</b><small>{item.district} · {item.address}</small></button>)}
                </div>
              </section>
              <section className="anchor-box"><label>故事线索</label><p>{selected.anchor}</p></section>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
