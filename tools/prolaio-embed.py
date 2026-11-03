"""Copies the Prolaio click-through prototype into embeds/prolaio-prototype/.

    python -I tools/prolaio-embed.py                       # the newest concepts-vNN.html
    python -I tools/prolaio-embed.py --page concepts-v05.html
    python -I tools/prolaio-embed.py --src PATH            # another copy of the client site

The prototype lives in the client site, under Concepts (concepts-v04.html, then
v05, v06...). This
takes only the prototype: the journey and the app beside it, with its scripts,
styles, icons and art. The site's top bar, hero, the link to the separate
interview prototype and the review feedback widget are left out, so nothing on
the copy calls Prolaio's site or Vercel. Run it again whenever a new prototype
version lands; it replaces the folder each time.

prolaio.html shows a screenshot and swaps this in on "Try the prototype", so
the hi-fi drawer books (which carry one file per embed) keep the screenshot.
"""
import argparse
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEFAULT_SRC = os.path.normpath(os.path.join(ROOT, '..', 'Prolaio_Gamification', 'p-participant-engagement'))
OUT = os.path.join(ROOT, 'embeds', 'prolaio-prototype')

FILES = ['styles.css', 'concepts.css', 'testing-prototype.css',
         'data.js', 'concepts-ui.js', 'testing-prototype-ui.js', 'testing-prototype.js']
DIRS = ['assets', 'theme-demo/icons', 'theme-demo/art']
THEME = ['prolaio-theme.css', 'type-scale.js', 'pr-transform.js', 'theme-demo-testing.js']

# the parts of the page to drop, each from its opening line to its closing tag
CUT = [
    (r'<header class="topbar">', r'</header>'),
    (r'<section class="hero[^"]*">', r'</section>'),
    (r'<a class="jr-more jr-alt" href="prototype-site"[^>]*>', r'</a>'),
    (r'<footer class="foot">', r'</footer>'),
]

EMBED_CSS = '''<style>
/* embedded in the portfolio's Prolaio case study (tools/prolaio-embed.py) */
#journey{padding-top:24px}
</style>'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', default=DEFAULT_SRC)
    ap.add_argument('--page', help='the concepts page holding the prototype (default: the newest concepts-vNN.html)')
    args = ap.parse_args()
    src = args.src
    pages = sorted(f for f in os.listdir(src) if re.fullmatch(r'concepts-v\d+\.html', f))
    PAGE = args.page or (pages[-1] if pages else '')
    page = os.path.join(src, PAGE)
    if not os.path.isfile(page):
        sys.exit(f'No {PAGE or "concepts-vNN.html"} in {src}')

    html = open(page, encoding='utf-8').read()
    for start, end in CUT:
        m = re.search(start, html)
        if not m:
            sys.exit(f'{PAGE} changed: no match for {start}. Update CUT in this script.')
        close = html.index(end, m.end()) + len(end)
        html = html[:m.start()] + html[close:]
    # the feedback widget and the site nav are the client site's, not the prototype's
    html = re.sub(r'\s*<link[^>]*/feedback/[^>]*>', '', html)
    html = re.sub(r'\s*<script[^>]*/feedback/[^>]*></script>', '', html)
    html = re.sub(r'\s*<script src="site-nav.js"></script>', '', html)
    # data.js sat in the removed top bar; the prototype still reads it
    html = html.replace('<script src="concepts-ui.js"></script>', '<script src="data.js"></script>\n<script src="concepts-ui.js"></script>')
    html = html.replace('</head>', EMBED_CSS + '\n</head>')
    html = re.sub(r'<title>[^<]*</title>', '<title>Prolaio prototype</title>', html)
    leftover = re.findall(r'(?:https?:)?//(?!fonts\.(?:googleapis|gstatic)\.com)[\w.-]+\.\w+[^"\s]*', html)
    if leftover:
        sys.exit(f'External links left in the copy: {leftover}')

    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'theme-demo'))
    for f in FILES:
        shutil.copy2(os.path.join(src, f), os.path.join(OUT, f))
    for f in THEME:
        shutil.copy2(os.path.join(src, 'theme-demo', f), os.path.join(OUT, 'theme-demo', f))
    for d in DIRS:
        shutil.copytree(os.path.join(src, d), os.path.join(OUT, d))
    # theme-demo's top-level svgs (logos, wave, error mark, notification sprite)
    for f in os.listdir(os.path.join(src, 'theme-demo')):
        if f.endswith('.svg'):
            shutil.copy2(os.path.join(src, 'theme-demo', f), os.path.join(OUT, 'theme-demo', f))
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)

    size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print(f'Copied the prototype from {PAGE} to {os.path.relpath(OUT, ROOT)} ({size / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
