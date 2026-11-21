"""Cache-busting: stamp index.html's scripts and the asset URLs with a build version, so browsers (and GitHub Pages'
10-minute cache) always load the newest game after a push. Run before committing (slot-project-sync does).
  python3 tools/stamp_version.py
"""
import re, os, time
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
v = time.strftime('%Y%m%d%H%M')
p = os.path.join(root, 'index.html'); s = open(p).read()
s = re.sub(r'<script src="([^"?]+)(\?v=\w+)?"></script>', lambda m: f'<script src="{m.group(1)}?v={v}"></script>', s)
s = re.sub(r'<script>window\.BUILD_VERSION = \'\w+\';</script>\n', '', s)
s = s.replace('<script src="src/config.js', f"<script>window.BUILD_VERSION = '{v}';</script>\n<script src=\"src/config.js", 1)
open(p, 'w').write(s); print('build version', v)
