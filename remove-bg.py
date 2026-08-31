import os
import sys
import glob
import json
import time
from PIL import Image
import rembg

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
FOTO_DIR = os.path.join(WORKSPACE_DIR, "Foto Produk")
PRODUCTS_JSON_PATH = os.path.join(WORKSPACE_DIR, "products.json")
DEFAULT_DATA_JS_PATH = os.path.join(WORKSPACE_DIR, "default-data.js")

def process_single_image(session, img_path):
    """Removes background from a single image and saves it as transparent PNG."""
    base_name, ext = os.path.splitext(img_path)
    if ext.lower() == ".png":
        return img_path, True
    
    png_path = base_name + ".png"
    
    # If PNG already exists and valid, skip
    if os.path.exists(png_path) and os.path.getsize(png_path) > 1000:
        return png_path, True

    try:
        with open(img_path, "rb") as f:
            input_bytes = f.read()
        
        # Remove background using rembg
        output_bytes = rembg.remove(
            input_bytes,
            session=session,
            alpha_matting=False,
            post_process_mask=True
        )
        
        with open(png_path, "wb") as f:
            f.write(output_bytes)
        
        return png_path, True
    except Exception as e:
        print(f"[ERROR] Failed to process {img_path}: {e}")
        return img_path, False

def update_json_and_data():
    """Updates products.json and default-data.js to reference the transparent .png files."""
    print("\nUpdating products.json and default-data.js...")
    
    # 1. Update products.json
    products = []
    if os.path.exists(PRODUCTS_JSON_PATH):
        with open(PRODUCTS_JSON_PATH, "r", encoding="utf-8") as f:
            products = json.load(f)
        
        for p in products:
            folder = p.get("folder", "")
            images = p.get("images", [])
            new_images = []
            for img in images:
                base_name, _ = os.path.splitext(img)
                png_name = base_name + ".png"
                full_png_path = os.path.join(FOTO_DIR, folder, png_name)
                if os.path.exists(full_png_path):
                    new_images.append(png_name)
                else:
                    new_images.append(img)
            p["images"] = new_images
            
            # Update variants if present
            if "variants" in p:
                for v in p["variants"]:
                    v_img = v.get("image", "")
                    if v_img:
                        v_base, _ = os.path.splitext(v_img)
                        v_png = v_base + ".png"
                        if os.path.exists(os.path.join(FOTO_DIR, folder, v_png)):
                            v["image"] = v_png
                            
        with open(PRODUCTS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print("Updated products.json successfully.")

    # 2. Update default-data.js directly without destroying script.js
    if os.path.exists(DEFAULT_DATA_JS_PATH) and products:
        with open(DEFAULT_DATA_JS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace DEFAULT_PRODUCTS section in default-data.js
        import re
        json_str = json.dumps(products, indent=2, ensure_ascii=False)
        pattern = r"export const DEFAULT_PRODUCTS = \[[\s\S]*?\];\n\nexport const DEFAULT_TESTIMONIALS"
        replacement = f"export const DEFAULT_PRODUCTS = {json_str};\n\nexport const DEFAULT_TESTIMONIALS"
        
        if re.search(pattern, content):
            new_content = re.sub(pattern, replacement, content)
            with open(DEFAULT_DATA_JS_PATH, "w", encoding="utf-8") as f:
                f.write(new_content)
            print("Updated default-data.js DEFAULT_PRODUCTS successfully.")
        else:
            print("[WARN] Could not find DEFAULT_PRODUCTS pattern in default-data.js.")

def main():
    start_time = time.time()
    print("Initializing rembg session...")
    session = rembg.new_session()
    
    image_files = []
    for ext in ["*.jpeg", "*.jpg", "*.JPG", "*.JPEG"]:
        image_files.extend(glob.glob(os.path.join(FOTO_DIR, "**", ext), recursive=True))
    
    print(f"Found {len(image_files)} product images to process in {FOTO_DIR}.")
    
    success_count = 0
    for idx, img_path in enumerate(image_files, 1):
        rel_path = os.path.relpath(img_path, WORKSPACE_DIR)
        print(f"[{idx}/{len(image_files)}] Processing {rel_path}...", end="", flush=True)
        _, success = process_single_image(session, img_path)
        if success:
            print(" Done.")
            success_count += 1
        else:
            print(" Failed.")
            
    print(f"\nCompleted background removal: {success_count}/{len(image_files)} images processed in {time.time() - start_time:.2f}s.")
    
    update_json_and_data()

if __name__ == "__main__":
    main()
