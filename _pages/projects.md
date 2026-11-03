---
layout: page
title: Projects
permalink: /projects/
description: Work undertaken to settle a question I could not answer by reading. Each write-up states its method, its results and its limitations.
nav: true
nav_order: 1
---

<div class="xp-grid" role="list">
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  {%- for project in sorted_projects -%}
  <a class="xp-card" role="listitem" href="{{ project.url | relative_url }}">
    <div class="xp-meta">
      <span class="xp-co">{{ project.slug }}</span>
      <span class="xp-dates">{{ project.period }}</span>
    </div>
    <h2 class="xp-role">{{ project.title }}</h2>
    <p class="xp-desc">{{ project.description }}</p>
    <div class="xp-foot">
      <span class="xp-loc">{{ project.stack }}</span>
      <span class="xp-idx">[{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}]</span>
    </div>
  </a>
  {%- endfor -%}
</div>
