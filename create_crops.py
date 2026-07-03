import os
from PIL import Image

image_dir = r"D:\ajay\PROJECT YUSUF\tambahan tentang kami"
orig_path = os.path.join(image_dir, "WhatsApp Image 2026-07-03 at 18.30.10.jpeg")

img = Image.open(orig_path)
width, height = img.size

# We will generate three crop options:
# Option A: 3:4 ratio, starting at y=240
# Box: (0, 240, 720, 1200) - Height is 960
box_a = (0, 240, 720, 1200)
crop_a = img.crop(box_a)
crop_a.save(os.path.join(image_dir, "crop_3_4_y240.jpeg"), quality=95)

# Option B: 4:5 ratio, starting at y=240
# Box: (0, 240, 720, 1140) - Height is 900
box_b = (0, 240, 720, 1140)
crop_b = img.crop(box_b)
crop_b.save(os.path.join(image_dir, "crop_4_5_y240.jpeg"), quality=95)

# Option C: 3:4 ratio, starting at y=200
# Box: (0, 200, 720, 1160) - Height is 960
box_c = (0, 200, 720, 1160)
crop_c = img.crop(box_c)
crop_c.save(os.path.join(image_dir, "crop_3_4_y200.jpeg"), quality=95)

# Option D: 4:5 ratio, starting at y=200
# Box: (0, 200, 720, 1100) - Height is 900
box_d = (0, 200, 720, 1100)
crop_d = img.crop(box_d)
crop_d.save(os.path.join(image_dir, "crop_4_5_y200.jpeg"), quality=95)

# Also let's copy these to the artifact directory so they are preserved and viewable if needed
dest_dir = r"C:\Users\THINKPAD T480\.gemini\antigravity-cli\brain\a2aa7b41-b60b-4034-a47e-62a8601c33de"
crop_a.save(os.path.join(dest_dir, "crop_3_4_y240.jpeg"), quality=95)
crop_b.save(os.path.join(dest_dir, "crop_4_5_y240.jpeg"), quality=95)
crop_c.save(os.path.join(dest_dir, "crop_3_4_y200.jpeg"), quality=95)
crop_d.save(os.path.join(dest_dir, "crop_4_5_y200.jpeg"), quality=95)

print("Crops generated successfully.")
