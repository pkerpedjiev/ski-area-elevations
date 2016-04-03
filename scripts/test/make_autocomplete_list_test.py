import make_autocomplete_list as mst
import sys

def test_make_autocomplete_list():
    data = [{'name': 'whose', 'importance': 3},
            {'name': 'approach', 'importance': 5},
            {'name': 'laced', 'importance': 2},
            {'name': 'cemetery', 'importance': 1}]

    #data = [{'name': 'whose', 'importance': 3}]

    
    class Options:
        def __init__(self, importance, name):
            self.importance = importance
            self.name = name
            self.max_entries_per_autocomplete = 1
            self.max_zoom = 3
            self.reverse_importance = True

    options = Options('importance', 'name')

    tiles = mst.make_autocomplete_list(data, options)

    assert('ose' in tiles)
    assert('met' in tiles)
    assert('ced' in tiles)

    assert(len(tiles['ced']) == 1)
    #print >>sys.stderr, "tiles:", tiles
