import make_search_tiles as mst
import sys

def test_make_search_tiles():
    data = [{'name': 'whose', 'importance': 3},
            {'name': 'approach', 'importance': 5},
            {'name': 'laced', 'importance': 2},
            {'name': 'cemetery', 'importance': 1}]

    
    class Options:
        def __init__(self, importance, name):
            self.importance = importance
            self.name = name
            self.max_entries_per_tile = 1
            self.max_zoom = 3

    options = Options('importance', 'name')

    tiles = mst.make_search_tiles(data, options,0)
    print >>sys.stderr, "tiles:", tiles
