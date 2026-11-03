---
layout: page
title: Experience
permalink: /experience/
description: Everywhere I have been able to learn
nav: false
---

<div class="xp-grid" role="list">
  {%- for exp in site.data.cv.cv.sections.Experience -%}
  <article class="xp-card" role="listitem">
    <div class="xp-meta">
      <span class="xp-co">{{ exp.company | split: ',' | first }}</span>
      <span class="xp-dates">{{ exp.start_date }} — {{ exp.end_date | default: 'present' }}</span>
    </div>
    <h2 class="xp-role">{{ exp.position }}</h2>
    <p class="xp-desc">{{ exp.brief | default: exp.highlights.first }}</p>
    <div class="xp-foot">
      <span class="xp-loc">{{ exp.location }}</span>
      <span class="xp-idx">[{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}]</span>
    </div>
  </article>
  {%- endfor -%}
</div>
