import json
import sys
import os

def process_dictionary(input_file, output_file):
    print(f"Processing {input_file}...")
    
    words = set()
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            for line in f:
                word = line.strip().upper()
                # Filter: 3-15 chars, only A-Z
                if 3 <= len(word) <= 15 and word.isalpha():
                    words.add(word)
    except FileNotFoundError:
        print(f"Error: Input file {input_file} not found.")
        return

    sorted_words = sorted(list(words))
    print(f"Found {len(sorted_words)} valid words.")

    # For now, just dump as JSON. 
    # Later we can implement the DAWG compression here.
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(sorted_words, f)
    
    print(f"Written to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_dictionary.py <input_txt> <output_json>")
    else:
        process_dictionary(sys.argv[1], sys.argv[2])
