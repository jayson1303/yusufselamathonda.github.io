import subprocess
import os

img_path = r"D:\ajay\PROJECT YUSUF\pricelist opsi suransi cash\WhatsApp Image 2026-07-03 at 18.37.06.jpeg"

# Try using tesseract CLI directly if available
try:
    print("Trying tesseract CLI...")
    result = subprocess.run(["tesseract", img_path, "stdout", "-l", "ind"], capture_output=True, text=True)
    if result.returncode == 0:
        print("Tesseract CLI Output:")
        print(result.stdout)
    else:
        print(f"Tesseract returned code {result.returncode}")
        print("Stderr:", result.stderr)
except Exception as e:
    print("Tesseract CLI failed:", e)

# Try pytesseract
try:
    print("\nTrying pytesseract...")
    import pytesseract
    from PIL import Image
    text = pytesseract.image_to_string(Image.open(img_path), lang='ind')
    print("Pytesseract Output:")
    print(text)
except Exception as e:
    print("Pytesseract failed:", e)

# Try easyocr
try:
    print("\nTrying easyocr...")
    import easyocr
    reader = easyocr.Reader(['id', 'en'])
    result = reader.readtext(img_path, detail=0)
    print("EasyOCR Output:")
    print("\n".join(result))
except Exception as e:
    print("EasyOCR failed:", e)
