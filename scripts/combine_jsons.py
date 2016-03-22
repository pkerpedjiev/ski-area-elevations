#!/usr/bin/python

import json
import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="""
    
    python combine_jsons.py file1.json [file2.json] ...

    Combine all of the jsons in one file.
""")

    parser.add_argument('jsons', nargs='+')
    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()
    combined = None

    for arg in args.jsons:
        with open(arg, 'r') as f:
            js = json.load(f)

            if combined is None:
                # we haven't loaded the first json
                combined = []

            if type(combined) != type(js):
                print >>sys.stderr, "Mismatched JSON types", type(combined), type(js)
                return

            if type(combined) == list:
                for j in js:
                    j['source'] = arg

                combined += js

            elif type(combined) == dict:
                combined = dict( combined.items() + js.items() )

    print json.dumps(combined, indent=2)

if __name__ == '__main__':
    main()


