with open(r"D:\ajay\PROJECT YUSUF\build_site.py", 'r', encoding='utf-8') as f:
    lines = f.readlines()

def search_terms(terms):
    for term in terms:
        print(f"\n--- Search results for '{term}' ---")
        for i, line in enumerate(lines):
            if term.lower() in line.lower():
                print(f"Line {i+1}: {line.strip()}")

search_terms(["WHATSAPP_NUMBER", "youtube", "facebook", "instagram", "tiktok", "tentang", "asuransi", "cash", "hondacatalog"])
