# Chris Hogan
# EECS 665
# Project 2
# 3 November 2014

import re
import sys

class LR0Items:

    def __init__(self):
        self.productions = [x.strip() for x in sys.stdin]
        self.aug_productions = [("'", "->%s" % self.productions[0])]
        regex = re.compile(r'([A-Z])->(.*)')
        for p in self.productions[1:]:
            m = regex.match(p)
            self.aug_productions.append((m.group(1), m.group(2)))

x = LR0Items()
print(x.aug_productions)
