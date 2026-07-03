import os
from PIL import Image
import numpy as np

def crop_screenshot(img_path):
    print(f"Processing: {img_path}")
    img = Image.open(img_path)
    w, h = img.size
    
    # Convert to RGB array
    arr = np.array(img.convert('RGB'))
    
    # We ignore the top 12% and bottom 15% of the height to strip phone status bars/headers and bottom keyboard/UI
    y_start = int(h * 0.12)
    y_end = int(h * 0.85)
    
    middle_arr = arr[y_start:y_end, :, :]
    
    # Convert middle section to grayscale
    gray = np.mean(middle_arr, axis=2)
    
    # Find background color (most common color in corners of the middle section)
    corners = [gray[0, 0], gray[0, -1], gray[-1, 0], gray[-1, -1]]
    bg_color = np.median(corners)
    
    # Content pixels are those that differ significantly from background color
    # (using a threshold of 10 levels of gray)
    threshold = 10
    mask = np.abs(gray - bg_color) > threshold
    
    # Find the bounding box of content pixels
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        print(f"  Warning: No content found in {img_path}, skipping.")
        return False
        
    ymin, ymax = np.where(rows)[0][0] + y_start, np.where(rows)[0][-1] + y_start
    xmin, xmax = np.where(cols)[0][0], np.where(cols)[0][-1]
    
    # Add a small padding (20px) to keep some breathing room around the product
    padding = 20
    ymin = max(0, ymin - padding)
    ymax = min(h, ymax + padding)
    xmin = max(0, xmin - padding)
    xmax = min(w, xmax + padding)
    
    # Crop and save in-place
    cropped_img = img.crop((xmin, ymin, xmax, ymax))
    cropped_img.save(img_path, quality=95)
    print(f"  SUCCESS: Cropped to {cropped_img.size}")
    return True

def process_all_screenshots():
    foto_dir = r"D:\ajay\PROJECT YUSUF\Foto Produk"
    count = 0
    
    for root, dirs, files in os.walk(foto_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                path = os.path.join(root, f)
                try:
                    with Image.open(path) as img:
                        w, h = img.size
                        ratio = h / w
                    # If ratio > 1.35, it is a tall screenshot that needs cropping
                    if ratio > 1.35:
                        if crop_screenshot(path):
                            count += 1
                except Exception as e:
                    print(f"Error checking {path}: {e}")
                    
    print(f"\nCompleted! Cropped {count} new screenshot images.")

if __name__ == '__main__':
    process_all_screenshots()
