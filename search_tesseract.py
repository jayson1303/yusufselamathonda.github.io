import os

common_paths = [
    r"C:\Program Files\Tesseract-OCR",
    r"C:\Program Files (x86)\Tesseract-OCR",
    r"C:\laragon\bin\tesseract",
    r"C:\Users\THINKPAD T480\AppData\Local\Tesseract-OCR",
    r"C:\Users\THINKPAD T480\AppData\Local\Programs\Tesseract-OCR"
]

found = False
for p in common_paths:
    exec_path = os.path.join(p, "tesseract.exe")
    if os.path.exists(exec_path):
        print(f"Found Tesseract at: {exec_path}")
        found = True

if not found:
    print("Tesseract was not found in common paths. Searching C:\\Program Files and C:\\laragon...")
    # Let's search Program Files and Laragon (up to 3 levels deep)
    search_dirs = [r"C:\Program Files", r"C:\Program Files (x86)", r"C:\laragon"]
    for sd in search_dirs:
        if os.path.exists(sd):
            for root, dirs, files in os.walk(sd):
                # limit depth to 3
                depth = root.replace(sd, "").count(os.sep)
                if depth > 3:
                    continue
                if "tesseract.exe" in files:
                    print(f"Found Tesseract at: {os.path.join(root, 'tesseract.exe')}")
                    found = True
                    break
            if found:
                break

if not found:
    print("Tesseract not found.")
