import os
import shutil

src_path = r"D:\ajay\PROJECT YUSUF\pricelist opsi suransi cash\WhatsApp Image 2026-07-03 at 18.37.06.jpeg"
dest_dir = r"C:\Users\THINKPAD T480\.gemini\antigravity-cli\brain\a2aa7b41-b60b-4034-a47e-62a8601c33de"

os.makedirs(dest_dir, exist_ok=True)
shutil.copy2(src_path, os.path.join(dest_dir, "insurance_terms.jpeg"))
print("Copied image to artifacts directory.")
