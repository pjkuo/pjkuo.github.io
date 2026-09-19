# -*- coding: utf-8 -*-
s = open('index.html', encoding='utf-8').read()
OLD = 'href="https://ai-empower-hub.netlify.app/"'
NEW = 'href="https://ai-empower-hub.pages.dev/"'
assert s.count(OLD) == 1
open('index.html', 'w', encoding='utf-8').write(s.replace(OLD, NEW))
print('OK')
