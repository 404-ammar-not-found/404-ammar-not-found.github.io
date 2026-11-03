---
layout: page
title: Publications
permalink: /publications/
description: Papers and accepted workshop write-ups
nav: false
---

<div class="xp-grid" role="list">
  {%- assign sorted_pubs = site.publications | sort: "importance" -%}
  {%- for pub in sorted_pubs -%}
  <article class="xp-card pub-card" role="listitem">
    <div class="pub-venue">
      <span>accepted at {{ pub.venue }}</span>
      {%- if pub.paper %}
      <a class="pub-paper" href="{{ pub.paper }}">paper ↗</a>
      {%- endif %}
    </div>
    <div class="xp-meta">
      <span class="xp-co">{{ pub.period }}</span>
      <span class="xp-dates">{{ pub.stack }}</span>
    </div>
    <h2 class="xp-role"><a class="pub-link" href="{{ pub.url | relative_url }}">{{ pub.title }}</a></h2>
    <p class="xp-desc">{{ pub.description }}</p>
    <div class="xp-foot">
      <span class="xp-loc">write-up + code</span>
      <span class="xp-idx">[{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}]</span>
    </div>
  </article>
  {%- endfor -%}
</div>
