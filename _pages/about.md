---
layout: about
title: About
permalink: /
subtitle: BSc Computer Science and Mathematics, The University of Manchester

profile:
  align: right
  image: prof_pic.jpg
  image_circular: true # crops the image to make it circular
  more_info: >
    <p>The University of Manchester</p>
    <p>ammar.nagri1@gmail.com</p>

selected_papers: false # turn off until you have publication entries to highlight
social: true # includes social icons at the bottom of the page

announcements:
  enabled: false # no news items yet
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: false # no blog posts yet
  scrollable: true # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts
---

I am an undergraduate studying Computer Science and Mathematics at The University of Manchester. My interest is the theory of machine learning. I have recently taken more of an interest into diffusion models and neural ODE/SDEs. Outside of research, I like building products and useful tools for people to use. I have been exploring more into roles such as AI engineer.

[Email](mailto:ammar.nagri1@gmail.com) / [CV](/assets/pdf/CV.pdf) / [GitHub](https://github.com/404-ammar-not-found)

## Contact

I am looking for software engineer, ML engineer, research engineer or research scientist positions. My email address is above, and I am glad to discuss anything about machine learning or deep learning.

<div class="xp-header">
  <h2 class="xp-title">Experience</h2>
  <a class="xp-view-all" href="{{ '/experience/' | relative_url }}">View all →</a>
</div>

<div class="xp-strip" role="list">
  {%- for exp in site.data.cv.cv.sections.Experience -%}
  <article class="xp-card" role="listitem">
    <div class="xp-meta">
      <span class="xp-co">{{ exp.company | split: ',' | first }}</span>
      <span class="xp-dates">{{ exp.start_date }} — {{ exp.end_date | default: 'present' }}</span>
    </div>
    <h3 class="xp-role">{{ exp.position }}</h3>
    <p class="xp-desc">{{ exp.brief | default: exp.highlights.first }}</p>
    <div class="xp-foot">
      <span class="xp-loc">{{ exp.location }}</span>
      <span class="xp-idx">[{% if forloop.index < 10 %}0{% endif %}{{ forloop.index }}]</span>
    </div>
  </article>
  {%- endfor -%}
</div>

<div class="xp-header">
  <h2 class="xp-title">Publications</h2>
  <a class="xp-view-all" href="{{ '/publications/' | relative_url }}">View all →</a>
</div>

<div class="project-strip" role="list">
  {%- assign sorted_pubs = site.publications | sort: "importance" -%}
  {%- for pub in sorted_pubs -%}
  <a class="project-strip-card pub-card" role="listitem" href="{{ pub.url | relative_url }}">
    <canvas class="project-strip-viz" aria-hidden="true"></canvas>
    <span class="project-strip-body">
      <span class="pub-venue"><span>accepted at {{ pub.venue }}</span></span>
      <span class="project-strip-title">{{ pub.title }}</span>
      <span class="project-strip-desc">{{ pub.description }}</span>
    </span>
  </a>
  {%- endfor -%}
</div>

<div class="project-strip-header">
  <h2 class="xp-title">Projects</h2>
  <a class="project-strip-all" href="{{ '/projects/' | relative_url }}">View all →</a>
</div>

<div class="project-strip" role="list">
  {%- assign sorted_projects = site.projects | sort: "importance" -%}
  {%- for project in sorted_projects -%}
  <a class="project-strip-card" role="listitem" href="{{ project.url | relative_url }}">
    <canvas class="project-strip-viz" aria-hidden="true"></canvas>
    <span class="project-strip-body">
      <span class="project-strip-category">{{ project.category }}</span>
      <span class="project-strip-title">{{ project.title }}</span>
      <span class="project-strip-desc">{{ project.description }}</span>
    </span>
  </a>
  {%- endfor -%}
</div>

<script src="{{ '/assets/js/project-viz.js' | relative_url }}" defer></script>
